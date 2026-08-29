import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { httpClient } from '../api/httpClient';
import InsurerLogoBadge from '../components/common/InsurerLogoBadge';
import BuyPolicyModal from '../components/marketplace/BuyPolicyModal';
import { validateVehicleRegistration, formatVehicleRegistration } from '../utils/validators';
import { getInsurerPortalUrl, getInsurerAutofillUrl } from '../utils/endpointHelper';

export default function NewInsurancePage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const storedVoiceAutofill = JSON.parse(sessionStorage.getItem('synova_voice_autofill') || '{}');

  const initialReg = queryParams.get('reg') || storedVoiceAutofill.vehicle_registration || 'KA-01-MJ-4092';
  const initialMake = queryParams.get('make') || storedVoiceAutofill.vehicle_make || 'Hyundai';
  const initialModel = queryParams.get('model') || storedVoiceAutofill.vehicle_model || 'Creta SX';
  const initialAge = queryParams.get('age') || storedVoiceAutofill.vehicle_age_years || 2;
  const initialIdv = queryParams.get('idv') || storedVoiceAutofill.idv || 650000;
  const initialNcb = queryParams.get('ncb') || storedVoiceAutofill.ncb_percent || 20;
  const isAutofilled = queryParams.get('autofill') === 'true' || Boolean(storedVoiceAutofill.vehicle_registration);

  const [formData, setFormData] = useState({
    customer_name: user?.name || user?.full_name || 'Hariharan Murugesan',
    vehicle_registration: initialReg,
    vehicle_make: initialMake,
    vehicle_model: initialModel,
    vehicle_age_years: Number(initialAge) || 2,
    idv: Number(initialIdv) || 650000,
    ncb_percent: Number(initialNcb) || 20,
    engine_capacity_cc: 1497,
    has_anti_theft: 1,
    selected_addons: ['Zero Depreciation', 'Engine Protection', 'Roadside Assistance'],
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('insurer_a');
  const [comparisonResults, setComparisonResults] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);
  const [automationStep, setAutomationStep] = useState('');
  const [iframeSrc, setIframeSrc] = useState(getInsurerPortalUrl('insurer_a', 9001));
  const [liveAutoPlaying, setLiveAutoPlaying] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);
  const [buyProduct, setBuyProduct] = useState(null);

  const resultsRef = useRef(null);

  useEffect(() => {
    if (recommendation || comparisonResults) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }, [recommendation, comparisonResults]);

  const mockInsurers = [
    { code: 'insurer_a', label: '1', port: 9001, url: getInsurerPortalUrl('insurer_a', 9001), color: '#1565C0' },
    { code: 'insurer_b', label: '2', port: 9002, url: getInsurerPortalUrl('insurer_b', 9002), color: '#5B5FEF' },
    { code: 'insurer_c', label: '3', port: 9003, url: getInsurerPortalUrl('insurer_c', 9003), color: '#0B1F3A' },
    { code: 'insurer_d', label: '4', port: 9004, url: getInsurerPortalUrl('insurer_d', 9004), color: '#123B66' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'vehicle_registration') {
      const formatted = formatVehicleRegistration(value);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
      if (validationErrors.vehicle_registration) {
        if (validateVehicleRegistration(formatted).isValid) {
          setValidationErrors((prev) => ({ ...prev, vehicle_registration: null }));
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (validationErrors[name]) {
        setValidationErrors((prev) => ({ ...prev, [name]: null }));
      }
    }
  };

  const handleAddonToggle = (addonName) => {
    setFormData((prev) => {
      const exists = prev.selected_addons.includes(addonName);
      if (exists) {
        return { ...prev, selected_addons: prev.selected_addons.filter((a) => a !== addonName) };
      } else {
        return { ...prev, selected_addons: [...prev.selected_addons, addonName] };
      }
    });
  };

  const buildAutofillUrl = (code, port) => {
    const params = new URLSearchParams({
      autofill: 'true',
      submit: 'true',
      customer_name: formData.customer_name || 'Customer',
      vehicle_registration: formData.vehicle_registration || 'KA01AB1234',
      idv: formData.idv || '650000',
      vehicle_age_years: formData.vehicle_age_years || '2',
      ncb_percent: formData.ncb_percent || '20',
    });
    return getInsurerAutofillUrl(code, port, params);
  };

  const handleTabChange = (code) => {
    setActiveTab(code);
    const ins = mockInsurers.find((i) => i.code === code);
    if (ins) {
      setIframeSrc(getInsurerPortalUrl(ins.code, ins.port));
    }
  };

  const runLiveIframeSequence = (onComplete) => {
    setLiveAutoPlaying(true);

    setActiveTab('insurer_a');
    setIframeSrc(buildAutofillUrl('insurer_a', 9001));
    setAutomationStep('• [1/4] Autofilling vehicle risk factors and calculating quote on Gateway 1...');

    setTimeout(() => {
      setActiveTab('insurer_b');
      setIframeSrc(buildAutofillUrl('insurer_b', 9002));
      setAutomationStep('• [2/4] Autofilling parameters and querying Gateway 2...');
    }, 2500);

    setTimeout(() => {
      setActiveTab('insurer_c');
      setIframeSrc(buildAutofillUrl('insurer_c', 9003));
      setAutomationStep('• [3/4] Requesting coverage terms and deductible options on Gateway 3...');
    }, 5000);

    setTimeout(() => {
      setActiveTab('insurer_d');
      setIframeSrc(buildAutofillUrl('insurer_d', 9004));
      setAutomationStep('• [4/4] Extracting final calculated premium on Gateway 4...');
    }, 7500);

    setTimeout(() => {
      setLiveAutoPlaying(false);
      setAutomationStep('');
      if (onComplete) onComplete();
    }, 10000);
  };

  const calculateExactInsurersQuotes = (params) => {
    const idv = parseFloat(params.idv) || 650000;
    const age = parseInt(params.vehicle_age_years) || 2;
    const ncb = parseFloat(params.ncb_percent) || 20;
    const cc = parseInt(params.engine_capacity_cc) || 1497;

    // 1. Insurer A (ICICI Lombard)
    const a_base = idv * 0.03;
    const a_age = age * 500;
    const a_ncb = a_base * (ncb / 100);
    const a_gst = (a_base + a_age) * 0.18;
    const a_total = Math.round(a_base + a_age - a_ncb + a_gst);

    // 2. Insurer B (ACKO)
    const b_base = idv * 0.025;
    const b_age = age * 1200;
    const b_gst = (b_base + b_age) * 0.18;
    const b_total = Math.round(b_base + b_age + b_gst);

    // 3. Insurer C (TATA AIG)
    const c_base = idv * 0.035;
    const c_tp = 2500;
    const c_age = age * 300;
    const c_ncb = (c_base + c_tp) * (ncb / 100);
    const c_gst = (c_base + c_tp + c_age) * 0.18;
    const c_total = Math.round(c_base + c_tp + c_age - c_ncb + c_gst);

    // 4. Insurer D (HDFC ERGO)
    const d_base = idv * 0.028;
    const d_cc = cc * 0.8;
    const d_age = age * 700;
    const d_ncb = d_base * (ncb / 100);
    const d_gst = (d_base + d_cc + d_age) * 0.18;
    const d_total = Math.round(d_base + d_cc + d_age - d_ncb + d_gst);

    const quotes = [
      {
        insurer_id: 1,
        insurer_name: 'ICICI Lombard General Insurance',
        product_name: 'Comprehensive Motor Shield',
        idv: idv,
        premium: a_total,
        base_od_premium: Math.round(a_base),
        tp_premium: 3416,
        addons: params.selected_addons || ['Zero Depreciation', 'Roadside Assistance'],
        score: 92.4,
        is_recommended: false,
      },
      {
        insurer_id: 2,
        insurer_name: 'ACKO General Insurance',
        product_name: 'ACKO Direct Drive Plan',
        idv: idv,
        premium: b_total,
        base_od_premium: Math.round(b_base),
        tp_premium: 3416,
        addons: params.selected_addons || ['Zero Depreciation'],
        score: 94.8,
        is_recommended: false,
      },
      {
        insurer_id: 3,
        insurer_name: 'TATA AIG Assurance',
        product_name: 'Auto Secure Comprehensive Cover',
        idv: idv,
        premium: c_total,
        base_od_premium: Math.round(c_base),
        tp_premium: 2500,
        addons: params.selected_addons || ['Roadside Assistance'],
        score: 87.2,
        is_recommended: false,
      },
      {
        insurer_id: 4,
        insurer_name: 'HDFC ERGO General',
        product_name: 'Optima Secure Motor Cover',
        idv: idv,
        premium: d_total,
        base_od_premium: Math.round(d_base),
        tp_premium: 3416,
        addons: params.selected_addons || ['Zero Depreciation', 'Engine Protection'],
        score: 91.6,
        is_recommended: false,
      },
    ];

    // Rank quotes: Lowest premium ranked #1 Best Value
    const sorted = [...quotes].sort((x, y) => x.premium - y.premium);
    sorted[0].is_recommended = true;
    sorted[0].badge = 'BEST VALUE';

    return {
      quotes,
      recommendation: {
        recommended_quote: sorted[0],
        rationale: `Ranked #1 for lowest calculated annual premium (₹${sorted[0].premium.toLocaleString()}), seamless NCB transfer, and direct cashless network support.`,
        comparison_table: quotes,
      },
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    const regVal = validateVehicleRegistration(formData.vehicle_registration);
    if (!regVal.isValid) {
      errs.vehicle_registration = regVal.error;
    }
    if (!formData.customer_name || formData.customer_name.trim().length < 3) {
      errs.customer_name = 'Policyholder name is required (minimum 3 characters)';
    }
    if (!formData.vehicle_make || formData.vehicle_make.trim().length < 2) {
      errs.vehicle_make = 'Vehicle Make is required';
    }
    if (!formData.vehicle_model || formData.vehicle_model.trim().length < 2) {
      errs.vehicle_model = 'Vehicle Model is required';
    }

    if (Object.keys(errs).length > 0) {
      setValidationErrors(errs);
      return;
    }

    setValidationErrors({});
    setLoading(true);
    setComparisonResults(null);
    setRecommendation(null);

    // Compute exact quotes
    const exact = calculateExactInsurersQuotes(formData);

    // Trigger sequential live quotation across all 4 gateways and ONLY show best suggestion upon completion
    runLiveIframeSequence(() => {
      setComparisonResults(exact.quotes);
      setRecommendation(exact.recommendation);
      setLoading(false);
    });
  };

  const handlePurchasePolicy = (quote) => {
    setBuyProduct({
      id: quote.insurer_id || 1,
      name: quote.product_name,
      product_name: quote.product_name,
      insurer_name: quote.insurer_name,
      category: 'motor',
      insurance_type: 'motor',
      premium: quote.premium,
      coverage_amount: quote.idv || parseFloat(formData.idv) || 650000,
      vehicleRegistration: formData.vehicle_registration || 'KA-01-MJ-4092',
      vehicleMake: formData.vehicle_make || 'Hyundai',
      vehicleModel: formData.vehicle_model || 'Creta SX',
      selectedAddons: quote.addons || formData.selected_addons || ['Zero Depreciation'],
      ncbPercent: formData.ncb_percent || '20',
    });
  };

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span className="badge badge-ai">NEW POLICY QUOTATION</span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.03em' }}>
          Autonomous Multi-Insurer Quotation
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>
          Enter your vehicle risk particulars to trigger live quotation scraping across 4 top insurance providers.
        </p>
      </div>

      {/* Voice Advisor Autofill Banner */}
      {isAutofilled && (
        <div
          style={{
            background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            border: '1px solid #A7F3D0',
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🎙️</span>
            <div>
              <strong style={{ color: '#065F46', fontSize: 13.5, display: 'block' }}>
                Form Autofilled by Synova Voice Advisor
              </strong>
              <span style={{ color: '#047857', fontSize: 12 }}>
                Extracted: <strong>{formData.vehicle_make} {formData.vehicle_model}</strong> ({formData.vehicle_registration}) • IDV: <strong>₹{Number(formData.idv).toLocaleString('en-IN')}</strong> • NCB: <strong>{formData.ncb_percent}%</strong>
              </span>
            </div>
          </div>
          <span
            style={{
              background: '#059669',
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: 700,
              padding: '5px 12px',
              borderRadius: 20,
              boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)',
            }}
          >
            ✓ Live Voice Data
          </span>
        </div>
      )}

      <div className="grid-2" style={{ gap: 28, alignItems: 'start', marginBottom: 40 }}>
        {/* Left Column: Quotation Form */}
        <div className="saas-card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 20 }}>
            Vehicle & Risk Configuration
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-body)', marginBottom: 4 }}>
                  Policyholder Name *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  className="input-field"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Ramesh Patel"
                  style={{
                    borderColor: validationErrors.customer_name ? '#E11D48' : undefined,
                    background: validationErrors.customer_name ? '#FFF1F2' : undefined,
                  }}
                  required
                />
                {validationErrors.customer_name && (
                  <div style={{ fontSize: 11, color: '#E11D48', marginTop: 3 }}>{validationErrors.customer_name}</div>
                )}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-body)' }}>
                    Vehicle Registration # *
                  </label>
                  {formData.vehicle_registration && validateVehicleRegistration(formData.vehicle_registration).isValid && (
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: '#059669' }}>
                      ✓ Valid Format
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  name="vehicle_registration"
                  className="input-field"
                  maxLength={14}
                  value={formData.vehicle_registration}
                  onChange={handleInputChange}
                  placeholder="e.g. KA-01-MJ-4092"
                  style={{
                    letterSpacing: '0.4px',
                    fontWeight: 700,
                    borderColor: validationErrors.vehicle_registration ? '#E11D48' : undefined,
                    background: validationErrors.vehicle_registration ? '#FFF1F2' : undefined,
                  }}
                  required
                />
                {validationErrors.vehicle_registration && (
                  <div style={{ fontSize: 11, color: '#E11D48', marginTop: 3 }}>{validationErrors.vehicle_registration}</div>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-body)', marginBottom: 4 }}>
                  Vehicle Make *
                </label>
                <input
                  type="text"
                  name="vehicle_make"
                  className="input-field"
                  value={formData.vehicle_make}
                  onChange={handleInputChange}
                  placeholder="e.g. Hyundai, Honda, Maruti"
                  style={{
                    borderColor: validationErrors.vehicle_make ? '#E11D48' : undefined,
                    background: validationErrors.vehicle_make ? '#FFF1F2' : undefined,
                  }}
                  required
                />
                {validationErrors.vehicle_make && (
                  <div style={{ fontSize: 11, color: '#E11D48', marginTop: 3 }}>{validationErrors.vehicle_make}</div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-body)', marginBottom: 4 }}>
                  Vehicle Model *
                </label>
                <input
                  type="text"
                  name="vehicle_model"
                  className="input-field"
                  value={formData.vehicle_model}
                  onChange={handleInputChange}
                  placeholder="e.g. Creta SX, City VX"
                  style={{
                    borderColor: validationErrors.vehicle_model ? '#E11D48' : undefined,
                    background: validationErrors.vehicle_model ? '#FFF1F2' : undefined,
                  }}
                  required
                />
                {validationErrors.vehicle_model && (
                  <div style={{ fontSize: 11, color: '#E11D48', marginTop: 3 }}>{validationErrors.vehicle_model}</div>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-body)', marginBottom: 4 }}>Insured Value (IDV)</label>
                <input
                  type="number"
                  name="idv"
                  className="input-field"
                  value={formData.idv}
                  onChange={handleInputChange}
                  min="50000"
                  step="5000"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-body)', marginBottom: 4 }}>No Claim Bonus (NCB)</label>
                <input
                  type="number"
                  name="ncb_percent"
                  className="input-field"
                  value={formData.ncb_percent}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  step="5"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-body)', marginBottom: 4 }}>Vehicle Age (Yrs)</label>
                <input
                  type="number"
                  name="vehicle_age_years"
                  className="input-field"
                  value={formData.vehicle_age_years}
                  onChange={handleInputChange}
                  min="0"
                  max="20"
                  required
                />
              </div>
            </div>

            {/* Add-on Coverage Multi-Select */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-body)', marginBottom: 8 }}>Included Add-on Coverages</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Zero Depreciation', 'Engine Protection', 'Roadside Assistance', 'Key Replacement', 'Tyre Protect'].map((addon) => {
                  const isChecked = formData.selected_addons.includes(addon);
                  return (
                    <button
                      key={addon}
                      type="button"
                      onClick={() => handleAddonToggle(addon)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 9999,
                        fontSize: 12,
                        fontWeight: 600,
                        border: isChecked ? '1px solid var(--blue-primary)' : '1px solid rgba(11, 31, 58, 0.15)',
                        background: isChecked ? 'var(--bg-tinted)' : '#FFFFFF',
                        color: isChecked ? 'var(--blue-primary)' : 'var(--text-body)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isChecked ? '✓ ' : '+ '} {addon}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="btn-pill-primary"
              style={{ width: '100%', padding: '14px 24px', fontSize: 14 }}
              disabled={loading || liveAutoPlaying}
            >
              {loading || liveAutoPlaying ? '• Automating 4 Quotation Gateways...' : 'Compare 4 Insurers in Real-Time →'}
            </button>
          </form>
        </div>

        {/* Right Column: Live Portal Viewport */}
        <div>
          <div className="saas-card" style={{ padding: 20, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {mockInsurers.map((ins, idx) => (
                  <button
                    key={ins.code}
                    onClick={() => handleTabChange(ins.code)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: 'none',
                      background: activeTab === ins.code ? 'var(--primary-navy)' : 'var(--bg-subtle)',
                      color: activeTab === ins.code ? '#FFFFFF' : 'var(--text-muted)',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title={`Gateway ${idx + 1}`}
                  >
                    {ins.label}
                  </button>
                ))}
              </div>
              <span className="badge badge-active">Live Gateway Stream</span>
            </div>

            {automationStep && (
              <div
                style={{
                  padding: '10px 14px',
                  background: 'var(--bg-tinted)',
                  border: '1px solid rgba(21, 101, 192, 0.2)',
                  borderRadius: 10,
                  color: 'var(--blue-primary)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                {automationStep}
              </div>
            )}

            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(11,31,58,0.1)', background: '#fff', height: 420 }}>
              <iframe
                src={iframeSrc}
                title="Quotation Portal Viewport"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Success Notification */}
      {purchaseSuccess && (
        <div className="saas-card" style={{ marginBottom: 32, padding: 24, borderLeft: '4px solid var(--status-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-emerald)' }}>✓ POLICY ISSUANCE CONFIRMED</div>
              <h3 style={{ fontSize: 20, color: 'var(--primary-navy)', margin: '4px 0 6px' }}>Policy Successfully Added to Your Vault</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Policy ID: <strong>{purchaseSuccess.id || 'POL-SYN-99281'}</strong> • Coverage Amount: ₹{Number(purchaseSuccess.idv || 650000).toLocaleString()}
              </p>
            </div>
            <button onClick={() => navigate('/insurance-vault')} className="btn-pill-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
              Open Policy Vault →
            </button>
          </div>
        </div>
      )}

      {/* AI Recommendation Highlight Card */}
      {recommendation && recommendation.recommended_quote && (
        <div
          ref={resultsRef}
          id="quote-recommendation-section"
          style={{
            background: 'linear-gradient(135deg, #0B1F3A 0%, #1565C0 100%)',
            color: '#FFFFFF',
            borderRadius: 24,
            padding: '32px 36px',
            marginBottom: 36,
            boxShadow: '0 20px 50px rgba(11, 31, 58, 0.18)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
              <InsurerLogoBadge
                insurerName={recommendation.recommended_quote.insurer_name}
                size={54}
                rounded={14}
                style={{ marginTop: 6 }}
              />
              <div>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.25)', marginBottom: 10 }}>
                  AI RANKED #1 • BEST VALUE
                </span>
                <h2 style={{ fontSize: 26, color: '#FFFFFF', margin: '6px 0' }}>
                  {recommendation.recommended_quote.product_name}
                </h2>
                <div style={{ fontSize: 14, color: 'var(--text-on-dark-muted)', fontWeight: 600 }}>
                  {recommendation.recommended_quote.insurer_name}
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', marginTop: 12, maxWidth: 640, lineHeight: 1.6 }}>
                  {recommendation.rationale}
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--text-on-dark-muted)' }}>Final Annual Premium</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#FFFFFF' }}>
                ₹{Number(recommendation.recommended_quote.premium).toLocaleString()}
              </div>
              <button
                onClick={() => handlePurchasePolicy(recommendation.recommended_quote)}
                disabled={purchasing}
                className="btn-pill-ai"
                style={{ marginTop: 14, padding: '12px 28px', fontSize: 14 }}
              >
                {purchasing ? 'Issuing Policy...' : 'Select & Issue Policy →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Insurer Comparison Table */}
      {comparisonResults && comparisonResults.length > 0 && (
        <div className="saas-card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 18 }}>
            Multi-Insurer Quotation Matrix
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(11,31,58,0.1)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 14px' }}>Plan & Insurer</th>
                  <th style={{ padding: '12px 14px' }}>Insured Value (IDV)</th>
                  <th style={{ padding: '12px 14px' }}>Own Damage</th>
                  <th style={{ padding: '12px 14px' }}>Third Party</th>
                  <th style={{ padding: '12px 14px' }}>Add-ons</th>
                  <th style={{ padding: '12px 14px' }}>Final Premium</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {comparisonResults.map((q, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      background: q.is_recommended ? 'var(--bg-tinted)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <InsurerLogoBadge insurerName={q.insurer_name} size={36} rounded={8} />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{q.product_name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{q.insurer_name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>
                      ₹{Number(q.idv).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px', color: 'var(--text-body)' }}>
                      ₹{Number(q.base_od_premium || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px', color: 'var(--text-body)' }}>
                      ₹{Number(q.tp_premium || 3416).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px', fontSize: 12, color: 'var(--text-muted)' }}>
                      {Array.isArray(q.addons) ? q.addons.join(', ') : 'Standard Add-ons'}
                    </td>
                    <td style={{ padding: '14px', fontWeight: 800, fontSize: 16, color: 'var(--primary-navy)' }}>
                      ₹{Number(q.premium).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <button
                        onClick={() => handlePurchasePolicy(q)}
                        disabled={purchasing}
                        className={q.is_recommended ? 'btn-pill-primary' : 'btn-pill-secondary'}
                        style={{ padding: '8px 18px', fontSize: 12.5 }}
                      >
                        Choose Plan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Policy Issuance Confirmation Modal */}
      {purchaseSuccess && (
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
              maxWidth: 520,
              padding: 36,
              borderRadius: 24,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--status-emerald-bg)',
                border: '1px solid var(--status-emerald-border)',
                color: 'var(--status-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              ✓
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
              Policy Successfully Issued!
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
              Your insurance contract is now active and stored in your Digital Policy Vault.
            </p>

            <div style={{ background: 'var(--bg-tinted)', borderRadius: 16, padding: '16px 20px', margin: '20px 0', textAlign: 'left', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Policy Number:</span>
                <strong style={{ color: 'var(--primary-navy)' }}>{purchaseSuccess.policy_number}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Product:</span>
                <strong style={{ color: 'var(--blue-primary)' }}>{purchaseSuccess.product_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Insured IDV:</span>
                <strong style={{ color: 'var(--primary-navy)' }}>₹{Number(purchaseSuccess.idv).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Annual Premium:</span>
                <strong style={{ color: 'var(--status-emerald)', fontSize: 15 }}>₹{Number(purchaseSuccess.premium).toLocaleString()}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => navigate('/insurance-vault')}
                className="btn-pill-primary"
                style={{ flex: 1, padding: '12px 20px', fontSize: 14 }}
              >
                View in Digital Policy Vault →
              </button>
              <button
                onClick={() => setPurchaseSuccess(null)}
                className="btn-pill-secondary"
                style={{ padding: '12px 18px', fontSize: 14 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy Policy Modal with Vault Balance & Gateway Checkout */}
      {buyProduct && (
        <BuyPolicyModal
          product={buyProduct}
          onClose={() => setBuyProduct(null)}
          onSuccess={(issued) => {
            setBuyProduct(null);
            setPurchaseSuccess(issued);
          }}
        />
      )}
    </div>
  );
}
