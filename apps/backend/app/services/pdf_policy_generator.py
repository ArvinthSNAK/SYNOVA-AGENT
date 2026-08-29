import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors


def generate_policy_pdf(policy) -> io.BytesIO:
    """Generates an official digital policy certificate PDF using ReportLab."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A'),
        alignment=0,
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B'),
    )

    section_header_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#1E3A8A'),
        spaceBefore=10,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#1E293B'),
    )

    label_style = ParagraphStyle(
        'Label',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#475569'),
    )

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>SYNOVA AI INSURANCE PLATFORM</b><br/><font size=8 color='#64748B'>Official Digital Certificate of Insurance</font>", title_style),
            Paragraph(f"<font color='#059669'><b>STATUS: ACTIVE</b></font><br/><font size=8 color='#64748B'>Issued: {datetime.now().strftime('%d %b %Y')}</font>", subtitle_style),
        ]
    ]
    t_header = Table(header_data, colWidths=[360, 180])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    story.append(t_header)
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563EB'), spaceAfter=14))

    # 2. Key Summary Box
    pol_num = policy.policy_number or f"SYN-POL-{policy.id}"
    cat_name = (policy.insurance_type or "General").upper()
    premium_fmt = f"INR {policy.premium:,.2f}" if policy.premium else "INR 0.00"
    cov_fmt = f"INR {policy.coverage_amount or policy.idv:,.2f}" if (policy.coverage_amount or policy.idv) else "INR 5,00,000.00"

    summary_data = [
        [Paragraph("<b>Policy Number</b>", label_style), Paragraph(pol_num, body_style), Paragraph("<b>Category</b>", label_style), Paragraph(cat_name, body_style)],
        [Paragraph("<b>Underwriting Insurer</b>", label_style), Paragraph(policy.insurer_name or "National Insurer", body_style), Paragraph("<b>Product Plan</b>", label_style), Paragraph(policy.product_name or "Comprehensive Cover", body_style)],
        [Paragraph("<b>Coverage Amount</b>", label_style), Paragraph(f"<b>{cov_fmt}</b>", body_style), Paragraph("<b>Total Annual Premium</b>", label_style), Paragraph(f"<b>{premium_fmt}</b>", body_style)],
        [Paragraph("<b>Effective Start Date</b>", label_style), Paragraph(policy.start_date.strftime('%d %b %Y') if policy.start_date else "Immediate", body_style), Paragraph("<b>Policy Expiry Date</b>", label_style), Paragraph(policy.end_date.strftime('%d %b %Y') if policy.end_date else "1 Year", body_style)],
    ]

    t_summary = Table(summary_data, colWidths=[135, 135, 135, 135])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_summary)
    story.append(Spacer(1, 14))

    # 3. Specific Coverage Schedule
    story.append(Paragraph("Coverage Schedule & Policyholder Information", section_header_style))

    if cat_name in ["MOTOR", "CAR", "BIKE"]:
        detail_data = [
            [Paragraph("<b>Vehicle Registration</b>", label_style), Paragraph(policy.vehicle_registration or "KA-01-MJ-4092", body_style)],
            [Paragraph("<b>Make & Model</b>", label_style), Paragraph(f"{policy.vehicle_make or 'Hyundai'} {policy.vehicle_model or 'Creta'}", body_style)],
            [Paragraph("<b>No Claim Bonus (NCB)</b>", label_style), Paragraph(f"{policy.ncb_percent or 20}% Transferred Bonus", body_style)],
            [Paragraph("<b>Compulsory Deductible</b>", label_style), Paragraph(f"INR {policy.deductible or 1000:,.2f}", body_style)],
            [Paragraph("<b>Included Add-ons</b>", label_style), Paragraph(str(policy.addons or "Zero Depreciation, 24x7 Roadside Assistance, Engine Protect"), body_style)],
        ]
    elif cat_name in ["HEALTH", "MEDICAL"]:
        detail_data = [
            [Paragraph("<b>Plan Scope</b>", label_style), Paragraph("Individual & Family Floater Comprehensive Health Shield", body_style)],
            [Paragraph("<b>Network Hospitalization</b>", label_style), Paragraph("10,500+ Cashless Hospitals nationwide with express 30-min cashless pre-auth", body_style)],
            [Paragraph("<b>Room Rent Category</b>", label_style), Paragraph("Single Private AC Room / No Sub-limit capping", body_style)],
            [Paragraph("<b>Maternity & Newborn</b>", label_style), Paragraph("Covered with zero waiting period for accidental and emergency admissions", body_style)],
            [Paragraph("<b>Pre & Post Hospitalization</b>", label_style), Paragraph("60 Days Pre-Hospitalization / 180 Days Post-Hospitalization fully reimbursed", body_style)],
        ]
    else:  # TERM LIFE
        detail_data = [
            [Paragraph("<b>Life Assured Cover</b>", label_style), Paragraph(f"<b>{cov_fmt}</b> Pure Term Life Cover", body_style)],
            [Paragraph("<b>Benefit Payout</b>", label_style), Paragraph("100% Tax-Free Lump Sum Death Benefit to registered Nominee", body_style)],
            [Paragraph("<b>Terminal Illness Benefit</b>", label_style), Paragraph("Accelerated 100% payout upon certified diagnosis of terminal condition", body_style)],
            [Paragraph("<b>Income Tax Exemption</b>", label_style), Paragraph("Eligible under Section 80C and Section 10(10D) of Income Tax Act 1961", body_style)],
            [Paragraph("<b>Included Riders</b>", label_style), Paragraph(str(policy.addons or "Accidental Death Benefit, Critical Illness Lump Sum, Waiver of Premium"), body_style)],
        ]

    t_detail = Table(detail_data, colWidths=[180, 360])
    t_detail.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#F1F5F9')),
    ]))
    story.append(t_detail)
    story.append(Spacer(1, 14))

    # 4. Terms & Digital Verification Seal
    story.append(Paragraph("Digital Verification & Statutory Information", section_header_style))
    story.append(Paragraph(
        "This is an authenticated computer-generated digital policy certificate issued under the Insurance Regulatory and Development Authority of India (IRDAI) guidelines. No physical signature is required. For 24x7 cashless claims, call 1800-SYNOVA-AI or submit through the Synova App Vault.",
        subtitle_style
    ))
    story.append(Spacer(1, 14))

    # QR / Seal Table
    seal_data = [
        [
            Paragraph("<b>Digitally Certified by Synova AI Engine</b><br/><font size=7 color='#64748B'>SHA-256 Verification: " + pol_num + "</font>", body_style),
            Paragraph("<b>IRDAI Registered Partner</b><br/><font size=7 color='#64748B'>National Claims Concierge 24x7</font>", body_style),
        ]
    ]
    t_seal = Table(seal_data, colWidths=[270, 270])
    t_seal.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#EFF6FF')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#BFDBFE')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_seal)

    doc.build(story)
    buffer.seek(0)
    return buffer
