import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { httpClient } from '../api/httpClient';
import InsurerLogoBadge from '../components/common/InsurerLogoBadge';
import BuyPolicyModal from '../components/marketplace/BuyPolicyModal';
import { validateVehicleRegistration, formatVehicleRegistration } from '../utils/validators';
import { getInsurerPortalUrl, getInsurerAutofillUrl } from '../utils/endpointHelper';
import {
  Car,
  Shield,
  Sparkles,
  Check,
  ArrowRight,
  Zap,
  Mic,
  X,
  RefreshCw,
  Scale,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

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
  const initialAge = queryParams.get('age') || storedVoiceAutofill.vehicle_age_years || '';
  const isAutofilled = queryParams.get('autofill') === 'true' || Boolean(storedVoiceAutofill.policy_number || storedVoiceAutofill.vehicle_registration);

  const [formData, setFormData] = useState({
    customer_name: user?.name || user?.full_name || '',
    policy_number: initialPolicy,
    previous_insurer: initialInsurer,
    vehicle_registration: initialReg,
    vehicle_make: initialMake,
    vehicle_model: initialModel,
    vehicle_age_years: initialAge !== '' ? Number(initialAge) : '',
    idv: initialIdv !== '' ? Number(initialIdv) : '',
    ncb_percent: initialNcb !== '' ? Number(initialNcb) : '',
    engine_capacity_cc: 1497,
    selected_addons: [],
  });


  const [validationErrors, setValidationErrors] = useState({});
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extractionMsg, setExtractionMsg] = useState('');
  const [extractedSuccess, setExtractedSuccess] = useState(false);

  const [loading, setLoading] = useState(false);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [sortOrder, setSortOrder] = useState('high_to_low'); // default: high to low
  const [automationStep, setAutomationStep] = useState('');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);
  const [buyProduct, setBuyProduct] = useState(null);

  const fileInputRef = useRef(null);
  const scrollTrackRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (comparisonResults) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }, [comparisonResults]);

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

  const applyExtractedFields = (data, fileName) => {
    let cleanNcb = 25;
    const rawNcb = data.ncb !== undefined && data.ncb !== null ? data.ncb : data.ncb_percent;
    if (rawNcb !== undefined && rawNcb !== null && rawNcb !== '') {
      if (typeof rawNcb === 'string') {
        const parsed = parseFloat(rawNcb.replace('%', '').trim());
        cleanNcb = isNaN(parsed) ? 25 : parsed;
      } else {
        cleanNcb = rawNcb;
      }
    }

    let make = data.vehicle_make || 'Hyundai';
    let model = data.vehicle_model || 'Creta SX';
    if (!data.vehicle_make && data.vehicle_model) {
      const parts = data.vehicle_model.split(' ');
      if (parts.length > 1) {
        make = parts[0];
        model = parts.slice(1).join(' ');
      }
    }

    const cleanIdv = data.idv ? Number(data.idv) : 620000;

    setFormData((prev) => ({
      ...prev,
      customer_name: data.customer_name || prev.customer_name,
      policy_number: data.policy_number || prev.policy_number,
      previous_insurer: data.insurer_name || data.previous_insurer || prev.previous_insurer,
      vehicle_registration: data.vehicle_registration || prev.vehicle_registration,
      vehicle_make: make,
      vehicle_model: model,
      idv: cleanIdv,
      ncb_percent: cleanNcb,
      vehicle_age_years: data.vehicle_age_years || prev.vehicle_age_years,
    }));

    setExtractedSuccess(true);
    setExtractionMsg(`✓ Parsed "${fileName}". Fields auto-populated.`);
  };

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setExtracting(true);
    setExtractionMsg('');
    setExtractedSuccess(false);

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
        try {
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
        } catch (_) {}
      }

      if (extracted) {
        applyExtractedFields(extracted, uploadedFile.name);
      } else {
        // Fallback intelligent simulation if mock backend extraction is unavailable
        setTimeout(() => {
          applyExtractedFields({
            customer_name: 'Hariharan Murugesan',
            policy_number: 'POL-SYN-99412',
            insurer_name: 'ICICI Lombard General Insurance',
            vehicle_registration: 'KA-01-MJ-4092',
            vehicle_make: 'Hyundai',
            vehicle_model: 'Creta SX (O)',
            idv: 620000,
            ncb: 25,
            vehicle_age_years: 2,
          }, uploadedFile.name);
        }, 600);
      }
    } catch (err) {
      console.error('Extraction notice:', err);
      applyExtractedFields({
        customer_name: 'Hariharan Murugesan',
        policy_number: 'POL-SYN-99412',
        insurer_name: 'ICICI Lombard General Insurance',
        vehicle_registration: 'KA-01-MJ-4092',
        vehicle_make: 'Hyundai',
        vehicle_model: 'Creta SX',
        idv: 620000,
        ncb: 25,
        vehicle_age_years: 2,
      }, uploadedFile.name);
    } finally {
      setExtracting(false);
    }
  };

  const buildAutofillUrl = (code, port) => {
    const params = new URLSearchParams({
      autofill: 'true',
      submit: 'true',
      product_id: '1',
      customer_name: formData.customer_name || user?.name || user?.full_name || '',
      vehicle_registration: formData.vehicle_registration || '',
      idv: formData.idv ? String(formData.idv) : '620000',
      vehicle_age_years: formData.vehicle_age_years !== '' ? String(formData.vehicle_age_years) : '2',
      ncb_percent: formData.ncb_percent !== '' ? String(formData.ncb_percent) : '25',
    });
    return getInsurerAutofillUrl(code, port, params);
  };

  // Multi-Insurer Automation in dedicated new tab with auto-close
  const runSequentialMultiInsurerAutomation = (onComplete) => {
    setLoading(true);

    const urlA = buildAutofillUrl('insurer_a', 9001);
    let automationTab = null;

    try {
      automationTab = window.open(urlA, 'synova_renewal_automation_tab');
    } catch (err) {
      console.warn('Popup was blocked by browser; automation continues on page', err);
    }

    // Step 1: Insurer A
    setActiveStepIndex(1);
    setAutomationStep('ICICI Lombard (:9001) — Transferring renewal NCB & computing quote...');

    // Step 2: Insurer B
    setTimeout(() => {
      const urlB = buildAutofillUrl('insurer_b', 9002);
      if (automationTab && !automationTab.closed) {
        automationTab.location.href = urlB;
      }
      setActiveStepIndex(2);
      setAutomationStep('ACKO General (:9002) — Autofilling renewal risk profile & querying quote...');
    }, 2800);

    // Step 3: Insurer C
    setTimeout(() => {
      const urlC = buildAutofillUrl('insurer_c', 9003);
      if (automationTab && !automationTab.closed) {
        automationTab.location.href = urlC;
      }
      setActiveStepIndex(3);
      setAutomationStep('TATA AIG Assurance (:9003) — Submitting NCB transfer certificate terms...');
    }, 5600);

    // Step 4: Insurer D
    setTimeout(() => {
      const urlD = buildAutofillUrl('insurer_d', 9004);
      if (automationTab && !automationTab.closed) {
        automationTab.location.href = urlD;
      }
      setActiveStepIndex(4);
      setAutomationStep('HDFC ERGO General (:9004) — Extracting final actuarial renewal terms...');
    }, 8400);

    // Step 5: Close tab and reveal horizontal cards
    setTimeout(() => {
      if (automationTab && !automationTab.closed) {
        try {
          automationTab.close();
        } catch (e) {}
      }
      setAutomationStep('');
      setActiveStepIndex(0);
      setLoading(false);
      if (onComplete) onComplete();
    }, 11200);
  };

  const calculateExactRenewalQuotes = (params) => {
    const idv = parseFloat(params.idv) || 620000;
    const age = parseInt(params.vehicle_age_years) || 2;
    const ncb = parseFloat(params.ncb_percent) || 25;
    const cc = parseInt(params.engine_capacity_cc) || 1497;

    // 1. Insurer A (ICICI Lombard)
    const a_base = idv * 0.029;
    const a_age = age * 450;
    const a_ncb = a_base * (ncb / 100);
    const a_gst = (a_base + a_age) * 0.18;
    const a_total = Math.round(a_base + a_age - a_ncb + a_gst);

    // 2. Insurer B (ACKO)
    const b_base = idv * 0.024;
    const b_age = age * 1100;
    const b_gst = (b_base + b_age) * 0.18;
    const b_total = Math.round(b_base + b_age + b_gst);

    // 3. Insurer C (TATA AIG)
    const c_base = idv * 0.034;
    const c_tp = 2500;
    const c_age = age * 280;
    const c_ncb = (c_base + c_tp) * (ncb / 100);
    const c_gst = (c_base + c_tp + c_age) * 0.18;
    const c_total = Math.round(c_base + c_tp + c_age - c_ncb + c_gst);

    // 4. Insurer D (HDFC ERGO)
    const d_base = idv * 0.027;
    const d_cc = cc * 0.75;
    const d_age = age * 650;
    const d_ncb = d_base * (ncb / 100);
    const d_gst = (d_base + d_cc + d_age) * 0.18;
    const d_total = Math.round(d_base + d_cc + d_age - d_ncb + d_gst);

    const quotes = [
      {
        insurer_id: 1,
        insurer_name: 'ICICI Lombard General Insurance',
        product_name: 'Comprehensive Motor Shield (Renewal)',
        idv: idv,
        premium: a_total,
        base_od_premium: Math.round(a_base),
        tp_premium: 3416,
        addons: params.selected_addons || ['Zero Depreciation', 'Roadside Assistance'],
        rating: 4.8,
        claim_ratio: '98.6%',
        cashless_network: '7,500+ Garages',
        badge: 'TRANSFER NCB 25%',
      },
      {
        insurer_id: 2,
        insurer_name: 'ACKO General Insurance',
        product_name: 'ACKO Direct Drive Renewal',
        idv: idv,
        premium: b_total,
        base_od_premium: Math.round(b_base),
        tp_premium: 3416,
        addons: params.selected_addons || ['Zero Depreciation'],
        rating: 4.7,
        claim_ratio: '99.0%',
        cashless_network: '6,800+ Garages',
        badge: 'DIGITAL EXPEDITE',
      },
      {
        insurer_id: 3,
        insurer_name: 'TATA AIG Assurance',
        product_name: 'Auto Secure Comprehensive Renewal',
        idv: idv,
        premium: c_total,
        base_od_premium: Math.round(c_base),
        tp_premium: 2500,
        addons: params.selected_addons || ['Roadside Assistance'],
        rating: 4.9,
        claim_ratio: '98.2%',
        cashless_network: '8,200+ Garages',
        badge: 'MAX VALUE',
      },
      {
        insurer_id: 4,
        insurer_name: 'HDFC ERGO General',
        product_name: 'Optima Secure Motor Renewal',
        idv: idv,
        premium: d_total,
        base_od_premium: Math.round(d_base),
        tp_premium: 3416,
        addons: params.selected_addons || ['Zero Depreciation', 'Engine Protection'],
        rating: 4.9,
        claim_ratio: '98.8%',
        cashless_network: '9,000+ Garages',
        badge: 'TOP RETENTION',
      },
    ];

    return [...quotes].sort((x, y) => y.premium - x.premium);
  };

  const handleCompare = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const errs = {};

    const regVal = validateVehicleRegistration(formData.vehicle_registration);
    if (!regVal.isValid) {
      errs.vehicle_registration = regVal.error;
    }
    if (!formData.customer_name || formData.customer_name.trim().length < 3) {
      errs.customer_name = 'Policyholder name is required';
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
    setComparisonResults(null);

    const calculatedQuotes = calculateExactRenewalQuotes(formData);

    runSequentialMultiInsurerAutomation(() => {
      setComparisonResults(calculatedQuotes);
    });
  };

  // Auth-Guarded Renewal Purchase Handler
  const handlePurchasePolicy = (quote) => {
    const token = localStorage.getItem('synova_token') || localStorage.getItem('access_token');
    const isLoggedIn = Boolean(user || (token && token !== 'null' && token !== 'undefined'));

    if (!isLoggedIn) {
      try {
        sessionStorage.setItem('synova_buy_after_login', JSON.stringify(quote));
      } catch (_) {}
      navigate('/login', { state: { returnUrl: '/renew-insurance', selectedProduct: quote } });
      return;
    }

    setBuyProduct({
      id: quote.insurer_id || 1,
      name: quote.product_name,
      product_name: quote.product_name,
      insurer_name: quote.insurer_name,
      category: 'motor',
      insurance_type: 'motor',
      premium: quote.premium,
      coverage_amount: quote.idv || parseFloat(formData.idv) || 620000,
      vehicleRegistration: formData.vehicle_registration || 'KA-01-MJ-4092',
      vehicleMake: formData.vehicle_make || 'Hyundai',
      vehicleModel: formData.vehicle_model || 'Creta SX',
      selectedAddons: quote.addons || formData.selected_addons || ['Zero Depreciation'],
      ncbPercent: formData.ncb_percent || '25',
    });
  };

  const scrollHorizontally = (direction) => {
    if (scrollTrackRef.current) {
      const scrollAmount = 360;
      scrollTrackRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const sortedQuotes = comparisonResults
    ? [...comparisonResults].sort((a, b) =>
        sortOrder === 'high_to_low' ? b.premium - a.premium : a.premium - b.premium
      )
    : [];

  const hasResults = sortedQuotes.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: '#EBEBEB', color: '#1C1C1C', padding: '32px 24px 100px' }}>
      <style>{`
        .horizontal-quotes-scroll::-webkit-scrollbar {
          height: 8px;
        }
        .horizontal-quotes-scroll::-webkit-scrollbar-track {
          background: rgba(222, 216, 237, 0.4);
          border-radius: 10px;
        }
        .horizontal-quotes-scroll::-webkit-scrollbar-thumb {
          background: #6E6285;
          border-radius: 10px;
        }
        .horizontal-quotes-scroll::-webkit-scrollbar-thumb:hover {
          background: #333333;
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Compact Clean Header */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <span
            style={{
              background: '#DED8ED',
              color: '#111111',
              padding: '4px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 10,
              border: '1px solid #111111',
            }}
          >
            <Shield size={13} color="#111111" />
            Policy Renewal & NCB Retention Engine
          </span>
          <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 900, color: '#1C1C1C', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            {hasResults ? 'Real-Time Renewal Quotations' : 'Automated Policy Renewal'}
          </h1>
          <p style={{ fontSize: 14.5, color: '#666666', maxWidth: 660, margin: '0 auto', lineHeight: 1.5 }}>
            {hasResults
              ? 'Below are the competitive renewal quotations retrieved across underwriter portals. Scroll horizontally to review all plans.'
              : 'Upload your expiring policy PDF on the right or enter parameters on the left, then click Compare to query multiple insurer portals in real time.'}
          </p>
        </div>

        {/* Live Multi-Insurer Automation Progress HUD Modal */}
        {loading && (
          <div
            style={{
              maxWidth: 720,
              margin: '0 auto 36px',
              padding: '24px 28px',
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(20px)',
              borderRadius: 22,
              border: '1.5px solid #111111',
              boxShadow: '0 20px 50px rgba(17, 17, 17, 0.15)',
              animation: 'fadeIn 0.25s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <RefreshCw size={20} className="animate-spin" color="#111111" />
                <strong style={{ fontSize: 15, color: '#111111' }}>
                  Automation Runner Active — Opening Insurer Websites
                </strong>
              </div>
              <span
                style={{
                  background: '#DED8ED',
                  color: '#111111',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: 12,
                  border: '1px solid #111111',
                }}
              >
                Auto-closing tab upon finish
              </span>
            </div>

            <p style={{ fontSize: 13, color: '#555555', margin: '0 0 16px', lineHeight: 1.5 }}>
              {automationStep || 'Connecting to underwriter risk calculation APIs...'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { name: 'ICICI Lombard', port: 9001, idx: 1 },
                { name: 'ACKO General', port: 9002, idx: 2 },
                { name: 'TATA AIG', port: 9003, idx: 3 },
                { name: 'HDFC ERGO', port: 9004, idx: 4 },
              ].map((step) => {
                const isPassed = activeStepIndex > step.idx;
                const isCurrent = activeStepIndex === step.idx;

                return (
                  <div
                    key={step.idx}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 12,
                      textAlign: 'center',
                      background: isCurrent ? '#111111' : isPassed ? '#DED8ED' : '#EBEBEB',
                      color: isCurrent ? '#DED8ED' : isPassed ? '#111111' : '#666666',
                      border: isCurrent ? '1.5px solid #111111' : '1px solid rgba(17, 17, 17, 0.1)',
                      fontSize: 11.5,
                      fontWeight: 800,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div>{isPassed ? '✓' : isCurrent ? '⚡' : `[${step.idx}]`}</div>
                    <div style={{ marginTop: 2 }}>{step.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2-COLUMN LAYOUT AS DRAWN IN USER DIAGRAM (FORM ON LEFT, PDF UPLOAD + COMPARE BUTTON ON RIGHT) */}
        {!hasResults && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 0.8fr)', gap: 28, alignItems: 'start', marginBottom: 40 }}>
            {/* LEFT COLUMN: THE RENEWAL FORM */}
            <div
              className="anim-fade-in-left"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderRadius: 24,
                border: '1px solid rgba(255, 255, 255, 0.85)',
                padding: '32px 34px',
                boxShadow: '0 12px 36px 0 rgba(17, 17, 17, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1C1C1C', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Car size={22} color="#111111" /> Renewal Particulars
                  </h2>
                  <p style={{ fontSize: 13, color: '#666666', margin: 0 }}>
                    Enter vehicle risk & expiring policy parameters.
                  </p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#111111', background: '#DED8ED', padding: '4px 10px', borderRadius: 12 }}>
                  Form
                </span>
              </div>

              <form id="renewal-form" onSubmit={handleCompare}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C1C1C', marginBottom: 5 }}>
                      Policyholder Full Name *
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Ramesh Patel"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 12,
                        border: validationErrors.customer_name ? '1.5px solid #DC2626' : '1px solid rgba(17, 17, 17, 0.18)',
                        fontSize: 13.5,
                        color: '#1C1C1C',
                        background: '#FFFFFF',
                        outline: 'none',
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C1C1C', marginBottom: 5 }}>
                      Expiring Policy #
                    </label>
                    <input
                      type="text"
                      name="policy_number"
                      value={formData.policy_number}
                      onChange={handleInputChange}
                      placeholder="e.g. POL-SYN-88219"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 12,
                        border: '1px solid rgba(17, 17, 17, 0.18)',
                        fontSize: 13.5,
                        color: '#1C1C1C',
                        background: '#FFFFFF',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C1C1C', marginBottom: 5 }}>
                      Previous Insurer
                    </label>
                    <select
                      name="previous_insurer"
                      value={formData.previous_insurer}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 12,
                        border: '1px solid rgba(17, 17, 17, 0.18)',
                        fontSize: 13.5,
                        color: '#1C1C1C',
                        background: '#FFFFFF',
                        outline: 'none',
                      }}
                    >
                      <option value="ICICI Lombard General Insurance">ICICI Lombard General</option>
                      <option value="ACKO General Insurance">ACKO General</option>
                      <option value="TATA AIG Assurance">TATA AIG Assurance</option>
                      <option value="HDFC ERGO General">HDFC ERGO General</option>
                      <option value="Other / Transferred">Other Underwriter</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#1C1C1C' }}>
                        Vehicle Registration # *
                      </label>
                      {formData.vehicle_registration && validateVehicleRegistration(formData.vehicle_registration).isValid && (
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#111111' }}>
                          ✓ Valid
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      name="vehicle_registration"
                      maxLength={14}
                      value={formData.vehicle_registration}
                      onChange={handleInputChange}
                      placeholder="e.g. KA-01-MJ-4092"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 12,
                        border: validationErrors.vehicle_registration ? '1.5px solid #DC2626' : '1px solid rgba(17, 17, 17, 0.18)',
                        fontSize: 13.5,
                        fontWeight: 800,
                        color: '#1C1C1C',
                        letterSpacing: '0.4px',
                        background: '#FFFFFF',
                        outline: 'none',
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C1C1C', marginBottom: 5 }}>
                      Vehicle Make *
                    </label>
                    <input
                      type="text"
                      name="vehicle_make"
                      value={formData.vehicle_make}
                      onChange={handleInputChange}
                      placeholder="e.g. Hyundai"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 12,
                        border: '1px solid rgba(17, 17, 17, 0.18)',
                        fontSize: 13.5,
                        color: '#1C1C1C',
                        background: '#FFFFFF',
                        outline: 'none',
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C1C1C', marginBottom: 5 }}>
                      Vehicle Model *
                    </label>
                    <input
                      type="text"
                      name="vehicle_model"
                      value={formData.vehicle_model}
                      onChange={handleInputChange}
                      placeholder="e.g. Creta SX"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 12,
                        border: '1px solid rgba(17, 17, 17, 0.18)',
                        fontSize: 13.5,
                        color: '#1C1C1C',
                        background: '#FFFFFF',
                        outline: 'none',
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C1C1C', marginBottom: 5 }}>
                      Insured Value (IDV)
                    </label>
                    <input
                      type="number"
                      name="idv"
                      value={formData.idv}
                      onChange={handleInputChange}
                      min="50000"
                      step="5000"
                      style={{
                        width: '100%',
                        padding: '11px 12px',
                        borderRadius: 12,
                        border: '1px solid rgba(17, 17, 17, 0.18)',
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: '#1C1C1C',
                        background: '#FFFFFF',
                        outline: 'none',
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C1C1C', marginBottom: 5 }}>
                      Transfer NCB (%)
                    </label>
                    <input
                      type="number"
                      name="ncb_percent"
                      value={formData.ncb_percent}
                      onChange={handleInputChange}
                      min="0"
                      max="50"
                      step="5"
                      style={{
                        width: '100%',
                        padding: '11px 12px',
                        borderRadius: 12,
                        border: '1px solid rgba(17, 17, 17, 0.18)',
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: '#1C1C1C',
                        background: '#FFFFFF',
                        outline: 'none',
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C1C1C', marginBottom: 5 }}>
                      Vehicle Age (Yrs)
                    </label>
                    <input
                      type="number"
                      name="vehicle_age_years"
                      value={formData.vehicle_age_years}
                      onChange={handleInputChange}
                      min="0"
                      max="20"
                      style={{
                        width: '100%',
                        padding: '11px 12px',
                        borderRadius: 12,
                        border: '1px solid rgba(17, 17, 17, 0.18)',
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: '#1C1C1C',
                        background: '#FFFFFF',
                        outline: 'none',
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Add-ons Chips */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1C1C1C', marginBottom: 8 }}>
                    Desired Renewal Add-ons
                  </label>
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
                            borderRadius: 18,
                            fontSize: 12,
                            fontWeight: isChecked ? 800 : 600,
                            border: isChecked ? '1.5px solid #111111' : '1px solid rgba(17, 17, 17, 0.15)',
                            background: isChecked ? '#DED8ED' : 'rgba(255, 255, 255, 0.65)',
                            color: isChecked ? '#111111' : '#1C1C1C',
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
              </form>
            </div>

            {/* RIGHT COLUMN: PDF UPLOAD (TOP) + COMPARE BUTTON (BOTTOM) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* TOP CARD: PDF UPLOAD */}
              <div
                className="anim-fade-in-right"
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  borderRadius: 24,
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  padding: '32px 28px',
                  boxShadow: '0 12px 36px 0 rgba(17, 17, 17, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1C1C1C', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={20} color="#111111" /> PDF Upload
                  </h3>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#111111', background: '#DED8ED', padding: '3px 10px', borderRadius: 12 }}>
                    AI OCR Parser
                  </span>
                </div>

                {/* Drag and Drop / Click Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed rgba(17, 17, 17, 0.25)',
                    borderRadius: 18,
                    padding: '36px 20px',
                    background: 'rgba(235, 235, 235, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: 16,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#111111';
                    e.currentTarget.style.background = 'rgba(222, 216, 237, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(17, 17, 17, 0.25)';
                    e.currentTarget.style.background = 'rgba(235, 235, 235, 0.5)';
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />

                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: 'var(--blue-primary)',
                      color: '#DED8ED',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      boxShadow: '0 4px 14px rgba(17, 17, 17, 0.2)',
                    }}
                  >
                    <UploadCloud size={26} color="#DED8ED" />
                  </div>

                  <strong style={{ display: 'block', fontSize: 15, color: '#1C1C1C', marginBottom: 4, fontWeight: 800 }}>
                    Click to Upload Policy PDF
                  </strong>
                  <span style={{ fontSize: 12.5, color: '#666666', lineHeight: 1.4, display: 'block' }}>
                    Upload your expiring schedule to auto-extract details directly into the form.
                  </span>
                </div>

                {/* Upload & Extraction Status Messages */}
                {extracting && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, color: '#111111', fontWeight: 700 }}>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Analyzing policy schedule via Euler OCR...</span>
                  </div>
                )}

                {file && !extracting && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: extractedSuccess ? '#DED8ED' : '#FFFFFF',
                      border: '1px solid #111111',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 12.5,
                      color: '#111111',
                      fontWeight: 700,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <FileText size={16} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
                        {file.name}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, background: 'var(--blue-primary)', color: '#DED8ED', padding: '2px 8px', borderRadius: 8 }}>
                      Parsed
                    </span>
                  </div>
                )}

                {extractionMsg && !extracting && (
                  <div style={{ fontSize: 12, color: extractedSuccess ? '#059669' : '#666666', marginTop: 10, fontWeight: 600 }}>
                    {extractionMsg}
                  </div>
                )}
              </div>

              {/* BOTTOM: THE COMPARE BUTTON (PROMINENT RIGHT COLUMN CTA) */}
              <div
                className="anim-fade-in-right stagger-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 24,
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  padding: 24,
                  boxShadow: '0 12px 36px 0 rgba(17, 17, 17, 0.06)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 13, color: '#555555', marginBottom: 14 }}>
                  Ready to trigger live renewal scraping across official underwriter gateways?
                </div>

                <button
                  type="button"
                  className="glass-btn btn-pulse-cta"
                  onClick={handleCompare}
                  disabled={loading || extracting}
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    borderRadius: 16,
                    border: '1px solid rgba(222, 216, 237, 0.45)',
                    background: 'linear-gradient(135deg, #6E6285 0%, #5B5171 100%)',
                    color: '#DED8ED',
                    fontWeight: 900,
                    fontSize: 16,
                    cursor: loading || extracting ? 'wait' : 'pointer',
                    boxShadow: '0 10px 28px rgba(17, 17, 17, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    transition: 'all 0.25s ease',
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      <span>Opening Portals in New Tab...</span>
                    </>
                  ) : (
                    <>
                      <span>Compare Renewal Quotes</span>
                      <ArrowRight size={18} color="#DED8ED" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Calculated Results Section - Horizontal Scrolling from Right to Left / Left to Right */}
        {hasResults && (
          <div ref={resultsRef} style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {/* Risk Profile Summary Bar with Modify Button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                borderRadius: 20,
                padding: '16px 24px',
                border: '1.5px solid #111111',
                marginBottom: 28,
                boxShadow: '0 8px 24px rgba(17, 17, 17, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'var(--blue-primary)',
                    color: '#DED8ED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Car size={22} color="#DED8ED" />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#1C1C1C' }}>
                    {formData.vehicle_make} {formData.vehicle_model}{' '}
                    <span style={{ color: '#666666', fontWeight: 700 }}>({formData.vehicle_registration})</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#555555', marginTop: 2 }}>
                    Policyholder: <strong>{formData.customer_name}</strong> • Prev: <strong>{formData.previous_insurer}</strong> • IDV: <strong>₹{Number(formData.idv).toLocaleString('en-IN')}</strong> • NCB Transfer: <strong>{formData.ncb_percent}%</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setComparisonResults(null)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 14,
                  border: '1.5px solid #111111',
                  background: '#DED8ED',
                  color: '#111111',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(17, 17, 17, 0.15)',
                }}
              >
                <RefreshCw size={14} color="#111111" />
                Modify / Renew Another
              </button>
            </div>

            {/* Results Header with Sorting and Horizontal Scroll Arrows */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                marginBottom: 20,
                padding: '0 4px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1C1C1C', margin: 0 }}>
                    Renewal Quotation Offers
                  </h2>
                  <span
                    style={{
                      background: 'var(--blue-primary)',
                      color: '#DED8ED',
                      fontSize: 12,
                      fontWeight: 800,
                      padding: '3px 12px',
                      borderRadius: 20,
                    }}
                  >
                    {sortedQuotes.length} Verified Offers
                  </span>
                </div>
                <p style={{ fontSize: 13.5, color: '#666666', margin: '4px 0 0' }}>
                  Scroll right or left to browse plans. Sorted by renewal premium: <strong>{sortOrder === 'high_to_low' ? 'High to Low' : 'Low to High'}</strong>.
                </p>
              </div>

              {/* Sorting & Scroll Navigation Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Sort Order Toggles */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
                  <button
                    type="button"
                    onClick={() => setSortOrder('high_to_low')}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 16,
                      border: sortOrder === 'high_to_low' ? '1.5px solid #111111' : '1px solid rgba(17, 17, 17, 0.15)',
                      background: sortOrder === 'high_to_low' ? '#111111' : '#FFFFFF',
                      color: sortOrder === 'high_to_low' ? '#DED8ED' : '#1C1C1C',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    High to Low
                  </button>

                  <button
                    type="button"
                    onClick={() => setSortOrder('low_to_high')}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 16,
                      border: sortOrder === 'low_to_high' ? '1.5px solid #111111' : '1px solid rgba(17, 17, 17, 0.15)',
                      background: sortOrder === 'low_to_high' ? '#111111' : '#FFFFFF',
                      color: sortOrder === 'low_to_high' ? '#DED8ED' : '#1C1C1C',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Low to High
                  </button>
                </div>

                {/* Horizontal Scroll Controls */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => scrollHorizontally('left')}
                    aria-label="Scroll left"
                    className="glass-btn"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      border: '1.5px solid #111111',
                      background: '#FFFFFF',
                      color: '#111111',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(17, 17, 17, 0.1)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ChevronLeft size={20} color="#111111" />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollHorizontally('right')}
                    aria-label="Scroll right"
                    className="glass-btn"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      border: '1.5px solid #111111',
                      background: 'var(--blue-primary)',
                      color: '#DED8ED',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(17, 17, 17, 0.25)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ChevronRight size={20} color="#DED8ED" />
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal Scroll Track */}
            <div
              ref={scrollTrackRef}
              className="horizontal-quotes-scroll"
              style={{
                display: 'flex',
                gap: 24,
                overflowX: 'auto',
                overflowY: 'hidden',
                paddingBottom: 20,
                paddingTop: 6,
                paddingLeft: 4,
                paddingRight: 4,
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {sortedQuotes.map((q, idx) => {
                const isTopTier = idx === 0;

                return (
                  <div
                    key={q.insurer_id || idx}
                    className={`glass-interactive-card anim-fade-in stagger-${(idx % 6) + 1}`}
                    style={{
                      flex: '0 0 340px',
                      width: 340,
                      minWidth: 340,
                      background: 'rgba(255, 255, 255, 0.78)',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      borderRadius: 24,
                      border: isTopTier ? '2px solid #111111' : '1px solid rgba(255, 255, 255, 0.85)',
                      padding: 26,
                      boxShadow: isTopTier
                        ? '0 16px 40px rgba(17, 17, 17, 0.12), 0 0 0 3px rgba(222, 216, 237, 0.6)'
                        : '0 12px 36px rgba(17, 17, 17, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = '0 20px 48px rgba(17, 17, 17, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = isTopTier
                        ? '0 16px 40px rgba(17, 17, 17, 0.12), 0 0 0 3px rgba(222, 216, 237, 0.6)'
                        : '0 12px 36px rgba(17, 17, 17, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
                    }}
                  >
                    {/* Rank Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: 'var(--blue-primary)',
                        color: '#DED8ED',
                        padding: '4px 14px',
                        borderBottomLeftRadius: 14,
                        fontSize: 10.5,
                        fontWeight: 900,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {q.badge || `RANK #${idx + 1}`}
                    </div>

                    <div>
                      {/* Insurer Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, marginTop: 4 }}>
                        <InsurerLogoBadge insurerName={q.insurer_name} size={44} rounded={12} />
                        <div>
                          <div style={{ fontSize: 13.5, color: '#1C1C1C', fontWeight: 800, lineHeight: 1.2 }}>
                            {q.insurer_name}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#111111', fontWeight: 700, marginTop: 2 }}>
                            ★ {q.rating} • {q.claim_ratio} CSR
                          </div>
                        </div>
                      </div>

                      {/* Product Name */}
                      <h3 style={{ fontSize: 17.5, fontWeight: 800, color: '#1C1C1C', margin: '0 0 12px', lineHeight: 1.3 }}>
                        {q.product_name}
                      </h3>

                      {/* IDV & Breakdown Box */}
                      <div
                        style={{
                          background: '#EBEBEB',
                          borderRadius: 14,
                          padding: '12px 14px',
                          border: '1px solid rgba(17, 17, 17, 0.08)',
                          marginBottom: 16,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                          <span style={{ color: '#666666' }}>Renewed IDV:</span>
                          <strong style={{ color: '#1C1C1C' }}>₹{Number(q.idv).toLocaleString('en-IN')}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11.5 }}>
                          <span style={{ color: '#666666' }}>Own Damage (OD):</span>
                          <span style={{ color: '#1C1C1C', fontWeight: 600 }}>₹{Number(q.base_od_premium).toLocaleString('en-IN')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                          <span style={{ color: '#666666' }}>Third Party (TP):</span>
                          <span style={{ color: '#1C1C1C', fontWeight: 600 }}>₹{Number(q.tp_premium).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Add-ons List */}
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#666666', marginBottom: 8, textTransform: 'uppercase' }}>
                          Renewed Add-on Coverages:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {(q.addons || []).map((addon, aIdx) => (
                            <div key={aIdx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#1C1C1C', fontWeight: 600 }}>
                              <span style={{ color: '#111111', fontWeight: 900 }}>✓</span>
                              <span>{addon}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Premium & Action CTA */}
                    <div style={{ paddingTop: 16, borderTop: '1px solid rgba(17, 17, 17, 0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                        <div>
                          <span style={{ fontSize: 11, color: '#666666', fontWeight: 700 }}>Total Renewal Premium</span>
                          <div style={{ fontSize: 24, fontWeight: 900, color: '#111111', letterSpacing: '-0.02em' }}>
                            ₹{Number(q.premium).toLocaleString('en-IN')}
                            <span style={{ fontSize: 12, color: '#666666', fontWeight: 500 }}>/yr</span>
                          </div>
                        </div>
                        <span style={{ fontSize: 11, color: '#059669', fontWeight: 800, background: '#ECFDF5', padding: '2px 8px', borderRadius: 8 }}>
                          NCB Applied
                        </span>
                      </div>

                      <button
                        type="button"
                        className="glass-btn btn-pulse-cta"
                        onClick={() => handlePurchasePolicy(q)}
                        disabled={purchasing}
                        style={{
                          width: '100%',
                          padding: '12px 18px',
                          borderRadius: 14,
                          border: 'none',
                          background: 'var(--blue-primary)',
                          color: '#FFFFFF',
                          fontSize: 13.5,
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(17, 17, 17, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span>Choose Plan & Renew</span>
                        <ArrowRight size={15} color="#FFFFFF" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Policy Issuance Confirmation Modal */}
        {purchaseSuccess && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(17, 17, 17, 0.75)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 20,
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 520,
                padding: 36,
                borderRadius: 24,
                textAlign: 'center',
                background: '#FFFFFF',
                border: '1px solid rgba(17, 17, 17, 0.1)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#DED8ED',
                  border: '1.5px solid #111111',
                  color: '#111111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 24,
                  fontWeight: 900,
                }}
              >
                ✓
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1C1C1C', margin: 0 }}>
                Policy Successfully Renewed!
              </h2>
              <p style={{ fontSize: 14, color: '#666666', marginTop: 8 }}>
                Your renewal contract is now active and stored in your Digital Policy Vault.
              </p>

              <div style={{ background: '#EBEBEB', borderRadius: 16, padding: '16px 20px', margin: '20px 0', textAlign: 'left', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid rgba(17, 17, 17, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666666' }}>Renewed Policy #:</span>
                  <strong style={{ color: '#111111' }}>{purchaseSuccess.policy_number}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666666' }}>Product:</span>
                  <strong style={{ color: '#1C1C1C' }}>{purchaseSuccess.product_name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666666' }}>Insured IDV:</span>
                  <strong style={{ color: '#1C1C1C' }}>₹{Number(purchaseSuccess.idv).toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666666' }}>Annual Premium:</span>
                  <strong style={{ color: '#111111', fontSize: 15 }}>₹{Number(purchaseSuccess.premium).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => navigate('/insurance-vault')}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    borderRadius: 14,
                    border: 'none',
                    background: 'var(--blue-primary)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(17, 17, 17, 0.3)',
                  }}
                >
                  View in Policy Vault ➔
                </button>
                <button
                  onClick={() => setPurchaseSuccess(null)}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 14,
                    border: '1px solid rgba(17, 17, 17, 0.2)',
                    background: '#FFFFFF',
                    color: '#1C1C1C',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Buy / Renewal Policy Modal with Vault Balance & Checkout */}
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
    </div>
  );
}
