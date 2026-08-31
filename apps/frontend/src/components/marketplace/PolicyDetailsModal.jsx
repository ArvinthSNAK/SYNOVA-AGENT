import React, { useState } from 'react';
import InsurerLogoBadge from '../common/InsurerLogoBadge';
import { Car, HeartPulse, Shield, CreditCard, Zap, Building2, Plus, Check, ArrowRight } from 'lucide-react';

export default function PolicyDetailsModal({ product, onClose, onBuyNow, onCompare, isCompared }) {
  if (!product) return null;

  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (val) => {
    if (!val) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const getCategoryBadge = (cat) => {
    const map = {
      motor: { label: 'Motor Insurance', bg: '#DED8ED', color: '#111111', icon: <Car size={14} color="#111111" /> },
      health: { label: 'Health Insurance', bg: '#DED8ED', color: '#111111', icon: <HeartPulse size={14} color="#111111" /> },
      term: { label: 'Term Life', bg: '#DED8ED', color: '#111111', icon: <Shield size={14} color="#111111" /> },
    };
    return map[cat?.toLowerCase()] || { label: cat, bg: '#DED8ED', color: '#111111', icon: null };
  };

  const parseFeatureList = (features) => {
    if (Array.isArray(features)) return features;
    if (typeof features === 'string') {
      try {
        const parsed = JSON.parse(features);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {}
      if (features.includes('•')) return features.split('•').map((s) => s.trim()).filter(Boolean);
      if (features.includes(',')) return features.split(',').map((s) => s.trim()).filter(Boolean);
      if (features.includes('\n')) return features.split('\n').map((s) => s.trim()).filter(Boolean);
      return [features];
    }
    return ['Cashless Claim Settlement', 'Paperless Instant Issue', '24x7 Support'];
  };

  const badge = getCategoryBadge(product.category || product.insurance_type);

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
          maxWidth: 800,
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 32px',
            borderBottom: '1px solid rgba(17, 17, 17, 0.08)',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <InsurerLogoBadge insurerName={product.insurer_name} size={54} rounded={14} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: badge.bg,
                    color: badge.color,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {badge.label}
                </span>
                <span style={{ fontSize: 13, color: '#1C1C1C', fontWeight: 800 }}>
                  {product.insurer_name}
                </span>
                <span style={{ color: '#A0A0A0' }}>•</span>
                <span style={{ fontSize: 13, color: '#111111', fontWeight: 800 }}>
                  ★ {product.rating || 4.8}
                </span>
                <span style={{ fontSize: 12, color: '#111111', fontWeight: 700 }}>
                  CSR: {product.claim_settlement_ratio || '98.4%'}
                </span>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1C1C1C', margin: 0, letterSpacing: '-0.02em' }}>
                {product.name}
              </h2>
              <p style={{ fontSize: 14, color: '#666666', margin: '4px 0 0' }}>
                {product.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#EBEBEB',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 18,
              color: '#1C1C1C',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(17, 17, 17, 0.08)', padding: '0 32px', background: '#FFFFFF' }}>
          {[
            { id: 'overview', label: 'Overview & Coverage' },
            { id: 'features', label: 'Key Inclusions' },
            { id: 'exclusions', label: 'Exclusions & Limits' },
            { id: 'claims', label: 'Claim Process & Network' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '14px 20px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === t.id ? '2.5px solid #111111' : '2.5px solid transparent',
                color: activeTab === t.id ? '#111111' : '#666666',
                fontWeight: activeTab === t.id ? 800 : 500,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px 32px', overflowY: 'auto', flex: 1, background: '#FFFFFF' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Financial Snapshot */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 16,
                }}
              >
                <div style={{ background: '#EBEBEB', padding: '16px 20px', borderRadius: 16, border: '1px solid rgba(17, 17, 17, 0.06)' }}>
                  <div style={{ fontSize: 12, color: '#666666', fontWeight: 700 }}>Default Coverage Amount</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#1C1C1C', marginTop: 4 }}>
                    {formatCurrency(product.coverage_amount)}
                  </div>
                </div>

                <div style={{ background: '#DED8ED', padding: '16px 20px', borderRadius: 16, border: '1.5px solid #111111' }}>
                  <div style={{ fontSize: 12, color: '#111111', fontWeight: 800 }}>Indicative Starting Premium</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#111111', marginTop: 4 }}>
                    {formatCurrency(product.premium)}
                    <span style={{ fontSize: 13, fontWeight: 700 }}>/{product.premium_frequency || 'mo'}</span>
                  </div>
                </div>

                {product.cashless_hospitals_count > 0 && (
                  <div style={{ background: '#EBEBEB', padding: '16px 20px', borderRadius: 16, border: '1px solid rgba(17, 17, 17, 0.06)' }}>
                    <div style={{ fontSize: 12, color: '#666666', fontWeight: 700 }}>Cashless Hospitals</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#1C1C1C', marginTop: 4 }}>
                      {product.cashless_hospitals_count.toLocaleString()}+ Network
                    </div>
                  </div>
                )}
              </div>

              {/* Policy Specific Attributes */}
              <div style={{ background: '#FFFFFF', border: '1px solid rgba(17, 17, 17, 0.08)', borderRadius: 16, padding: 20 }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 14px', color: '#1C1C1C' }}>Key Plan Parameters</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
                  <div>
                    <span style={{ color: '#666666' }}>Room Rent Limit: </span>
                    <strong style={{ color: '#1C1C1C' }}>{product.room_rent_limit || 'Single Private AC Room'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#666666' }}>Pre-existing Waiting: </span>
                    <strong style={{ color: '#1C1C1C' }}>{product.waiting_period_months ? `${product.waiting_period_months} Months` : '0 Months (Day 1)'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#666666' }}>Maternity Covered: </span>
                    <strong style={{ color: '#111111' }}>
                      {product.maternity_covered ? '✓ Yes (Normal & C-Sec)' : '✕ No'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#666666' }}>Day Care & OPD: </span>
                    <strong style={{ color: '#111111' }}>
                      {product.opd_covered ? '✓ Covered' : '✕ Hospitalization only'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 16px', color: '#1C1C1C' }}>
                Included Coverage & Highlights
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {parseFeatureList(product.features).map((feat, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      background: '#EBEBEB',
                      borderRadius: 12,
                      fontSize: 14,
                      color: '#1C1C1C',
                    }}
                  >
                    <span style={{ color: '#111111', fontWeight: 900, fontSize: 16 }}>✓</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'exclusions' && (
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 16px', color: '#111111' }}>
                Standard Exclusions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {parseFeatureList(product.exclusions || ['Cosmetic / aesthetic procedures', 'Self-inflicted injuries', 'Breach of law with criminal intent']).map((ex, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      background: '#EBEBEB',
                      borderRadius: 12,
                      fontSize: 14,
                      color: '#1C1C1C',
                    }}
                  >
                    <span style={{ color: '#111111', fontWeight: 900, fontSize: 16 }}>✕</span>
                    <span>{ex}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'claims' && (
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 16px', color: '#1C1C1C' }}>
                Paperless Digital Claim Settlement
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div style={{ padding: 16, background: '#EBEBEB', borderRadius: 14, border: '1px solid rgba(17, 17, 17, 0.06)' }}>
                  <div style={{ color: '#111111', marginBottom: 8 }}>
                    <Building2 size={24} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#1C1C1C' }}>1. Show Health Card</div>
                  <div style={{ fontSize: 12, color: '#666666', marginTop: 4 }}>
                    Present digital health e-card at hospital insurance desk.
                  </div>
                </div>

                <div style={{ padding: 16, background: '#EBEBEB', borderRadius: 14, border: '1px solid rgba(17, 17, 17, 0.06)' }}>
                  <div style={{ color: '#111111', marginBottom: 8 }}>
                    <Zap size={24} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#1C1C1C' }}>2. 30-Min Pre-Auth</div>
                  <div style={{ fontSize: 12, color: '#666666', marginTop: 4 }}>
                    Hospital submits claim for express 30-minute cashless approval.
                  </div>
                </div>

                <div style={{ padding: 16, background: '#EBEBEB', borderRadius: 14, border: '1px solid rgba(17, 17, 17, 0.06)' }}>
                  <div style={{ color: '#111111', marginBottom: 8 }}>
                    <CreditCard size={24} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#1C1C1C' }}>3. Zero Out-of-Pocket</div>
                  <div style={{ fontSize: 12, color: '#666666', marginTop: 4 }}>
                    Direct bill settlement with hospital network on discharge.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '20px 32px',
            borderTop: '1px solid rgba(17, 17, 17, 0.08)',
            background: '#EBEBEB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={() => onCompare && onCompare(product)}
            style={{
              padding: '12px 20px',
              borderRadius: 12,
              border: isCompared ? '1.5px solid #111111' : '1px solid rgba(17, 17, 17, 0.2)',
              background: isCompared ? '#DED8ED' : '#FFFFFF',
              color: isCompared ? '#111111' : '#1C1C1C',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
            }}
          >
            {isCompared ? (
              <>
                <Check size={16} /> Added to Compare
              </>
            ) : (
              <>
                <Plus size={16} /> Add to Compare
              </>
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#666666', fontWeight: 700 }}>Starting from</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#111111' }}>
                {formatCurrency(product.premium)}
                <span style={{ fontSize: 13, color: '#666666', fontWeight: 600 }}>/{product.premium_frequency || 'mo'}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onBuyNow && onBuyNow(product);
              }}
              style={{
                padding: '14px 28px',
                borderRadius: 14,
                border: 'none',
                background: 'var(--blue-primary)',
                color: '#FFFFFF',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(17, 17, 17, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s ease',
              }}
            >
              Buy Now ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
