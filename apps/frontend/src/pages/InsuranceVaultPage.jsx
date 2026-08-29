import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { httpClient } from '../api/httpClient';
import InsurerLogoBadge from '../components/common/InsurerLogoBadge';
import WalletTopupModal from '../components/wallet/WalletTopupModal';
import BuyPolicyModal from '../components/marketplace/BuyPolicyModal';
import { downloadPolicyPdf } from '../utils/generatePolicyPdf';
import { Car, HeartPulse, Shield, FileText, ClipboardList, ArrowRight, ShieldCheck, CreditCard, Plus, Download, RefreshCw } from 'lucide-react';

export default function InsuranceVaultPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('policies');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFNOLModal, setShowFNOLModal] = useState(false);
  const [fnolSubmitting, setFnolSubmitting] = useState(false);
  const [fnolSuccess, setFnolSuccess] = useState('');
  const [renewProduct, setRenewProduct] = useState(null);
  
  // Wallet State
  const [walletBalance, setWalletBalance] = useState(25000);
  const [showTopupModal, setShowTopupModal] = useState(false);

  const [fnolForm, setFnolForm] = useState({
    policy_id: '',
    claim_type: 'Accidental Damage (Own Damage)',
    incident_date: new Date().toISOString().substring(0, 10),
    incident_location: 'Bangalore Electronic City',
    description: 'Front bumper & headlight damage from parking collision.',
    estimated_loss: 28000,
    garage_name: 'Authorized Cashless Network Service Hub',
    garage_city: 'Bangalore',
  });

  const getUserVaultKey = () => {
    if (user?.id) return `user_${user.id}`;
    if (user?.email) return `user_${user.email}`;
    return 'guest';
  };

  const userKey = getUserVaultKey();

  const fetchWallet = () => {
    const uKey = getUserVaultKey();
    const stored = localStorage.getItem(`synova_wallet_balance_${uKey}`);
    if (stored !== null) {
      setWalletBalance(parseFloat(stored));
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchVaultPolicies();
    fetchClaimsData();

    const handlePolicyUpdate = () => {
      fetchWallet();
      fetchVaultPolicies();
      fetchClaimsData();
    };
    window.addEventListener('synova_policy_purchased', handlePolicyUpdate);
    window.addEventListener('synova_wallet_updated', handlePolicyUpdate);
    window.addEventListener('storage', handlePolicyUpdate);

    return () => {
      window.removeEventListener('synova_policy_purchased', handlePolicyUpdate);
      window.removeEventListener('synova_wallet_updated', handlePolicyUpdate);
      window.removeEventListener('storage', handlePolicyUpdate);
    };
  }, [userKey]);

  const fetchVaultPolicies = async () => {
    setLoading(true);
    const uKey = getUserVaultKey();
    const userKeys = uKey === 'guest'
      ? ['synova_vault_policies_guest']
      : [
          `synova_vault_policies_${uKey}`,
          `synova_vault_policies_user_${uKey}`,
          user?.id ? `synova_vault_policies_${user.id}` : null,
          user?.id ? `synova_vault_policies_user_${user.id}` : null,
          user?.email ? `synova_vault_policies_${user.email}` : null,
          user?.email ? `synova_vault_policies_user_${user.email}` : null,
        ].filter(Boolean);

    let localPols = [];
    const seenLocal = new Set();
    for (const k of userKeys) {
      try {
        const items = JSON.parse(localStorage.getItem(k) || '[]');
        if (Array.isArray(items)) {
          for (const item of items) {
            const num = item.policy_number || item.id;
            if (num && !seenLocal.has(num)) {
              seenLocal.add(num);
              localPols.push(item);
            }
          }
        }
      } catch (e) { }
    }

    try {
      let serverPolicies = [];
      if (user && user.id) {
        const res = await httpClient.get(`/policies/?customer_id=${user.id}`);
        if (Array.isArray(res.data)) {
          serverPolicies = res.data;
        }
      }
      const combined = [...localPols, ...serverPolicies];

      const unique = [];
      const seen = new Set();
      for (const p of combined) {
        if (p.policy_number && !seen.has(p.policy_number)) {
          seen.add(p.policy_number);
          unique.push(p);
        }
      }
      setPolicies(unique);
      if (unique.length > 0) {
        setFnolForm((prev) => ({ ...prev, policy_id: unique[0].id }));
      }
    } catch (err) {
      setPolicies(localPols);
      if (localPols.length > 0) {
        setFnolForm((prev) => ({ ...prev, policy_id: localPols[0].id }));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchClaimsData = async () => {
    const uKey = getUserVaultKey();
    const localClaims = JSON.parse(localStorage.getItem(`synova_vault_claims_${uKey}`) || '[]');
    try {
      if (user && user.id) {
        const res = await httpClient.get(`/claims/customer/${user.id}`);
        const serverClaims = Array.isArray(res.data) ? res.data : [];
        const combined = [...localClaims, ...serverClaims];
        const uniqueClaims = [];
        const seenClaimIds = new Set();
        for (const c of combined) {
          const cid = c.claim_number || c.id;
          if (cid && !seenClaimIds.has(cid)) {
            seenClaimIds.add(cid);
            uniqueClaims.push(c);
          }
        }
        setClaims(uniqueClaims);
      } else {
        setClaims(localClaims);
      }
    } catch (err) {
      setClaims(localClaims);
    }
  };

  const handleFNOLSubmit = async (e) => {
    e.preventDefault();
    setFnolSubmitting(true);
    setFnolSuccess('');

    const newClaimNumber = 'CLM-SYN-' + Math.floor(10000 + Math.random() * 90000);
    const selectedPolicy = policies.find(p => String(p.id) === String(fnolForm.policy_id) || p.policy_number === fnolForm.policy_id) || policies[0] || {};

    const newClaimObj = {
      id: Date.now(),
      claim_number: newClaimNumber,
      policy_id: selectedPolicy.id || 1,
      policy_number: selectedPolicy.policy_number || 'POL-ICI-883921',
      insurer_name: selectedPolicy.insurer_name || 'ICICI Lombard General Insurance',
      customer_id: user?.id || 1,
      customer_name: user?.full_name || 'Hariharan Murugesan',
      customer_email: user?.email || 'hariharan@synova.ai',
      claim_type: fnolForm.claim_type,
      incident_date: fnolForm.incident_date,
      incident_location: fnolForm.incident_location,
      description: fnolForm.description,
      estimated_loss: parseFloat(fnolForm.estimated_loss) || 28000,
      approved_amount: 0,
      status: 'submitted',
      created_at: new Date().toISOString(),
    };

    try {
      await httpClient.post('/claims/', newClaimObj);
    } catch (err) {
      // Local fallback
      const existingClaims = JSON.parse(localStorage.getItem(`synova_vault_claims_${userKey}`) || '[]');
      existingClaims.unshift(newClaimObj);
      localStorage.setItem(`synova_vault_claims_${userKey}`, JSON.stringify(existingClaims));
    }

    setClaims(prev => [newClaimObj, ...prev]);
    setFnolSubmitting(false);
    setFnolSuccess(`Claim ${newClaimNumber} logged successfully! Cashless inspection initiated.`);
    setTimeout(() => {
      setShowFNOLModal(false);
      setFnolSuccess('');
      setActiveTab('claims');
    }, 2000);
  };

  const getFilteredPolicies = () => {
    if (selectedCategory === 'all') return policies;
    return policies.filter((p) => {
      const type = (p.insurance_type || p.category || 'motor').toLowerCase();
      if (selectedCategory === 'motor') return type.includes('motor') || type.includes('car') || type.includes('bike');
      if (selectedCategory === 'health') return type.includes('health') || type.includes('medical');
      if (selectedCategory === 'term') return type.includes('term') || type.includes('life');
      return true;
    });
  };

  const filtered = getFilteredPolicies();

  const getCategoryTag = (type) => {
    const t = (type || 'motor').toLowerCase();
    if (t.includes('health')) return { label: 'Health', bg: '#ECFDF5', color: '#047857' };
    if (t.includes('term')) return { label: 'Term Life', bg: '#F5F3FF', color: '#6D28D9' };
    return { label: 'Motor', bg: '#EFF6FF', color: '#1D4ED8' };
  };

  const formatCurrency = (val) => {
    if (!val) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ color: '#2563EB', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Personal Coverage Dashboard
          </span>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', margin: '4px 0 0', letterSpacing: '-0.02em' }}>
            Digital Insurance Vault
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: '6px 0 0' }}>
            Store, track, and manage all your active Motor, Health, and Term Life policies in one central hub.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Vault Wallet Balance Widget */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 16px',
              borderRadius: 16,
              background: '#FFFFFF',
              border: '1.5px solid rgba(21, 101, 192, 0.2)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Vault Balance
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#1565C0' }}>
                ₹{Number(walletBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowTopupModal(true)}
              style={{
                padding: '6px 12px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Plus size={13} strokeWidth={3} />
              <span>Add Funds</span>
            </button>
          </div>

          <button
            onClick={() => setShowFNOLModal(true)}
            style={{
              padding: '12px 22px',
              borderRadius: 14,
              border: 'none',
              background: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 13.5,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            File FNOL Claim ➔
          </button>
          <Link
            to="/policies"
            style={{
              padding: '12px 20px',
              borderRadius: 14,
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#0F172A',
              fontWeight: 700,
              fontSize: 13.5,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            + Marketplace Hub
          </Link>
        </div>
      </div>

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('policies')}
          style={{
            padding: '10px 24px',
            borderRadius: 20,
            border: 'none',
            background: activeTab === 'policies' ? '#2563EB' : '#F1F5F9',
            color: activeTab === 'policies' ? '#FFFFFF' : '#475569',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          My Policies ({policies.length})
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          style={{
            padding: '10px 24px',
            borderRadius: 20,
            border: 'none',
            background: activeTab === 'claims' ? '#2563EB' : '#F1F5F9',
            color: activeTab === 'claims' ? '#FFFFFF' : '#475569',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Claims History ({claims.length})
        </button>
      </div>

      {/* Category Pills (Motor, Health, Term) */}
      {activeTab === 'policies' && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Categories', count: policies.length, icon: null },
            { id: 'motor', label: 'Motor', count: policies.filter(p => (p.insurance_type || '').includes('motor')).length, icon: <Car size={14} /> },
            { id: 'health', label: 'Health', count: policies.filter(p => (p.insurance_type || '').includes('health')).length, icon: <HeartPulse size={14} /> },
            { id: 'term', label: 'Term Life', count: policies.filter(p => (p.insurance_type || '').includes('term')).length, icon: <Shield size={14} /> },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              style={{
                padding: '8px 18px',
                borderRadius: 12,
                border: selectedCategory === c.id ? '2px solid #2563EB' : '1px solid #CBD5E1',
                background: selectedCategory === c.id ? '#EFF6FF' : '#FFFFFF',
                color: selectedCategory === c.id ? '#1E40AF' : '#475569',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {c.icon}
              <span>{c.label} ({c.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Policies List */}
      {activeTab === 'policies' && (
        filtered.length === 0 ? (
          <div style={{ padding: '64px 32px', textAlign: 'center', background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <ShieldCheck size={32} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
              No policies in this category
            </h3>
            <p style={{ fontSize: 14, color: '#64748B', maxWidth: 460, margin: '0 auto 24px' }}>
              Explore over 40+ insurance policies across Motor, Health, and Term Life on our digital marketplace.
            </p>
            <Link
              to="/policies"
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                background: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Explore All Policies ➔
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
            {filtered.map((p) => {
              const tag = getCategoryTag(p.insurance_type || p.category);
              const isExpiring = p.is_expiring_soon;

              return (
                <div
                  key={p.id || p.policy_number}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 20,
                    border: '1px solid #E2E8F0',
                    padding: 24,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <InsurerLogoBadge insurerName={p.insurer_name} size={42} rounded={10} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span
                              style={{
                                background: tag.bg,
                                color: tag.color,
                                padding: '2px 8px',
                                borderRadius: 12,
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              {tag.label}
                            </span>
                            <span
                              style={{
                                background: isExpiring ? '#FEF3C7' : '#ECFDF5',
                                color: isExpiring ? '#D97706' : '#059669',
                                padding: '2px 8px',
                                borderRadius: 12,
                                fontSize: 11,
                                fontWeight: 800,
                              }}
                            >
                              {isExpiring ? 'EXPIRING SOON' : 'ACTIVE'}
                            </span>
                          </div>
                          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                            {p.product_name || p.name || 'Comprehensive Coverage'}
                          </h3>
                          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginTop: 2 }}>{p.insurer_name}</div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: '#64748B' }}>Annual Premium</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginTop: 2 }}>
                          {formatCurrency(p.premium)}
                        </div>
                      </div>
                    </div>

                    {/* Meta Grid */}
                    <div style={{ background: '#F8FAFC', borderRadius: 14, padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, marginBottom: 16 }}>
                      <div>
                        <span style={{ color: '#64748B' }}>Policy Number:</span>
                        <div style={{ fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{p.policy_number}</div>
                      </div>

                      <div>
                        <span style={{ color: '#64748B' }}>Coverage Cover:</span>
                        <div style={{ fontWeight: 800, color: '#2563EB', marginTop: 2 }}>
                          {formatCurrency(p.coverage_amount || p.idv)}
                        </div>
                      </div>

                      {p.vehicle_registration && (
                        <div>
                          <span style={{ color: '#64748B' }}>Vehicle:</span>
                          <div style={{ fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{p.vehicle_registration}</div>
                        </div>
                      )}

                      {p.end_date && (
                        <div>
                          <span style={{ color: '#64748B' }}>Valid Till:</span>
                          <div style={{ fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                            {new Date(p.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      )}
                    </div>

                    {p.notes && (
                      <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 16px', lineHeight: 1.5 }}>
                        {p.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 10, paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
                    <button
                      type="button"
                      onClick={() => downloadPolicyPdf(p)}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        color: '#1E293B',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Download size={15} color="#2563EB" />
                      <span>Download e-Policy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRenewProduct({
                          id: p.id || p.product_id || 1,
                          name: `${p.product_name || p.name || 'Comprehensive Coverage'} (Annual Renewal)`,
                          product_name: p.product_name || p.name || 'Comprehensive Coverage',
                          insurer_name: p.insurer_name || 'ICICI Lombard General',
                          category: p.insurance_type || p.category || 'motor',
                          insurance_type: p.insurance_type || p.category || 'motor',
                          premium: Math.round((p.premium || 12000) * 0.95), // 5% renewal loyalty discount
                          coverage_amount: p.coverage_amount || p.idv || 1000000,
                          vehicleRegistration: p.vehicle_registration,
                          policy_number: p.policy_number,
                          isRenewal: true,
                        });
                      }}
                      style={{
                        padding: '10px 18px',
                        borderRadius: 10,
                        border: 'none',
                        background: '#2563EB',
                        color: '#FFFFFF',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <RefreshCw size={14} />
                      <span>Renew Policy ➔</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Claims Tab */}
      {activeTab === 'claims' && (
        claims.length === 0 ? (
          <div style={{ padding: '64px 32px', textAlign: 'center', background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <ClipboardList size={32} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
              No Claims on Record
            </h3>
            <p style={{ fontSize: 14, color: '#64748B', maxWidth: 460, margin: '0 auto 24px' }}>
              You have a 100% clean claim track record. Enjoy your full No Claim Bonus (NCB) benefits.
            </p>
            <button
              onClick={() => setShowFNOLModal(true)}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                border: 'none',
                background: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              File FNOL Claim ➔
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {claims.map((c) => (
              <div
                key={c.id || c.claim_number}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  padding: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#2563EB' }}>{c.claim_number}</span>
                    <span style={{ color: '#E2E8F0' }}>•</span>
                    <span style={{ fontSize: 12, color: '#64748B' }}>{c.claim_type}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{c.description}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{c.insurer_name} • Policy: {c.policy_number}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      background: '#ECFDF5',
                      color: '#059669',
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                    }}
                  >
                    {c.status || 'SUBMITTED'}
                  </span>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginTop: 6 }}>
                    {formatCurrency(c.estimated_loss || 28000)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* FNOL Modal */}
      {showFNOLModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setShowFNOLModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              maxWidth: 550,
              width: '100%',
              padding: 28,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                File FNOL Claim Notice
              </h3>
              <button
                onClick={() => setShowFNOLModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 18, color: '#64748B', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {fnolSuccess ? (
              <div style={{ padding: 16, background: '#ECFDF5', borderRadius: 12, color: '#047857', textAlign: 'center', fontWeight: 700 }}>
                {fnolSuccess}
              </div>
            ) : (
              <form onSubmit={handleFNOLSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>Select Policy</label>
                  <select
                    value={fnolForm.policy_id}
                    onChange={(e) => setFnolForm({ ...fnolForm, policy_id: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                  >
                    {policies.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.policy_number} - {p.product_name || p.name} ({p.insurer_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>Claim Type</label>
                  <select
                    value={fnolForm.claim_type}
                    onChange={(e) => setFnolForm({ ...fnolForm, claim_type: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                  >
                    <option value="Accidental Damage (Own Damage)">Accidental Vehicle Damage</option>
                    <option value="Cashless Hospitalization">Cashless Hospitalization (Health)</option>
                    <option value="Critical Illness Cash Benefit">Critical Illness Lump Sum (Health)</option>
                    <option value="Term Life Claim">Term Life Claim Notification</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>Incident Details / Loss Description</label>
                  <textarea
                    rows={3}
                    value={fnolForm.description}
                    onChange={(e) => setFnolForm({ ...fnolForm, description: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={fnolSubmitting}
                  style={{
                    marginTop: 10,
                    padding: '12px 20px',
                    borderRadius: 12,
                    border: 'none',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  {fnolSubmitting ? 'Submitting Notice...' : 'Submit FNOL Claim ➔'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Wallet Top-up Modal with Full Payment Gateway Flow */}
      <WalletTopupModal
        isOpen={showTopupModal}
        onClose={() => setShowTopupModal(false)}
        currentBalance={walletBalance}
        userKey={userKey}
        onSuccess={(newBal) => {
          setWalletBalance(newBal);
          fetchWallet();
        }}
      />

      {/* Instant Policy Renewal / Buy Modal */}
      {renewProduct && (
        <BuyPolicyModal
          product={renewProduct}
          onClose={() => setRenewProduct(null)}
          onSuccess={(newIssued) => {
            setRenewProduct(null);
            fetchVaultPolicies();
            fetchWallet();
          }}
        />
      )}
    </div>
  );
}
