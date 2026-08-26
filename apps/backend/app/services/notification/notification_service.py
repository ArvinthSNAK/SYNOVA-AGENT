"""
Notification Service.

Pluggable notification and email delivery service supporting:
- Standard SMTP (Gmail, Outlook, Amazon SES SMTP, Custom SMTP)
- SendGrid REST API
- Mock/Console delivery fallback for local dev

Identifies customers who could benefit from new products and sends email alerts.
"""
import smtplib
import json
import urllib.request
import urllib.error
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.notification_model import Notification
from app.models.policy_model import Policy
from app.models.insurance_product_model import InsuranceProduct
from app.models.user_model import User


class EmailProvider:
    @staticmethod
    def send_email(to_email: str, subject: str, body_text: str, body_html: Optional[str] = None) -> tuple[bool, str]:
        """
        Sends an email using configured provider (SMTP, SendGrid, or Mock).
        Returns (success: bool, detail: str).
        """
        # 1. SendGrid Provider
        if settings.SENDGRID_API_KEY:
            try:
                payload = {
                    "personalizations": [{"to": [{"email": to_email}]}],
                    "from": {"email": settings.SENDGRID_FROM_EMAIL or "noreply@synovainsurance.com", "name": "SYNOVA Insurance Agent"},
                    "subject": subject,
                    "content": [
                        {"type": "text/plain", "value": body_text},
                        {"type": "text/html", "value": body_html or f"<pre>{body_text}</pre>"},
                    ],
                }
                req = urllib.request.Request(
                    "https://api.sendgrid.com/v3/mail/send",
                    data=json.dumps(payload).encode("utf-8"),
                    headers={
                        "Authorization": f"Bearer {settings.SENDGRID_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=10) as resp:
                    if resp.status in (200, 202):
                        return True, f"Sent via SendGrid (Status {resp.status})"
            except Exception as e:
                print(f"[SendGrid Error] {e}")
                # Fall through to SMTP or Mock

        # 2. SMTP Provider
        if settings.SMTP_HOST:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = settings.SMTP_FROM_EMAIL
                msg["To"] = to_email

                part1 = MIMEText(body_text, "plain")
                msg.attach(part1)
                if body_html:
                    part2 = MIMEText(body_html, "html")
                    msg.attach(part2)

                if settings.SMTP_PORT == 465:
                    server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
                else:
                    server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
                    if settings.SMTP_USE_TLS:
                        server.starttls()

                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)

                server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], msg.as_string())
                server.quit()
                return True, f"Sent via SMTP ({settings.SMTP_HOST})"
            except Exception as e:
                print(f"[SMTP Error] {e}")
                return False, f"SMTP Error: {str(e)}"

        # 3. Development Mock Delivery
        print(f"\n==========================================")
        print(f"[MOCK EMAIL DISPATCH]")
        print(f"TO: {to_email}")
        print(f"FROM: {settings.SMTP_FROM_EMAIL}")
        print(f"SUBJECT: {subject}")
        print(f"BODY:\n{body_text}")
        print(f"==========================================\n")
        return True, "Delivered via Mock Provider (logged to console & DB)"


