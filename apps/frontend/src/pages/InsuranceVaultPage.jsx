import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { httpClient } from '../api/httpClient';
import InsurerLogoBadge from '../components/common/InsurerLogoBadge';
import WalletTopupModal from '../components/wallet/WalletTopupModal';
import BuyPolicyModal from '../components/marketplace/BuyPolicyModal';
import { downloadPolicyPdf } from '../utils/generatePolicyPdf';
import {
  Car,
  HeartPulse,
  Shield,
  FileText,
  ClipboardList,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Plus,
  Download,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

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
    incident_location: '',
    description: '',
    estimated_loss: '',
    garage_name: '',
    garage_city: '',
  });

  const getUserVaultKey = () => {
    if (user?.id) return `user_${user.id}`;
    if (user?.email) return `user_${encodeURIComponent(user.email)}`;
    return null;
  };

  const userKey = getUserVaultKey();

  const fetchWallet = () => {
    const uKey = getUserVaultKey();
    if (!uKey) {
      setWalletBalance(0);
      return;
    }
    const stored = localStorage.getItem(`synova_wallet_balance_${uKey}`);
    if (stored !== null) {
      setWalletBalance(parseFloat(stored));
    } else {
      setWalletBalance(25000); // initial default for new user
    }
  };

  useEffect(() => {
    if (!userKey) {
      setPolicies([]);
      setClaims([]);
      setWalletBalance(0);
      return;
    }
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
    if (!uKey) {
      setPolicies([]);
      setLoading(false);
      return;
    }

    let localPols = [];
    try {
      const stored = localStorage.getItem(`synova_vault_policies_${uKey}`);
      if (stored) {
        localPols = JSON.parse(stored);
      }
    } catch (e) {
      localPols = [];
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
    if (!uKey) {
      setClaims([]);
      return;
    }
    let localClaims = [];
    try {
      localClaims = JSON.parse(localStorage.getItem(`synova_vault_claims_${uKey}`) || '[]');
    } catch (e) {
      localClaims = [];
    }

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
      customer_name: user?.name || user?.full_name || '',
      customer_email: user?.email || '',
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
      const existingClaims = JSON.parse(localStorage.getItem(`synova_vault_claims_${userKey}`) || '[]');
      existingClaims.unshift(newClaimObj);
      localStorage.setItem(`synova_vault_claims_${userKey}`, JSON.stringify(existingClaims));
    }

    setClaims(prev => [newClaimObj, ...prev]);
    setFnolSubmitting(false);
    setFnolSuccess(`Claim ${newClaimNumber} logged successfully! Cashless network inspection dispatched.`);
    setTimeout(() => {
      setShowFNOLModal(false);
      setFnolSuccess('');
      setActiveTab('claims');
    }, 1800);
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
    if (t.includes('health')) return { label: 'Health', bg: '#DED8ED', color: '#111111' };
    if (t.includes('term')) return { label: 'Term Life', bg: '#DED8ED', color: '#111111' };
    return { label: 'Motor', bg: '#DED8ED', color: '#111111' };
  };

  const formatCurrency = (val) => {
    if (!val) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#EBEBEB', color: '#1C1C1C', padding: '36px 24px 100px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header with Title and Vault Actions */}
        <div className="anim-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <span
              style={{
                background: '#DED8ED',
                color: '#111111',
                padding: '4px 14px',
                borderRadius: 20,
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                border: '1px solid #111111',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 8,
              }}
            >
              <Shield size={13} color="#111111" />
              Personal Coverage Repository
            </span>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1C1C1C', margin: '4px 0 0', letterSpacing: '-0.02em' }}>
              Digital Insurance Vault
            </h1>
            <p style={{ fontSize: 14.5, color: '#555555', margin: '6px 0 0', maxWidth: 640 }}>
              Store, track, download, and file instant cashless claims for all your active Motor, Health, and Term Life contracts.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Vault Wallet Balance Widget */}
            <div
              className="anim-float"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 18px',
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(16px)',
                border: '1.5px solid #111111',
                boxShadow: '0 4px 16px rgba(17, 17, 17, 0.08)',
              }}
            >
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: '#666666', textTransform: 'uppercase' }}>
                  Vault Wallet
                </div>
                <div style={{ fontSize: 17, fontWeight: 900, color: '#111111' }}>
                  ₹{Number(walletBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTopupModal(true)}
                className="glass-btn"
                style={{
                  padding: '7px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#111111',
                  color: '#DED8ED',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  boxShadow: '0 2px 8px rgba(17, 17, 17, 0.25)',
                }}
              >
                <Plus size={13} strokeWidth={3} color="#DED8ED" />
                <span>Add Funds</span>
              </button>
            </div>

            {/* File FNOL Claim CTA Button */}
            <button
              onClick={() => setShowFNOLModal(true)}
              className="glass-btn btn-pulse-cta"
              style={{
                padding: '12px 22px',
                borderRadius: 14,
                border: '1px solid rgba(222, 216, 237, 0.45)',
                background: 'linear-gradient(135deg, #111111 0%, #2A2A2A 100%)',
                color: '#DED8ED',
                fontWeight: 800,
                fontSize: 13.5,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(17, 17, 17, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertTriangle size={16} color="#DED8ED" />
              <span>File FNOL Claim ➔</span>
            </button>

            {/* Marketplace Link Button */}
            <Link
              to="/policies"
              style={{
                padding: '12px 18px',
                borderRadius: 14,
                border: '1px solid rgba(17, 17, 17, 0.2)',
                background: 'rgba(255, 255, 255, 0.85)',
                color: '#1C1C1C',
                fontWeight: 700,
                fontSize: 13.5,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Plus size={15} />
              <span>Explore Marketplace</span>
            </Link>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div style={{ display: 'flex', gap: 12, borderBottom: '1.5px solid rgba(17, 17, 17, 0.12)', paddingBottom: 16, marginBottom: 24 }}>
          <button
            onClick={() => setActiveTab('policies')}
            style={{
              padding: '10px 24px',
              borderRadius: 20,
              border: activeTab === 'policies' ? '1.5px solid #111111' : '1px solid rgba(17, 17, 17, 0.15)',
              background: activeTab === 'policies' ? '#111111' : '#FFFFFF',
              color: activeTab === 'policies' ? '#DED8ED' : '#1C1C1C',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
            }}
          >
            <ShieldCheck size={16} />
            <span>My Active Policies ({policies.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            style={{
              padding: '10px 24px',
              borderRadius: 20,
              border: activeTab === 'claims' ? '1.5px solid #111111' : '1px solid rgba(17, 17, 17, 0.15)',
              background: activeTab === 'claims' ? '#111111' : '#FFFFFF',
              color: activeTab === 'claims' ? '#DED8ED' : '#1C1C1C',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
            }}
          >
            <ClipboardList size={16} />
            <span>Claims History ({claims.length})</span>
          </button>
        </div>

        {/* Category Pills (Motor, Health, Term) */}
        {activeTab === 'policies' && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Policies', count: policies.length, icon: null },
              { id: 'motor', label: 'Motor', count: policies.filter(p => (p.insurance_type || '').includes('motor')).length, icon: <Car size={14} /> },
              { id: 'health', label: 'Health', count: policies.filter(p => (p.insurance_type || '').includes('health')).length, icon: <HeartPulse size={14} /> },
              { id: 'term', label: 'Term Life', count: policies.filter(p => (p.insurance_type || '').includes('term')).length, icon: <Shield size={14} /> },
            ].map((c) => {
              const isSelected = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 14,
                    border: isSelected ? '1.5px solid #111111' : '1px solid rgba(17, 17, 17, 0.15)',
                    background: isSelected ? '#DED8ED' : 'rgba(255, 255, 255, 0.75)',
                    color: isSelected ? '#111111' : '#1C1C1C',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {c.icon}
                  <span>{c.label} ({c.count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Policies List */}
        {activeTab === 'policies' && (
          filtered.length === 0 ? (
            <div
              style={{
                padding: '64px 32px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.78)',
                backdropFilter: 'blur(20px)',
                borderRadius: 24,
                border: '1px solid rgba(255, 255, 255, 0.85)',
                boxShadow: '0 12px 36px 0 rgba(17, 17, 17, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: '#111111',
                  color: '#DED8ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  boxShadow: '0 4px 14px rgba(17, 17, 17, 0.25)',
                }}
              >
                <ShieldCheck size={32} color="#DED8ED" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1C1C1C', margin: '0 0 8px' }}>
                No policies stored in this category
              </h3>
              <p style={{ fontSize: 14, color: '#666666', maxWidth: 460, margin: '0 auto 24px', lineHeight: 1.5 }}>
                Issue a new verified policy from our marketplace or compare underwriting portals to add contracts into your digital vault.
              </p>
              <Link
                to="/policies"
                style={{
                  padding: '12px 24px',
                  borderRadius: 14,
                  background: '#111111',
                  color: '#DED8ED',
                  fontWeight: 800,
                  fontSize: 14,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(17, 17, 17, 0.25)',
                }}
              >
                <span>Browse All Policies</span>
                <ArrowRight size={16} color="#DED8ED" />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
              {filtered.map((p, idx) => {
                const tag = getCategoryTag(p.insurance_type || p.category);
                const isExpiring = p.is_expiring_soon;

                return (
                  <div
                    key={p.id || p.policy_number}
                    className={`glass-interactive-card anim-fade-in stagger-${(idx % 6) + 1}`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.78)',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      borderRadius: 24,
                      border: '1px solid rgba(255, 255, 255, 0.85)',
                      padding: 26,
                      boxShadow: '0 12px 36px 0 rgba(17, 17, 17, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = '0 20px 48px rgba(17, 17, 17, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 12px 36px 0 rgba(17, 17, 17, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
                    }}
                  >
                    <div>
                      {/* Card Top: Logo, Category & Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <InsurerLogoBadge insurerName={p.insurer_name} size={44} rounded={12} />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                              <span
                                style={{
                                  background: '#DED8ED',
                                  color: '#111111',
                                  padding: '2px 8px',
                                  borderRadius: 8,
                                  fontSize: 11,
                                  fontWeight: 800,
                                }}
                              >
                                {tag.label}
                              </span>
                              <span
                                style={{
                                  background: isExpiring ? '#FEF3C7' : '#111111',
                                  color: isExpiring ? '#D97706' : '#DED8ED',
                                  padding: '2px 8px',
                                  borderRadius: 8,
                                  fontSize: 10.5,
                                  fontWeight: 800,
                                }}
                              >
                                {isExpiring ? 'EXPIRING SOON' : 'ACTIVE'}
                              </span>
                            </div>
                            <h3 style={{ fontSize: 17.5, fontWeight: 800, color: '#1C1C1C', margin: 0, lineHeight: 1.25 }}>
                              {p.product_name || p.name || 'Comprehensive Coverage'}
                            </h3>
                            <div style={{ fontSize: 12, color: '#666666', fontWeight: 600, marginTop: 2 }}>
                              {p.insurer_name}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 11, color: '#666666', fontWeight: 700 }}>Annual Premium</div>
                          <div style={{ fontSize: 18, fontWeight: 900, color: '#111111', marginTop: 2 }}>
                            {formatCurrency(p.premium)}
                          </div>
                        </div>
                      </div>

                      {/* Meta Grid Box */}
                      <div
                        style={{
                          background: '#EBEBEB',
                          borderRadius: 14,
                          padding: 14,
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 10,
                          fontSize: 12,
                          marginBottom: 16,
                          border: '1px solid rgba(17, 17, 17, 0.08)',
                        }}
                      >
                        <div>
                          <span style={{ color: '#666666' }}>Policy Number:</span>
                          <div style={{ fontWeight: 800, color: '#1C1C1C', marginTop: 2 }}>{p.policy_number}</div>
                        </div>

                        <div>
                          <span style={{ color: '#666666' }}>Cover Amount:</span>
                          <div style={{ fontWeight: 800, color: '#111111', marginTop: 2 }}>
                            {formatCurrency(p.coverage_amount || p.idv)}
                          </div>
                        </div>

                        {p.vehicle_registration && (
                          <div>
                            <span style={{ color: '#666666' }}>Vehicle:</span>
                            <div style={{ fontWeight: 800, color: '#1C1C1C', marginTop: 2 }}>{p.vehicle_registration}</div>
                          </div>
                        )}

                        <div>
                          <span style={{ color: '#666666' }}>Valid Till:</span>
                          <div style={{ fontWeight: 700, color: '#1C1C1C', marginTop: 2 }}>
                            {p.end_date ? new Date(p.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '31 Dec 2027'}
                          </div>
                        </div>
                      </div>

                      {p.notes && (
                        <p style={{ fontSize: 12, color: '#666666', margin: '0 0 16px', lineHeight: 1.5 }}>
                          {p.notes}
                        </p>
                      )}
                    </div>

                    {/* Card Actions: Download e-Policy & Renew */}
                    <div style={{ display: 'flex', gap: 10, paddingTop: 14, borderTop: '1px solid rgba(17, 17, 17, 0.08)' }}>
                      <button
                        type="button"
                        className="glass-btn"
                        onClick={() => downloadPolicyPdf(p)}
                        style={{
                          flex: 1,
                          padding: '11px 14px',
                          borderRadius: 12,
                          border: '1px solid rgba(17, 17, 17, 0.2)',
                          background: '#FFFFFF',
                          color: '#1C1C1C',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Download size={15} color="#111111" />
                        <span>Download e-Policy</span>
                      </button>

                      <button
                        type="button"
                        className="glass-btn btn-pulse-cta"
                        onClick={() => {
                          setRenewProduct({
                            id: p.id || p.product_id || 1,
                            name: `${p.product_name || p.name || 'Comprehensive Coverage'} (Annual Renewal)`,
                            product_name: p.product_name || p.name || 'Comprehensive Coverage',
                            insurer_name: p.insurer_name || 'ICICI Lombard General',
                            category: p.insurance_type || p.category || 'motor',
                            insurance_type: p.insurance_type || p.category || 'motor',
                            premium: Math.round((p.premium || 12000) * 0.95),
                            coverage_amount: p.coverage_amount || p.idv || 1000000,
                            vehicleRegistration: p.vehicle_registration,
                            policy_number: p.policy_number,
                            isRenewal: true,
                          });
                        }}
                        style={{
                          padding: '11px 18px',
                          borderRadius: 12,
                          border: 'none',
                          background: '#111111',
                          color: '#DED8ED',
                          fontSize: 12.5,
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 2px 8px rgba(17, 17, 17, 0.25)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <RefreshCw size={13} color="#DED8ED" />
                        <span>Renew ➔</span>
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
            <div
              style={{
                padding: '64px 32px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.78)',
                backdropFilter: 'blur(20px)',
                borderRadius: 24,
                border: '1px solid rgba(255, 255, 255, 0.85)',
                boxShadow: '0 12px 36px 0 rgba(17, 17, 17, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: '#111111',
                  color: '#DED8ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  boxShadow: '0 4px 14px rgba(17, 17, 17, 0.25)',
                }}
              >
                <ClipboardList size={32} color="#DED8ED" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1C1C1C', margin: '0 0 8px' }}>
                No Claims on Record
              </h3>
              <p style={{ fontSize: 14, color: '#666666', maxWidth: 460, margin: '0 auto 24px', lineHeight: 1.5 }}>
                You have a 100% clean claim track record. Enjoy your full No Claim Bonus (NCB) retention and loyalty discounts.
              </p>
              <button
                onClick={() => setShowFNOLModal(true)}
                style={{
                  padding: '12px 24px',
                  borderRadius: 14,
                  border: 'none',
                  background: '#111111',
                  color: '#DED8ED',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(17, 17, 17, 0.25)',
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
                    background: 'rgba(255, 255, 255, 0.78)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 20,
                    border: '1px solid rgba(255, 255, 255, 0.85)',
                    padding: 22,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                    boxShadow: '0 8px 24px rgba(17, 17, 17, 0.04)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: '#111111' }}>{c.claim_number}</span>
                      <span style={{ color: '#CBD5E1' }}>•</span>
                      <span style={{ fontSize: 12, color: '#666666', fontWeight: 600 }}>{c.claim_type}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1C1C1C' }}>{c.description}</div>
                    <div style={{ fontSize: 12, color: '#666666', marginTop: 2 }}>
                      {c.insurer_name} • Policy: {c.policy_number}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        background: '#DED8ED',
                        color: '#111111',
                        padding: '4px 12px',
                        borderRadius: 14,
                        fontSize: 11,
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        border: '1px solid #111111',
                      }}
                    >
                      {c.status || 'SUBMITTED'}
                    </span>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#111111', marginTop: 6 }}>
                      {formatCurrency(c.estimated_loss || 28000)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* FNOL Modal with Modern Glassmorphism */}
        {showFNOLModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(17, 17, 17, 0.75)',
              backdropFilter: 'blur(10px)',
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
                maxWidth: 540,
                width: '100%',
                padding: 30,
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(17, 17, 17, 0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1C1C1C', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={20} color="#111111" /> File FNOL Claim Notice
                </h3>
                <button
                  onClick={() => setShowFNOLModal(false)}
                  style={{ background: '#EBEBEB', border: 'none', borderRadius: '50%', width: 28, height: 28, fontSize: 14, color: '#666666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>

              {fnolSuccess ? (
                <div style={{ padding: 16, background: '#DED8ED', borderRadius: 14, color: '#111111', textAlign: 'center', fontWeight: 800, border: '1.5px solid #111111' }}>
                  {fnolSuccess}
                </div>
              ) : (
                <form onSubmit={handleFNOLSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#1C1C1C', display: 'block', marginBottom: 4 }}>Select Policy</label>
                    <select
                      value={fnolForm.policy_id}
                      onChange={(e) => setFnolForm({ ...fnolForm, policy_id: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid rgba(17, 17, 17, 0.18)', fontSize: 13.5, background: '#FFFFFF', outline: 'none' }}
                    >
                      {policies.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.policy_number} - {p.product_name || p.name} ({p.insurer_name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#1C1C1C', display: 'block', marginBottom: 4 }}>Claim Type</label>
                    <select
                      value={fnolForm.claim_type}
                      onChange={(e) => setFnolForm({ ...fnolForm, claim_type: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid rgba(17, 17, 17, 0.18)', fontSize: 13.5, background: '#FFFFFF', outline: 'none' }}
                    >
                      <option value="Accidental Damage (Own Damage)">Accidental Vehicle Damage</option>
                      <option value="Cashless Hospitalization">Cashless Hospitalization (Health)</option>
                      <option value="Critical Illness Cash Benefit">Critical Illness Lump Sum (Health)</option>
                      <option value="Term Life Claim">Term Life Claim Notification</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#1C1C1C', display: 'block', marginBottom: 4 }}>Incident Details / Loss Description</label>
                    <textarea
                      rows={3}
                      value={fnolForm.description}
                      onChange={(e) => setFnolForm({ ...fnolForm, description: e.target.value })}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid rgba(17, 17, 17, 0.18)', fontSize: 13.5, background: '#FFFFFF', outline: 'none' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={fnolSubmitting}
                    style={{
                      marginTop: 10,
                      padding: '14px 20px',
                      borderRadius: 14,
                      border: '1px solid rgba(222, 216, 237, 0.45)',
                      background: 'linear-gradient(135deg, #111111 0%, #2A2A2A 100%)',
                      color: '#DED8ED',
                      fontWeight: 800,
                      fontSize: 14.5,
                      cursor: fnolSubmitting ? 'wait' : 'pointer',
                      boxShadow: '0 4px 14px rgba(17, 17, 17, 0.25)',
                    }}
                  >
                    {fnolSubmitting ? 'Submitting Notice...' : 'Submit FNOL Claim ➔'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Wallet Top-up Modal */}
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
    </div>
  );
}
