import React from 'react';
import InsurerLogoBadge from '../common/InsurerLogoBadge';
import { Scale, Info, ShieldCheck, Car, HeartPulse, Shield, AlertTriangle } from 'lucide-react';

export default function PolicyComparisonModal({ products, onClose, onRemove, onBuyNow }) {
  if (!products || products.length === 0) return null;

  const formatCurrency = (val) => {
    if (!val) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const rawCat = (products[0]?.insurance_type || products[0]?.category || 'motor').toLowerCase();
  const isHealth = rawCat.includes('health') || rawCat.includes('med');
  const isTerm = rawCat.includes('term') || rawCat.includes('life');
  const isMotor = !isHealth && !isTerm;
  const categoryTitle = isHealth ? 'Health Insurance' : isTerm ? 'Term Life Insurance' : 'Motor Insurance';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 24,
          maxWidth: 1100,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 32px 18px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Scale size={24} color="#2563EB" /> Side-by-Side Comparison ({products.length} Selected)
              </h2>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: isHealth ? '#ECFDF5' : isTerm ? '#F5F3FF' : '#EFF6FF',
                  color: isHealth ? '#047857' : isTerm ? '#6D28D9' : '#1D4ED8',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {isHealth ? <HeartPulse size={12} /> : isTerm ? <Shield size={12} /> : <Car size={12} />}
                {categoryTitle}
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#6B6B6B', margin: '4px 0 0' }}>
              Compare coverage, premium, insurer credibility, and category-specific policy benefits.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 18,
              color: '#6B6B6B',
            }}
          >
            ✕
          </button>
        </div>

        {/* Same-Category Comparison Disclaimer Banner */}
        <div
          style={{
            margin: '16px 28px 0',
            padding: '12px 18px',
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            fontSize: 12.5,
            color: '#1C1C1C',
            lineHeight: 1.5,
          }}
        >
          <Info size={18} color="#2563EB" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong style={{ color: '#0F172A' }}>Category Policy Disclaimer:</strong> Only <strong>{categoryTitle}</strong> plans are shown for side-by-side spec evaluation. Cross-category comparison (e.g. Motor vs Health vs Term Life) is strictly prohibited because insurance classes have distinct evaluation metrics (such as Vehicle IDV vs Cashless Hospital Network vs Life Cover).
          </div>
        </div>

        {/* Comparison Table */}
        <div style={{ padding: 24, overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '16px 20px',
                    width: 220,
                    background: '#F8FAFC',
                    borderBottom: '2px solid #E2E8F0',
                    color: '#6B6B6B',
                    fontWeight: 700,
                  }}
                >
                  Feature / Parameter
                </th>
                {products.map((p) => (
                  <th
                    key={p.id}
                    style={{
                      textAlign: 'left',
                      padding: '16px 20px',
                      borderBottom: '2px solid #E2E8F0',
                      verticalAlign: 'top',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <InsurerLogoBadge insurerName={p.insurer_name} size={32} rounded={8} />
                        <div style={{ fontSize: 12, color: '#0F172A', fontWeight: 700 }}>{p.insurer_name}</div>
                      </div>
                      {products.length > 2 && (
                        <button
                          onClick={() => onRemove && onRemove(p.id)}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: '#9A9A9A',
                            cursor: 'pointer',
                            fontSize: 14,
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginTop: 8 }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#2563EB', marginTop: 8 }}>
                      {formatCurrency(p.premium)}
                      <span style={{ fontSize: 12, color: '#6B6B6B', fontWeight: 500 }}>/{p.premium_frequency || 'yr'}</span>
                    </div>
                    <button
                      onClick={() => onBuyNow && onBuyNow(p)}
                      style={{
                        marginTop: 12,
                        width: '100%',
                        padding: '8px 16px',
                        background: '#2563EB',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      Buy Now
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Coverage Amount */}
              <tr>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1E293B', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {isMotor ? 'IDV Cover Value' : isTerm ? 'Life Sum Assured' : 'Sum Insured Coverage'}
                </td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '14px 20px', fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #E2E8F0' }}>
                    {formatCurrency(p.coverage_amount || 720000)}
                  </td>
                ))}
              </tr>

              {/* Rating & CSR */}
              <tr>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1E293B', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  Claim Settlement & Rating
                </td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0' }}>
                    <span style={{ color: '#F59E0B', fontWeight: 700 }}>★ {p.rating || 4.8}</span>
                    <span style={{ color: '#6B6B6B', margin: '0 6px' }}>•</span>
                    <span style={{ color: '#10B981', fontWeight: 700 }}>{p.claim_settlement_ratio || '98.4%'} CSR</span>
                  </td>
                ))}
              </tr>

              {/* Cashless Garages or Hospitals */}
              <tr>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1E293B', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {isMotor ? 'Cashless Garages' : isTerm ? 'Medical Centers / Digital KYC' : 'Cashless Hospitals Network'}
                </td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0', color: '#0F172A', fontWeight: 600 }}>
                    {isMotor
                      ? (p.cashless_garages_count ? `${p.cashless_garages_count.toLocaleString()}+ Garages` : '7,500+ Authorized Garages')
                      : isTerm
                      ? '100% Instant Digital Issue (No Medicals up to ₹2 Cr)'
                      : (p.cashless_hospitals_count ? `${p.cashless_hospitals_count.toLocaleString()}+ Hospitals` : '10,000+ Network Hospitals')}
                  </td>
                ))}
              </tr>

              {/* Category Specific Metric 1 */}
              <tr>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1E293B', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {isMotor ? 'Zero Depreciation Cover' : isTerm ? 'Critical Illness Rider' : 'Pre-existing Waiting Period'}
                </td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0' }}>
                    {isMotor ? (
                      <span style={{ color: '#059669', fontWeight: 700 }}>✓ Zero Dep Included</span>
                    ) : isTerm ? (
                      <span style={{ color: '#059669', fontWeight: 700 }}>✓ 64 Critical Illnesses Covered</span>
                    ) : (
                      p.waiting_period_months === 0 ? (
                        <span style={{ color: '#059669', fontWeight: 700 }}>0 Months (Day 1 Cover)</span>
                      ) : (
                        <span>{p.waiting_period_months || 24} Months</span>
                      )
                    )}
                  </td>
                ))}
              </tr>

              {/* Category Specific Metric 2 */}
              <tr>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1E293B', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {isMotor ? 'Roadside Assistance & Engine Protect' : isTerm ? 'Terminal Illness 100% Payout' : 'Room Rent Limit'}
                </td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0', fontWeight: 600, color: '#0F172A' }}>
                    {isMotor
                      ? '✓ 24x7 Nationwide RSA & Hydrostatic Lock Cover'
                      : isTerm
                      ? '✓ Accelerated 100% Payout upon Diagnosis'
                      : (p.room_rent_limit || 'Single Private AC Room (No Cap)')}
                  </td>
                ))}
              </tr>

              {/* Category Specific Metric 3 */}
              <tr>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1E293B', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {isMotor ? 'No Claim Bonus (NCB) Retention' : isTerm ? 'Accidental Death & Disability' : 'Maternity & Newborn Cover'}
                </td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0' }}>
                    {isMotor ? (
                      <span style={{ color: '#059669', fontWeight: 700 }}>Up to 50% NCB Discount Transfer</span>
                    ) : isTerm ? (
                      <span style={{ color: '#059669', fontWeight: 700 }}>✓ Double Payout on Accidental Loss</span>
                    ) : (
                      p.maternity_covered ? (
                        <span style={{ color: '#059669', fontWeight: 700 }}>✓ Covered from Day 1</span>
                      ) : (
                        <span style={{ color: '#9A9A9A' }}>✕ Not Covered</span>
                      )
                    )}
                  </td>
                ))}
              </tr>

              {/* Key Features */}
              <tr>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1E293B', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  Key Policy Benefits
                </td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0', verticalAlign: 'top' }}>
                    <ul style={{ margin: 0, paddingLeft: 18, color: '#1C1C1C', lineHeight: '1.6' }}>
                      {(p.features || []).slice(0, 3).map((f, idx) => (
                        <li key={idx} style={{ fontSize: 13 }}>{f}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
