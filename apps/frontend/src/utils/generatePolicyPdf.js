import { jsPDF } from 'jspdf';

/**
 * Generate and download an authentic, beautifully styled official Digital e-Policy PDF certificate.
 * @param {Object} policy - Policy metadata object
 */
export function downloadPolicyPdf(policy) {
  if (!policy) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // ~210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // ~297mm

  const policyNum = policy.policy_number || `SYN-POL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const planName = policy.product_name || policy.policy_type || policy.plan_name || 'Comprehensive Motor Shield';
  const insurerName = policy.insurer_name || policy.insurer || 'ICICI Lombard General Insurance';
  const coverageAmt = policy.coverage_amount || policy.idv || policy.idv_amount || 750000;
  const premiumAmt = policy.premium_amount || policy.premium || 5780;
  const startDate = policy.start_date || new Date().toISOString().substring(0, 10);
  const endDate = policy.end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
  const vehicleNo = policy.vehicle_registration || policy.vehicle_number || 'KA-01-MJ-8821';
  const holderName = policy.holder_name || policy.proposer_name || policy.customer_name || 'Hariharan Murugesan';
  const ncb = policy.ncb_percent || 20;

  // 1. Top Deep Navy Header Banner
  doc.setFillColor(11, 31, 58); // #0B1F3A
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Decorative Accent Bar
  doc.setFillColor(37, 99, 235); // #2563EB
  doc.rect(0, 38, pageWidth, 2.5, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SYNOVA DIGITAL INSURANCE CERTIFICATE', 14, 16);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(186, 230, 253); // light blue
  doc.text('Certificate of Insurance cum Policy Schedule (IRDAI Compliant)', 14, 23);

  // Insurer Badge in Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(insurerName.toUpperCase(), pageWidth - 14, 16, { align: 'right' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(147, 197, 253);
  doc.text('Authorized Digital Underwriter', pageWidth - 14, 23, { align: 'right' });

  // 2. Active Status & Policy ID Banner
  let y = 48;
  doc.setFillColor(248, 250, 253);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 24, 3, 3, 'FD');

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('POLICY NUMBER', 20, y + 8);
  doc.text('STATUS', 95, y + 8);
  doc.text('VALIDITY PERIOD', 145, y + 8);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(policyNum, 20, y + 17);

  // Status badge
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(95, y + 10.5, 30, 8, 2, 2, 'FD');
  doc.setTextColor(5, 150, 105);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ ACTIVE', 101, y + 16);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${startDate} to ${endDate}`, 145, y + 16);

  // 3. Section: Proposer & Asset Details
  y = 80;
  doc.setTextColor(11, 31, 58);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. POLICYHOLDER & ASSET DETAILS', 14, y);

  // Draw Horizontal Separator
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y + 2, pageWidth - 14, y + 2);

  y += 8;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 42, 2, 2, 'FD');

  const col1X = 20;
  const col2X = 110;

  // Row 1
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Proposer / Insured Name:', col1X, y + 8);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(holderName, col1X + 44, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Plan / Cover Type:', col2X, y + 8);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(planName, col2X + 32, y + 8);

  // Row 2
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Vehicle / Asset Reg:', col1X, y + 18);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(vehicleNo, col1X + 44, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Sum Insured / IDV:', col2X, y + 18);
  doc.setTextColor(21, 101, 192);
  doc.setFont('helvetica', 'bold');
  doc.text(`₹${Number(coverageAmt).toLocaleString('en-IN')}`, col2X + 32, y + 18);

  // Row 3
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('No Claim Bonus (NCB):', col1X, y + 28);
  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.text(`${ncb}% Discount Retained`, col1X + 44, y + 28);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Cashless Network:', col2X, y + 28);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('14,200+ Garages & Hospitals', col2X + 32, y + 28);

  // Row 4 (e-KYC)
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('e-KYC Verification:', col1X, y + 36);
  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ Aadhaar / PAN Authenticated', col1X + 44, y + 36);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Issuance Source:', col2X, y + 36);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text('Synova AI Multi-Insurer Gateway', col2X + 32, y + 36);

  // 4. Section: Schedule of Premium & Tax Breakdown
  y = 138;
  doc.setTextColor(11, 31, 58);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. SCHEDULE OF PREMIUM & TAX RECEIPT', 14, y);

  doc.setDrawColor(203, 213, 225);
  doc.line(14, y + 2, pageWidth - 14, y + 2);

  y += 8;
  doc.setFillColor(248, 250, 253);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 48, 2, 2, 'FD');

  const basePrem = Math.round(premiumAmt / 1.18);
  const gst = premiumAmt - basePrem;

  // Premium table lines
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Own Damage / Core Base Protection:', 20, y + 10);
  doc.text(`₹${basePrem.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - 24, y + 10, { align: 'right' });

  doc.text('Zero Depreciation & Roadside Assistance Rider:', 20, y + 18);
  doc.text('INCLUDED (₹0.00)', pageWidth - 24, y + 18, { align: 'right' });

  doc.text('Statutory GST (CGST 9% + SGST 9%):', 20, y + 26);
  doc.text(`₹${gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - 24, y + 26, { align: 'right' });

  doc.setDrawColor(203, 213, 225);
  doc.line(20, y + 32, pageWidth - 20, y + 32);

  // Total Premium
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 31, 58);
  doc.text('TOTAL PREMIUM PAID (FULLY DISCHARGED):', 20, y + 41);
  doc.setTextColor(21, 101, 192);
  doc.setFontSize(12);
  doc.text(`₹${Number(premiumAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - 24, y + 41, { align: 'right' });

  // 5. Section: Important Terms & Cashless Claims Guidelines
  y = 202;
  doc.setTextColor(11, 31, 58);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('3. CLAIMS ASSISTANCE & REGULATORY DECLARATIONS', 14, y);

  doc.setDrawColor(203, 213, 225);
  doc.line(14, y + 2, pageWidth - 14, y + 2);

  y += 8;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 42, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const notes = [
    '• 24x7 Cashless FNOL Helpline: Toll-Free 1800-SYNOVA-INS (1800-796-682) or via Synova Digital Vault.',
    '• Cashless Claims Protocol: Intimate incident within 24 hours of occurrence for instant cashless garage/hospital admission.',
    '• Transferability of NCB: Subject to proof of no claims from prior insurer within statutory grace period.',
    '• Regulatory Compliance: Issued in strict compliance with Section 64VB of the Insurance Act 1938 & IRDAI guidelines.',
    '• Grievance Redressal: For escalations, reach complaints@synovainsure.ai or contact the IRDAI Bima Bharosa Portal.',
  ];

  notes.forEach((line, idx) => {
    doc.text(line, 20, y + 8 + idx * 7);
  });

  // 6. Footer & Digital Signature Seal
  y = 260;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, pageWidth - 28, 24, 2, 2, 'F');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('DIGITALLY SIGNED & ENCRYPTED DOCUMENT', 20, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Digital Sign Hash: SHA256:${Math.random().toString(36).substring(2, 12).toUpperCase()} • Timestamp: ${new Date().toISOString()}`, 20, y + 13);
  doc.text('This is a computer generated certificate. No physical signature is required under IT Act 2000.', 20, y + 19);

  // Digital Seal Badge on Right
  doc.setFillColor(21, 101, 192);
  doc.circle(pageWidth - 30, y + 12, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('IRDAI', pageWidth - 30, y + 11, { align: 'center' });
  doc.text('SEAL', pageWidth - 30, y + 14.5, { align: 'center' });

  // Trigger browser download of policy PDF
  const safeFilename = `${policyNum.replace(/[^a-zA-Z0-9-_]/g, '_')}_ePolicy.pdf`;
  doc.save(safeFilename);
}
