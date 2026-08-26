import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { httpClient } from '../api/httpClient';

export default function InsuranceVaultPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFNOLModal, setShowFNOLModal] = useState(false);
  const [fnolSubmitting, setFnolSubmitting] = useState(false);
  const [fnolSuccess, setFnolSuccess] = useState('');

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

  const userKey = user ? (user.id || user.email) : 'guest';

  useEffect(() => {
    fetchVaultPolicies();
    fetchClaimsData();

    const handlePolicyUpdate = () => {
      fetchVaultPolicies();
      fetchClaimsData();
    };
    window.addEventListener('synova_policy_purchased', handlePolicyUpdate);
    window.addEventListener('storage', handlePolicyUpdate);

    return () => {
      window.removeEventListener('synova_policy_purchased', handlePolicyUpdate);
      window.removeEventListener('storage', handlePolicyUpdate);
    };
  }, [userKey]);

  const fetchVaultPolicies = async () => {
    setLoading(true);
    const uKey = user ? (user.id || user.email) : 'guest';
    const rawKeys = [
      `synova_vault_policies_${uKey}`,
      `synova_vault_policies_user_${uKey}`,
      user?.id ? `synova_vault_policies_${user.id}` : null,
      user?.id ? `synova_vault_policies_user_${user.id}` : null,
      user?.email ? `synova_vault_policies_${user.email}` : null,
      user?.email ? `synova_vault_policies_user_${user.email}` : null,
      !user ? 'synova_vault_policies_guest' : null,
    ].filter(Boolean);

    let localPols = [];
    const seenLocal = new Set();
    for (const k of rawKeys) {
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
      } catch (e) {}
    }

    try {
      if (user && user.id) {
        const res = await httpClient.get(`/policies/?customer_id=${user.id}`);
        const serverPolicies = Array.isArray(res.data) ? res.data : [];
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
      } else {
        setPolicies(localPols);
        if (localPols.length > 0) {
          setFnolForm((prev) => ({ ...prev, policy_id: localPols[0].id }));
        }
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
    const localClaims = JSON.parse(localStorage.getItem(`synova_vault_claims_${userKey}`) || '[]');
    try {
      if (user && user.id) {
        const res = await httpClient.get(`/claims/customer/${user.id}`);
        const serverClaims = Array.isArray(res.data) ? res.data : [];
        const combined = [...localClaims, ...serverClaims];
        setClaims(combined);
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
      customer_email: user?.email || 'customer@synova.io',
      vehicle_details: `${selectedPolicy.vehicle_make || 'Hyundai'} ${selectedPolicy.vehicle_model || 'Creta SX'} (${selectedPolicy.vehicle_registration || 'KA-01-MJ-4092'})`,
      claim_type: fnolForm.claim_type,
      incident_date: fnolForm.incident_date,
      incident_location: fnolForm.incident_location,
      description: fnolForm.description,
      estimated_loss: parseFloat(fnolForm.estimated_loss) || 28000,
      approved_amount: 0,
      net_payout: 0,
      garage_name: fnolForm.garage_name || 'Authorized Cashless Service Hub',
      garage_city: fnolForm.garage_city || 'Bangalore',
      status: 'UNDER REVIEW',
      created_at: new Date().toISOString(),
    };

    // Save claim locally for this user
    const existingClaims = JSON.parse(localStorage.getItem(`synova_vault_claims_${userKey}`) || '[]');
    localStorage.setItem(`synova_vault_claims_${userKey}`, JSON.stringify([newClaimObj, ...existingClaims]));
    setClaims((prev) => [newClaimObj, ...prev]);

    try {
      await httpClient.post('/claims/fnol', {
        policy_id: parseInt(fnolForm.policy_id) || 1,
        claim_type: fnolForm.claim_type,
        incident_date: fnolForm.incident_date,
        incident_location: fnolForm.incident_location,
        description: fnolForm.description,
        estimated_loss: parseFloat(fnolForm.estimated_loss),
        garage_name: fnolForm.garage_name,
        garage_city: fnolForm.garage_city,
      });
    } catch (err) {
      console.log('Claim saved locally:', err);
    } finally {
      setFnolSuccess(`✓ First Notice of Loss submitted! Claim Ref #${newClaimNumber}`);
      setFnolSubmitting(false);
      setTimeout(() => {
        setShowFNOLModal(false);
        setFnolSuccess('');
        setActiveTab('claims');
      }, 2000);
    }
  };

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Header with Title & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <div>
          <span className="badge badge-ai" style={{ marginBottom: 8 }}>INTELLIGENT VAULT</span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.03em' }}>
            Digital Policy Vault & Claims
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>
            Manage active insurance contracts, inspect coverage limits, and submit instant First Notice of Loss (FNOL) claims.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setShowFNOLModal(true)} className="btn-pill-primary" style={{ padding: '12px 24px', fontSize: 14 }}>
            File FNOL Claim →
          </button>
          <Link to="/new-insurance" className="btn-pill-secondary" style={{ padding: '12px 22px', fontSize: 14 }}>
            + Add New Policy
          </Link>
        </div>
      </div>

      {/* Vault Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid rgba(11, 31, 58, 0.08)', paddingBottom: 16, marginBottom: 28 }}>
        <button
          onClick={() => setActiveTab('active')}
          className={activeTab === 'active' ? 'btn-pill-primary' : 'btn-pill-secondary'}
          style={{ padding: '8px 20px', fontSize: 13 }}
        >
          Active Policies ({policies.length})
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={activeTab === 'claims' ? 'btn-pill-primary' : 'btn-pill-secondary'}
          style={{ padding: '8px 20px', fontSize: 13 }}
        >
          Claims History ({claims.length})
        </button>
      </div>

      {/* Tab 1: Policies Grid */}
      {activeTab === 'active' && (
        policies.length === 0 ? (
          <div className="saas-card" style={{ padding: '64px 32px', textAlign: 'center' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--bg-tinted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--blue-primary)" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <path d="M7 8h10M7 12h6" />
              </svg>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary-navy)', margin: '0 0 8px' }}>
              Your Digital Policy Vault is Empty
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto 24px', lineHeight: 1.6 }}>
              You don't have any active policies stored yet. Compare real-time quotes or upload your existing policy document to get started.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <Link to="/new-insurance" className="btn-pill-primary" style={{ padding: '12px 24px', fontSize: 14 }}>
                + Compare New Insurance
              </Link>
              <Link to="/renew-insurance" className="btn-pill-secondary" style={{ padding: '12px 24px', fontSize: 14 }}>
                Upload Existing Policy
              </Link>
            </div>
          </div>
        ) : (
        <div className="grid-2" style={{ gap: 24 }}>
          {policies.map((p) => (
            <div key={p.id} className="saas-card" style={{ padding: 28, borderTop: '4px solid var(--blue-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <span className="badge badge-active" style={{ marginBottom: 6 }}>ACTIVE COVERAGE</span>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary-navy)', margin: '4px 0 2px' }}>
                    {p.product_name || p.plan_name || p.policy_type || 'Motor Comprehensive Cover'}
                  </h3>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.insurer_name || p.insurer || 'ICICI Lombard General'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Annual Premium</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary-navy)' }}>
                    ₹{Number(p.premium || p.premium_amount || 5780).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-tinted)', borderRadius: 14, padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, color: 'var(--text-body)', marginBottom: 20 }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Policy Number: </span>
                  <strong style={{ color: 'var(--primary-navy)' }}>{p.policy_number}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Insured IDV: </span>
                  <strong style={{ color: 'var(--blue-primary)' }}>₹{Number(p.idv || p.idv_amount || p.coverage_amount || 720000).toLocaleString()}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Vehicle Reg: </span>
                  <strong style={{ color: 'var(--primary-navy)' }}>{p.vehicle_registration || p.vehicle_number || 'KA-01-MJ-8821'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>NCB Discount: </span>
                  <strong style={{ color: 'var(--status-emerald)' }}>{p.ncb_percent || 20}%</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Expires: <strong>{p.end_date || '2026-08-15'}</strong>
                </div>
                <button
                  onClick={() => {
                    setFnolForm((prev) => ({ ...prev, policy_id: p.id }));
                    setShowFNOLModal(true);
                  }}
                  className="btn-pill-secondary"
                  style={{ padding: '8px 18px', fontSize: 12.5 }}
                >
                  File Claim on this Policy
                </button>
              </div>
            </div>
          ))}
        </div>
        )
      )}

      {/* Tab 2: Claims History */}
      {activeTab === 'claims' && (
        <div className="saas-card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 16 }}>
            First Notice of Loss & Claims Processing
          </h2>
          {claims.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
              <div style={{ width: 48, height: 48, margin: '0 auto 12px', borderRadius: '50%', background: 'var(--bg-tinted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue-primary)" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary-navy)' }}>No Active Claims</div>
              <p style={{ fontSize: 13, marginTop: 4 }}>You have a clean 100% claim-free record eligible for maximum NCB transfer savings.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {claims.map((c) => (
                <div key={c.id} style={{ padding: 18, borderRadius: 14, background: '#F8FAFD', border: '1px solid rgba(11,31,58,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--primary-navy)', fontSize: 15 }}>Claim #{c.claim_number}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>{c.claim_type} • {c.incident_location}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-warning">{c.status || 'UNDER REVIEW'}</span>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary-navy)', marginTop: 4 }}>₹{Number(c.estimated_loss || 28000).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FNOL Modal */}
      {showFNOLModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 31, 58, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            className="saas-card"
            style={{
              width: '100%',
              maxWidth: 580,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 32,
              borderRadius: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary-navy)' }}>
                First Notice of Loss (FNOL) Claim Filing
              </h2>
              <button onClick={() => setShowFNOLModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleFNOLSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-body)', marginBottom: 4 }}>Select Covered Policy</label>
                <select
                  className="input-field"
                  value={fnolForm.policy_id}
                  onChange={(e) => setFnolForm({ ...fnolForm, policy_id: e.target.value })}
                  required
                >
                  {policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.policy_number} - {p.vehicle_registration || p.product_name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-body)', marginBottom: 4 }}>Incident Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={fnolForm.incident_date}
                    onChange={(e) => setFnolForm({ ...fnolForm, incident_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-body)', marginBottom: 4 }}>Incident Location</label>
                  <input
                    type="text"
                    className="input-field"
                    value={fnolForm.incident_location}
                    onChange={(e) => setFnolForm({ ...fnolForm, incident_location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-body)', marginBottom: 4 }}>Damage Description</label>
                <textarea
                  className="input-field"
                  rows="3"
                  value={fnolForm.description}
                  onChange={(e) => setFnolForm({ ...fnolForm, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-body)', marginBottom: 4 }}>Estimated Loss (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={fnolForm.estimated_loss}
                    onChange={(e) => setFnolForm({ ...fnolForm, estimated_loss: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-body)', marginBottom: 4 }}>Preferred Cashless Garage</label>
                  <input
                    type="text"
                    className="input-field"
                    value={fnolForm.garage_name}
                    onChange={(e) => setFnolForm({ ...fnolForm, garage_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              {fnolSuccess && (
                <div style={{ padding: 12, background: 'var(--status-emerald-bg)', border: '1px solid var(--status-emerald-border)', borderRadius: 10, color: 'var(--status-emerald)', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                  {fnolSuccess}
                </div>
              )}

              <button type="submit" className="btn-pill-primary" style={{ width: '100%', padding: '14px', fontSize: 14 }} disabled={fnolSubmitting}>
                {fnolSubmitting ? 'Submitting to Insurer...' : 'Submit Claim Dispatch →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
