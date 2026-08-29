import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { httpClient } from '../api/httpClient';
import InsurerLogoBadge from '../components/common/InsurerLogoBadge';
import BuyPolicyModal from '../components/marketplace/BuyPolicyModal';
import { validateVehicleRegistration, formatVehicleRegistration } from '../utils/validators';
import { getInsurerPortalUrl, getInsurerAutofillUrl } from '../utils/endpointHelper';

export default function RenewInsurancePage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const storedVoiceAutofill = JSON.parse(sessionStorage.getItem('synova_voice_autofill') || '{}');

  const initialReg = queryParams.get('reg') || storedVoiceAutofill.vehicle_registration || '';
  const initialPolicy = queryParams.get('policy') || storedVoiceAutofill.policy_number || '';
  const initialInsurer = queryParams.get('insurer') || storedVoiceAutofill.previous_insurer || '';
  const initialMake = queryParams.get('make') || storedVoiceAutofill.vehicle_make || '';
  const initialModel = queryParams.get('model') || storedVoiceAutofill.vehicle_model || '';
  const initialIdv = queryParams.get('idv') || storedVoiceAutofill.idv || '';
  const initialNcb = queryParams.get('ncb') || storedVoiceAutofill.ncb_percent || '';
  const initialAge = queryParams.get('age') || storedVoiceAutofill.vehicle_age_years || '2';
  const isAutofilled = queryParams.get('autofill') === 'true' || Boolean(storedVoiceAutofill.policy_number || storedVoiceAutofill.vehicle_registration);

  const [formData, setFormData] = useState({
    customer_name: user?.full_name || 'Hariharan Murugesan',
    policy_number: initialPolicy || (isAutofilled ? 'POL-SYN-88219' : ''),
    previous_insurer: initialInsurer || (isAutofilled ? 'ICICI Lombard General Insurance' : ''),
    vehicle_registration: initialReg || (isAutofilled ? 'KA-01-MJ-4092' : ''),
    vehicle_make: initialMake || (isAutofilled ? 'Hyundai' : ''),
    vehicle_model: initialModel || (isAutofilled ? 'Creta SX' : ''),
    idv: initialIdv || (isAutofilled ? '650000' : ''),
    ncb_percent: initialNcb || (isAutofilled ? '20' : ''),
    vehicle_age_years: initialAge || '2',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extractionMsg, setExtractionMsg] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState(null);

  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [activeTab, setActiveTab] = useState('insurer_a');
  const [comparisonResults, setComparisonResults] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [iframeSrc, setIframeSrc] = useState(getInsurerPortalUrl('insurer_a', 9001));
  const [automationStep, setAutomationStep] = useState('');
  const [liveAutoPlaying, setLiveAutoPlaying] = useState(false);

  const [renewing, setRenewing] = useState(false);
  const [renewSuccess, setRenewSuccess] = useState(null);
  const [buyProduct, setBuyProduct] = useState(null);

  const resultsRef = useRef(null);

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

  const applyExtractedFields = (data, sourceLabel) => {
    let cleanNcb = '';
    const rawNcb = data.ncb !== undefined && data.ncb !== null ? data.ncb : data.ncb_percent;
    if (rawNcb !== undefined && rawNcb !== null && rawNcb !== '') {
      if (typeof rawNcb === 'string') {
        const parsed = parseFloat(rawNcb.replace('%', '').trim());
        cleanNcb = isNaN(parsed) ? '' : parsed;
      } else {
        cleanNcb = rawNcb;
      }
    }

    let make = data.vehicle_make || '';
    let model = data.vehicle_model || '';

    if (!make && model) {
      const parts = model.split(' ');
      if (parts.length > 1) {
        make = parts[0];
        model = parts.slice(1).join(' ');
      }
    }

    const cleanIdv = data.idv !== undefined && data.idv !== null && data.idv !== '' ? Number(data.idv) : '';

    setFormData({
      customer_name: data.customer_name || '',
      policy_number: data.policy_number || '',
      previous_insurer: data.insurer_name || '',
      vehicle_registration: data.vehicle_registration || '',
      vehicle_make: make || '',
      vehicle_model: model || '',
      idv: cleanIdv,
      ncb_percent: cleanNcb,
      vehicle_age_years: data.vehicle_age_years || '',
    });

    setExtractedData(data);
    setExtractionMsg(`✓ Successfully parsed "${sourceLabel}". Parameters auto-populated.`);
  };

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setExtracting(true);
    setExtractionMsg('');

    try {
      const dataPayload = new FormData();
      dataPayload.append('file', uploadedFile);

      let extracted = null;

      try {
        const res = await httpClient.post('/documents/analyze-pdf', dataPayload);
        if (res.data && res.data.customer_name) {
          extracted = res.data;
        }
      } catch (directErr) {
        const uploadRes = await httpClient.post('/documents/upload', dataPayload);
        if (uploadRes.data && uploadRes.data.document_id) {
          const analyzeRes = await httpClient.post(`/documents/${uploadRes.data.document_id}/analyze`);
          if (analyzeRes.data && analyzeRes.data.fields) {
            extracted = {
              ...analyzeRes.data.fields,
              ncb_percent: analyzeRes.data.fields.ncb,
              previous_premium: analyzeRes.data.fields.premium,
            };
          }
        }
      }

      if (extracted) {
        applyExtractedFields({
          customer_name: extracted.customer_name || '',
          policy_number: extracted.policy_number || '',
          insurer_name: extracted.insurer_name || '',
          vehicle_registration: extracted.vehicle_registration || '',
          vehicle_make: extracted.vehicle_make || '',
          vehicle_model: extracted.vehicle_model || '',
          idv: extracted.idv || '',
          ncb: extracted.ncb_percent || extracted.ncb || '',
          vehicle_age_years: extracted.vehicle_age_years || 2,
          previous_premium: extracted.previous_premium || extracted.premium || '',
        }, uploadedFile.name);
      } else {
        setExtractionMsg(`Notice: Could not auto-extract all fields from ${uploadedFile.name}. Please enter your renewal parameters below.`);
      }
    } catch (err) {
      console.error('Extraction error:', err);
      setExtractionMsg(`Error extracting ${uploadedFile.name}: ` + (err.response?.data?.detail || err.message));
    } finally {
      setExtracting(false);
    }
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
    setAutomationStep('• [1/4] Transferring renewal data to Gateway 1...');

    setTimeout(() => {
      setActiveTab('insurer_b');
      setIframeSrc(buildAutofillUrl('insurer_b', 9002));
      setAutomationStep('• [2/4] Autofilling renewal parameters on Gateway 2...');
    }, 2500);

    setTimeout(() => {
      setActiveTab('insurer_c');
      setIframeSrc(buildAutofillUrl('insurer_c', 9003));
      setAutomationStep('• [3/4] Requesting quotes and NCB transfer discounts on Gateway 3...');
    }, 5000);

    setTimeout(() => {
      setActiveTab('insurer_d');
      setIframeSrc(buildAutofillUrl('insurer_d', 9004));
      setAutomationStep('• [4/4] Extracting final calculated renewal premium on Gateway 4...');
    }, 7500);

    setTimeout(() => {
      setLiveAutoPlaying(false);
      setAutomationStep('');
      if (onComplete) onComplete();
    }, 10000);
  };

  const calculateExactRenewalQuotes = (params) => {
    const idv = parseFloat(params.idv) || 650000;
    const age = parseInt(params.vehicle_age_years) || 2;
    const ncb = parseFloat(params.ncb_percent) || 20;
    const curPrem = (extractedData && extractedData.previous_premium) ? Number(extractedData.previous_premium) : 20290;

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
    const d_cc = 1497 * 0.8;
    const d_age = age * 700;
    const d_ncb = d_base * (ncb / 100);
    const d_gst = (d_base + d_cc + d_age) * 0.18;
    const d_total = Math.round(d_base + d_cc + d_age - d_ncb + d_gst);

    const quotes = [
      {
        insurer_id: 1,
        insurer_name: 'ICICI Lombard General Insurance',
        product_name: 'Renewal Shield Comprehensive',
        idv: idv,
        premium: a_total,
        savings: curPrem > a_total ? curPrem - a_total : 0,
        score: 92.0,
        is_recommended: false,
      },
      {
        insurer_id: 2,
        insurer_name: 'ACKO General Insurance',
        product_name: 'ACKO Direct Renewal Plan',
        idv: idv,
        premium: b_total,
        savings: curPrem > b_total ? curPrem - b_total : 0,
        score: 95.0,
        is_recommended: false,
      },
      {
        insurer_id: 3,
        insurer_name: 'TATA AIG Assurance',
        product_name: 'Auto Secure Renewal Plan',
        idv: idv,
        premium: c_total,
        savings: curPrem > c_total ? curPrem - c_total : 0,
        score: 87.0,
        is_recommended: false,
      },
      {
        insurer_id: 4,
        insurer_name: 'HDFC ERGO General',
        product_name: 'Optima Secure Renewal',
        idv: idv,
        premium: d_total,
        savings: curPrem > d_total ? curPrem - d_total : 0,
        score: 91.0,
        is_recommended: false,
      },
    ];

    const sorted = [...quotes].sort((x, y) => x.premium - y.premium);
    sorted[0].is_recommended = true;
    sorted[0].badge = 'MAX SAVINGS';

    return {
      quotes,
      recommendation: {
        recommended_quote: sorted[0],
        rationale: `Ranked #1 with lowest renewal rate of ₹${sorted[0].premium.toLocaleString()} and maximum savings of ₹${(curPrem > sorted[0].premium ? curPrem - sorted[0].premium : 2400).toLocaleString()}.`,
        comparison_table: quotes,
      },
    };
  };

  const handleRenewalSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    const regVal = validateVehicleRegistration(formData.vehicle_registration);
    if (!regVal.isValid) {
      errs.vehicle_registration = regVal.error;
    }
    if (!formData.customer_name || formData.customer_name.trim().length < 3) {
      errs.customer_name = 'Policyholder name is required (minimum 3 characters)';
    }
    if (!formData.policy_number || formData.policy_number.trim().length < 3) {
      errs.policy_number = 'Existing policy number is required';
    }

    if (Object.keys(errs).length > 0) {
      setValidationErrors(errs);
      return;
    }

    setValidationErrors({});
    setLoadingQuotes(true);
    setComparisonResults(null);
    setRecommendation(null);

    // Compute exact renewal quotes
    const exact = calculateExactRenewalQuotes(formData);

    // Trigger sequential live quotation across all 4 gateways and ONLY show best suggestion upon completion
    runLiveIframeSequence(() => {
      setComparisonResults(exact.quotes);
      setRecommendation(exact.recommendation);
      setLoadingQuotes(false);
    });
  };

  const handleIssueRenewal = (quote) => {
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
      ncbPercent: formData.ncb_percent || '20',
      selectedAddons: ['Zero Depreciation', 'NCB Protector', 'Roadside Assistance'],
    });
  };

  return (
    <div className="page-container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <span className="badge badge-ai" style={{ marginBottom: 8 }}>OCR RENEWAL ENGINE</span>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.03em' }}>
          Smart Policy Renewal & Market Switch
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>
          Upload your existing policy schedule PDF to auto-extract parameters and find guaranteed lower competitor renewal premiums.
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
                Policy Ref: <strong>{formData.policy_number}</strong> ({formData.previous_insurer}) • Vehicle: <strong>{formData.vehicle_make} {formData.vehicle_model}</strong> ({formData.vehicle_registration}) • IDV: <strong>₹{Number(formData.idv || 650000).toLocaleString('en-IN')}</strong> • NCB: <strong>{formData.ncb_percent || 20}%</strong>
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
            ✓ Voice Policy Data
          </span>
        </div>
      )}

      <div className="grid-2" style={{ gap: 28, alignItems: 'start', marginBottom: 40 }}>
        {/* Left Column: Document Upload & Extracted Parameters */}
        <div>
          {/* Upload Dropzone Card */}
          <div className="saas-card" style={{ padding: 28, marginBottom: 24 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 14 }}>
              1. Upload Previous Policy Document (PDF / Image)
            </h2>

            <div
              style={{
                border: '2px dashed rgba(21, 101, 192, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '28px 20px',
                textAlign: 'center',
                background: 'var(--bg-tinted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <input
                type="file"
                id="policy-file-upload"
                onChange={handleFileUpload}
                accept=".pdf,.png,.jpg,.jpeg"
                style={{ display: 'none' }}
              />
              <label htmlFor="policy-file-upload" style={{ cursor: 'pointer' }}>
                <div style={{ width: 44, height: 44, margin: '0 auto 10px', borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(11,31,58,0.06)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--blue-primary)" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--primary-navy)' }}>
                  {file ? file.name : 'Click to Upload Existing Policy PDF / Image'}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }}>
                  Automated OCR extracts Policy #, Vehicle Reg, IDV, and NCB%
                </div>
              </label>
            </div>

            {extracting && (
              <div style={{ marginTop: 14, padding: 12, background: 'var(--bg-tinted)', borderRadius: 10, color: 'var(--blue-primary)', fontSize: 13, fontWeight: 600 }}>
                • Scanning & extracting policy fields via Vision OCR parser...
              </div>
            )}

            {extractionMsg && !extracting && (
              <div style={{ marginTop: 14, padding: 12, background: 'var(--status-emerald-bg)', border: '1px solid var(--status-emerald-border)', borderRadius: 10, color: 'var(--status-emerald)', fontSize: 13, fontWeight: 600 }}>
                {extractionMsg}
              </div>
            )}
          </div>

          {/* Form: Verified Renewal Parameters */}
          <div className="saas-card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 14 }}>
              2. Verified Renewal Parameters
            </h2>

            <form onSubmit={handleRenewalSubmit}>
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
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-body)', marginBottom: 4 }}>
                    Policy Number *
                  </label>
                  <input
                    type="text"
                    name="policy_number"
                    className="input-field"
                    value={formData.policy_number}
                    onChange={handleInputChange}
                    placeholder="e.g. POL-SYN-88219"
                    style={{
                      borderColor: validationErrors.policy_number ? '#E11D48' : undefined,
                      background: validationErrors.policy_number ? '#FFF1F2' : undefined,
                    }}
                    required
                  />
                  {validationErrors.policy_number && (
                    <div style={{ fontSize: 11, color: '#E11D48', marginTop: 3 }}>{validationErrors.policy_number}</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
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
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-body)', marginBottom: 4 }}>
                    Vehicle Make & Model
                  </label>
                  <input
                    type="text"
                    name="vehicle_model"
                    className="input-field"
                    value={`${formData.vehicle_make} ${formData.vehicle_model}`.trim()}
                    onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                    placeholder="e.g. Hyundai Creta SX"
                    required
                  />
                </div>
              </div>

              <div className="grid-3" style={{ gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-body)', marginBottom: 4 }}>Insured Value (IDV)</label>
                  <input
                    type="number"
                    name="idv"
                    className="input-field"
                    value={formData.idv}
                    onChange={handleInputChange}
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
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-pill-primary"
                style={{ width: '100%', padding: '14px 20px', fontSize: 14 }}
                disabled={loadingQuotes || liveAutoPlaying}
              >
                {loadingQuotes || liveAutoPlaying ? '• Comparing 4 Renewal Gateways...' : 'Compare Renewal Rates Across 4 Insurers →'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Mock Portal Stream */}
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

            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(11,31,58,0.1)', background: '#fff', height: 460 }}>
              <iframe
                src={iframeSrc}
                title="Renewal Portal Viewport"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Renewal Confirmation Success Banner */}
      {renewSuccess && (
        <div className="saas-card" style={{ marginBottom: 32, padding: 24, borderLeft: '4px solid var(--status-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-emerald)' }}>✓ RENEWAL SWITCH CONFIRMED</div>
              <h3 style={{ fontSize: 20, color: 'var(--primary-navy)', margin: '4px 0 6px' }}>Policy Successfully Renewed & Stored in Vault</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Renewal Reference: <strong>{renewSuccess.id || 'REN-SYN-88192'}</strong> • Annual Savings Secured: ₹{Number(renewSuccess.savings || 2470).toLocaleString()}
              </p>
            </div>
            <button onClick={() => window.location.href = '/insurance-vault'} className="btn-pill-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
              Open Policy Vault →
            </button>
          </div>
        </div>
      )}

      {/* Renewal AI Recommendation Highlight */}
      {recommendation && recommendation.recommended_quote && (
        <div
          ref={resultsRef}
          id="renewal-recommendation-section"
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
                  MAX RENEWAL SAVINGS
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
              <div style={{ fontSize: 12, color: 'var(--text-on-dark-muted)' }}>Renewal Premium</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#FFFFFF' }}>
                ₹{Number(recommendation.recommended_quote.premium).toLocaleString()}
              </div>
              <button
                onClick={() => handleIssueRenewal(recommendation.recommended_quote)}
                disabled={renewing}
                className="btn-pill-ai"
                style={{ marginTop: 14, padding: '12px 28px', fontSize: 14 }}
              >
                {renewing ? 'Switching Policy...' : 'Switch & Save ₹2,470 →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Rates Cards */}
      {comparisonResults && comparisonResults.length > 0 && (
        <div className="saas-card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 20 }}>
            Market Renewal Rate Comparison
          </h2>

          <div className="grid-2">
            {comparisonResults.map((q, idx) => (
              <div
                key={idx}
                style={{
                  background: q.is_recommended ? 'var(--bg-tinted)' : '#F8FAFD',
                  border: q.is_recommended ? '2px solid var(--blue-primary)' : '1px solid rgba(11,31,58,0.1)',
                  borderRadius: 16,
                  padding: 22,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <InsurerLogoBadge insurerName={q.insurer_name} size={42} rounded={10} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary-navy)' }}>{q.insurer_name}</span>
                      {q.badge && <span className="badge badge-ai" style={{ fontSize: 10 }}>{q.badge}</span>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{q.product_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--status-emerald)', fontWeight: 600, marginTop: 6 }}>
                      {q.savings > 0 ? `✓ Save ₹${q.savings.toLocaleString()} over current` : 'Standard Renewal Rate'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary-navy)' }}>
                    ₹{Number(q.premium).toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleIssueRenewal(q)}
                    disabled={renewing}
                    className={q.is_recommended ? 'btn-pill-primary' : 'btn-pill-secondary'}
                    style={{ marginTop: 8, padding: '8px 18px', fontSize: 12.5 }}
                  >
                    Switch Policy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Renewal Confirmation Modal */}
      {renewSuccess && (
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
              Renewal Policy Activated!
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
              Your policy renewal has been activated with full NCB transfer and added to your Digital Vault.
            </p>

            <div style={{ background: 'var(--bg-tinted)', borderRadius: 16, padding: '16px 20px', margin: '20px 0', textAlign: 'left', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Policy Number:</span>
                <strong style={{ color: 'var(--primary-navy)' }}>{renewSuccess.policy_number}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Product:</span>
                <strong style={{ color: 'var(--blue-primary)' }}>{renewSuccess.product_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Renewal Premium:</span>
                <strong style={{ color: 'var(--status-emerald)', fontSize: 15 }}>₹{Number(renewSuccess.premium).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Annual Savings:</span>
                <strong style={{ color: 'var(--status-emerald)' }}>₹{Number(renewSuccess.savings || 2470).toLocaleString()}</strong>
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
                onClick={() => setRenewSuccess(null)}
                className="btn-pill-secondary"
                style={{ padding: '12px 18px', fontSize: 14 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renewal Checkout Modal with Vault Balance & Gateway */}
      {buyProduct && (
        <BuyPolicyModal
          product={buyProduct}
          onClose={() => setBuyProduct(null)}
          onSuccess={(issued) => {
            setBuyProduct(null);
            setRenewSuccess(issued);
          }}
        />
      )}
    </div>
  );
}
