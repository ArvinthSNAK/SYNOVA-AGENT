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
      motor: { label: 'Motor Insurance', bg: '#EFF6FF', color: '#1D4ED8', icon: <Car size={14} /> },
      health: { label: 'Health Insurance', bg: '#ECFDF5', color: '#047857', icon: <HeartPulse size={14} /> },
      term: { label: 'Term Life', bg: '#F5F3FF', color: '#6D28D9', icon: <Shield size={14} /> },
    };
    return map[cat?.toLowerCase()] || { label: cat, bg: '#F3F4F6', color: '#374151', icon: null };
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
            borderBottom: '1px solid #E2E8F0',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
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
                    fontWeight: 700,
                  }}
                >
                  {badge.label}
                </span>
                <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 700 }}>
                  {product.insurer_name}
                </span>
                <span style={{ color: '#E2E8F0' }}>•</span>
                <span style={{ fontSize: 13, color: '#F59E0B', fontWeight: 700 }}>
                  ★ {product.rating || 4.8}
                </span>
                <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>
                  CSR: {product.claim_settlement_ratio || '98.4%'}
                </span>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                {product.name}
              </h2>
              <p style={{ fontSize: 14, color: '#6B6B6B', margin: '4px 0 0' }}>
                {product.description}
              </p>
            </div>
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
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '0 32px', background: '#FFFFFF' }}>
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
                borderBottom: activeTab === t.id ? '2px solid #2563EB' : '2px solid transparent',
                color: activeTab === t.id ? '#2563EB' : '#6B6B6B',
                fontWeight: activeTab === t.id ? 700 : 500,
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
        <div style={{ padding: '28px 32px', overflowY: 'auto', flex: 1 }}>
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
                <div style={{ background: '#F8FAFC', padding: '16px 20px', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 12, color: '#6B6B6B', fontWeight: 600 }}>Default Coverage Amount</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                    {formatCurrency(product.coverage_amount)}
                  </div>
                </div>

                <div style={{ background: '#EFF6FF', padding: '16px 20px', borderRadius: 16, border: '1px solid #BFDBFE' }}>
                  <div style={{ fontSize: 12, color: '#1E40AF', fontWeight: 600 }}>Indicative Starting Premium</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1D4ED8', marginTop: 4 }}>
                    {formatCurrency(product.premium)}
                    <span style={{ fontSize: 13, fontWeight: 600 }}>/{product.premium_frequency || 'mo'}</span>
                  </div>
                </div>

                {product.cashless_hospitals_count > 0 && (
                  <div style={{ background: '#ECFDF5', padding: '16px 20px', borderRadius: 16, border: '1px solid #A7F3D0' }}>
                    <div style={{ fontSize: 12, color: '#065F46', fontWeight: 600 }}>Cashless Hospitals</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#047857', marginTop: 4 }}>
                      {product.cashless_hospitals_count.toLocaleString()}+ Network
                    </div>
                  </div>
                )}
              </div>

              {/* Policy Specific Attributes */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px', color: '#0F172A' }}>Key Plan Parameters</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
                  <div>
                    <span style={{ color: '#6B6B6B' }}>Room Rent Limit: </span>
                    <strong style={{ color: '#0F172A' }}>{product.room_rent_limit || 'Single Private AC Room'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6B6B6B' }}>Pre-existing Waiting: </span>
                    <strong style={{ color: '#0F172A' }}>{product.waiting_period_months ? `${product.waiting_period_months} Months` : '0 Months (Day 1)'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6B6B6B' }}>Maternity Covered: </span>
                    <strong style={{ color: product.maternity_covered ? '#059669' : '#DC2626' }}>
                      {product.maternity_covered ? '✓ Yes (Normal & C-Sec)' : '✕ No'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#6B6B6B' }}>Day Care & OPD: </span>
                    <strong style={{ color: product.opd_covered ? '#059669' : '#6B6B6B' }}>
                      {product.opd_covered ? '✓ Covered' : '✕ Hospitalization only'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: '#0F172A' }}>
                Included Coverage & Highlights
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(product.features || []).map((feat, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      background: '#F8FAFC',
                      borderRadius: 12,
                      fontSize: 14,
                      color: '#1E293B',
                    }}
                  >
                    <span style={{ color: '#10B981', fontWeight: 800, fontSize: 16 }}>✓</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'exclusions' && (
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: '#DC2626' }}>
                Standard Exclusions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(product.exclusions || ['Cosmetic / aesthetic procedures', 'Self-inflicted injuries', 'Breach of law with criminal intent']).map((ex, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      background: '#FEF2F2',
                      borderRadius: 12,
                      fontSize: 14,
                      color: '#991B1B',
                    }}
                  >
                    <span style={{ color: '#DC2626', fontWeight: 800, fontSize: 16 }}>✕</span>
                    <span>{ex}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'claims' && (
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: '#0F172A' }}>
                Paperless Digital Claim Settlement
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 14, border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#2563EB', marginBottom: 8 }}>
                    <Building2 size={24} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>1. Show Health Card</div>
                  <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 4 }}>
                    Present digital health e-card at hospital insurance desk.
                  </div>
                </div>

                <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 14, border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#2563EB', marginBottom: 8 }}>
                    <Zap size={24} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>2. 30-Min Pre-Auth</div>
                  <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 4 }}>
                    Hospital submits claim for express 30-minute cashless approval.
                  </div>
                </div>

                <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 14, border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#2563EB', marginBottom: 8 }}>
                    <CreditCard size={24} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>3. Zero Out-of-Pocket</div>
                  <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 4 }}>
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
            borderTop: '1px solid #E2E8F0',
            background: '#F8FAFC',
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
              border: '1px solid #CBD5E1',
              background: isCompared ? '#EFF6FF' : '#FFFFFF',
              color: isCompared ? '#2563EB' : '#475569',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
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
              <div style={{ fontSize: 11, color: '#6B6B6B', fontWeight: 600 }}>Starting from</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
                {formatCurrency(product.premium)}
                <span style={{ fontSize: 13, color: '#6B6B6B', fontWeight: 500 }}>/{product.premium_frequency || 'mo'}</span>
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
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
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