class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def notify_eligible_customers_for_new_product(self, product_id: int) -> list[dict]:
        product = self.db.query(InsuranceProduct).filter(InsuranceProduct.id == product_id).first()
        if product is None:
            return []

        eligible_policies = (
            self.db.query(Policy)
            .filter(
                Policy.insurance_type == product.insurance_type,
                Policy.active == True,
            )
            .all()
        )

        notifications_created = []
        seen_customers = set()

        for policy in eligible_policies:
            if policy.customer_id in seen_customers:
                continue
            seen_customers.add(policy.customer_id)

            benefit_reasons = self._check_benefit(policy, product)
            if not benefit_reasons:
                continue

            customer = self.db.query(User).filter(User.id == policy.customer_id).first()
            customer_email = customer.email if customer else "customer@example.com"
            customer_name = customer.full_name if customer and customer.full_name else "Valued Customer"

            subject = f"🌟 Better Insurance Coverage Alert: {product.name}"
            body_text = self._build_plain_message(customer_name, policy, product, benefit_reasons)
            body_html = self._build_html_message(customer_name, policy, product, benefit_reasons)

            # Send Email
            success, detail = EmailProvider.send_email(
                to_email=customer_email,
                subject=subject,
                body_text=body_text,
                body_html=body_html,
            )

            notification = Notification(
                customer_id=policy.customer_id,
                notification_type="NEW_BETTER_POLICY",
                subject=subject,
                message=body_text,
                metadata_json={
                    "product_id": product_id,
                    "product_name": product.name,
                    "policy_id": policy.id,
                    "benefit_reasons": benefit_reasons,
                    "dispatch_detail": detail,
                },
                status="sent" if success else "failed",
                sent_at=datetime.utcnow() if success else None,
            )
            self.db.add(notification)
            notifications_created.append({
                "customer_id": policy.customer_id,
                "email": customer_email,
                "subject": subject,
                "reasons": benefit_reasons,
                "status": "sent" if success else "failed",
                "detail": detail,
            })

        if notifications_created:
            self.db.commit()

        return notifications_created

    def send_custom_notification(
        self,
        customer_id: int,
        notification_type: str,
        subject: str,
        message: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> dict:
        customer = self.db.query(User).filter(User.id == customer_id).first()
        to_email = customer.email if customer else "customer@example.com"

        success, detail = EmailProvider.send_email(
            to_email=to_email,
            subject=subject,
            body_text=message,
            body_html=f"<div style='font-family: sans-serif; padding: 20px;'><h2>{subject}</h2><p>{message}</p></div>",
        )

        notif = Notification(
            customer_id=customer_id,
            notification_type=notification_type,
            subject=subject,
            message=message,
            metadata_json=metadata or {},
            status="sent" if success else "failed",
            sent_at=datetime.utcnow() if success else None,
        )
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(notif)
        return {
            "id": notif.id,
            "status": notif.status,
            "detail": detail,
            "to_email": to_email,
        }

    def _check_benefit(self, policy: Policy, product: InsuranceProduct) -> list[str]:
        reasons = []
        if product.base_premium and policy.premium:
            if product.base_premium < policy.premium * 0.95:
                diff = policy.premium - product.base_premium
                reasons.append(f"Save up to ₹{diff:,.0f}/year on annual premium")

        if hasattr(product, "coverage_limit") and product.coverage_limit:
            if policy.coverage_amount and product.coverage_limit > policy.coverage_amount:
                reasons.append(f"Higher coverage: ₹{product.coverage_limit:,.0f} vs current ₹{policy.coverage_amount:,.0f}")

        if hasattr(product, "idv_range_max") and product.idv_range_max:
            if policy.idv and product.idv_range_max > policy.idv:
                reasons.append("Higher vehicle IDV valuation available")

        if not reasons:
            reasons.append("Enhanced add-ons and zero-depreciation coverage options available")

        return reasons

    def _build_plain_message(self, name: str, policy: Policy, product: InsuranceProduct, reasons: list[str]) -> str:
        lines = [
            f"Dear {name},",
            f"",
            f"SYNOVA AI continuous monitoring has detected a new insurance product that offers better terms than your current policy:",
            f"",
            f"NEW PRODUCT: {product.name}",
            f"Type: {product.insurance_type.upper()}",
            f"",
            f"YOUR CURRENT POLICY:",
            f"  Insurer: {policy.insurer_name or 'N/A'}",
            f"  Policy No: {policy.policy_number or 'N/A'}",
            f"  Premium: ₹{policy.premium:,.0f}" if policy.premium else "  Premium: N/A",
            f"  IDV: ₹{policy.idv:,.0f}" if policy.idv else "  IDV: N/A",
            f"",
            f"KEY ADVANTAGES:",
        ]
        for r in reasons:
            lines.append(f"  ✓ {r}")
        lines.append("")
        lines.append("Log in to your Synova Insurance Vault to compare options and switch seamlessly.")
        return "\n".join(lines)

    def _build_html_message(self, name: str, policy: Policy, product: InsuranceProduct, reasons: list[str]) -> str:
        reasons_html = "".join([f"<li style='margin-bottom: 8px; color: #10B981;'><strong>✓</strong> {r}</li>" for r in reasons])
        return f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #F8FAFC; border-radius: 12px; overflow: hidden; border: 1px solid #1E293B;">
            <div style="background: linear-gradient(135deg, #2563EB, #7C3AED); padding: 24px 32px;">
                <h1 style="margin: 0; color: #FFFFFF; font-size: 20px; letter-spacing: 0.5px;">SYNOVA AI Insurance</h1>
                <p style="margin: 4px 0 0; color: #E2E8F0; font-size: 13px;">Continuous Portfolio Optimization</p>
            </div>
            <div style="padding: 28px 32px;">
                <p style="font-size: 15px; color: #94A3B8;">Dear <strong>{name}</strong>,</p>
                <p style="font-size: 15px; color: #CBD5E1; line-height: 1.6;">Our continuous market engine detected a newly published plan that may provide superior coverage for your <strong>{policy.vehicle_make or ''} {policy.vehicle_model or 'policy'}</strong>:</p>
                
                <div style="background: #1E293B; border-radius: 8px; padding: 18px; margin: 20px 0; border: 1px solid #334155;">
                    <div style="font-size: 16px; font-weight: bold; color: #60A5FA; margin-bottom: 12px;">{product.name}</div>
                    <table style="width: 100%; font-size: 13px; color: #CBD5E1; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #334155;">
                            <td style="padding: 6px 0; color: #94A3B8;">Current Premium:</td>
                            <td style="padding: 6px 0; text-align: right; font-weight: bold;">₹{policy.premium:,.0f}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #94A3B8;">Current Insurer:</td>
                            <td style="padding: 6px 0; text-align: right;">{policy.insurer_name}</td>
                        </tr>
                    </table>
                </div>

                <div style="margin: 20px 0;">
                    <h4 style="margin: 0 0 10px; color: #F8FAFC; font-size: 14px;">Identified Upgrades:</h4>
                    <ul style="padding-left: 20px; margin: 0; font-size: 14px;">
                        {reasons_html}
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="http://localhost:5173/vault" style="background: #2563EB; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 600; display: inline-block;">View in Synova Vault</a>
                </div>
            </div>
            <div style="background: #0B1120; padding: 16px 32px; text-align: center; font-size: 12px; color: #64748B;">
                © 2026 Synova AI Insurance Platform • Automated Market Radar
            </div>
        </div>
        """

    def get_notifications_for_customer(self, customer_id: int) -> list[dict]:
        notifications = (
            self.db.query(Notification)
            .filter(Notification.customer_id == customer_id, Notification.active == True)
            .order_by(Notification.created_at.desc())
            .limit(50)
            .all()
        )
        return [
            {
                "id": n.id,
                "type": n.notification_type,
                "subject": n.subject,
                "message": n.message,
                "status": n.status,
                "metadata": n.metadata_json or {},
                "created_at": n.created_at.isoformat() if n.created_at else None,
                "sent_at": n.sent_at.isoformat() if n.sent_at else None,
            }
            for n in notifications
        ]
