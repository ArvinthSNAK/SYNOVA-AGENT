import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react';

export default function NewInsurancePage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const storedVoiceAutofill = JSON.parse(sessionStorage.getItem('synova_voice_autofill') || '{}');

  const initialReg = queryParams.get('reg') || storedVoiceAutofill.vehicle_registration || '';
  const initialMake = queryParams.get('make') || storedVoiceAutofill.vehicle_make || '';
  const initialModel = queryParams.get('model') || storedVoiceAutofill.vehicle_model || '';
  const initialAge = queryParams.get('age') || storedVoiceAutofill.vehicle_age_years || '';
  const initialIdv = queryParams.get('idv') || storedVoiceAutofill.idv || '';
  const initialNcb = queryParams.get('ncb') || storedVoiceAutofill.ncb_percent || '';
  const isAutofilled = queryParams.get('autofill') === 'true' || Boolean(storedVoiceAutofill.vehicle_registration);

  const [formData, setFormData] = useState({
    customer_name: user?.name || user?.full_name || '',
    vehicle_registration: initialReg,
    vehicle_make: initialMake,
    vehicle_model: initialModel,
    vehicle_age_years: initialAge !== '' ? Number(initialAge) : '',
    idv: initialIdv !== '' ? Number(initialIdv) : '',
    ncb_percent: initialNcb !== '' ? Number(initialNcb) : '',
    engine_capacity_cc: 1497,
    has_anti_theft: 0,
    selected_addons: [],
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [sortOrder, setSortOrder] = useState('high_to_low'); // default: high to low
  const [automationStep, setAutomationStep] = useState('');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);
  const [buyProduct, setBuyProduct] = useState(null);

  // Euler AI Voice Advisor Popup on Page Load (Auto-disappears after 5s)
  const [showEulerVoicePrompt, setShowEulerVoicePrompt] = useState(true);

  const scrollTrackRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEulerVoicePrompt(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (comparisonResults) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }, [comparisonResults]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
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
      product_id: '1',
      customer_name: formData.customer_name || user?.name || user?.full_name || '',
      vehicle_registration: formData.vehicle_registration || '',
      idv: formData.idv ? String(formData.idv) : '650000',
      vehicle_age_years: formData.vehicle_age_years !== '' ? String(formData.vehicle_age_years) : '2',
      ncb_percent: formData.ncb_percent !== '' ? String(formData.ncb_percent) : '20',
    });
    return getInsurerAutofillUrl(code, port, params);
  };

  // Autonomous Sequence: Opens Mock Insurer websites sequentially in a new tab,
  // autofills risk parameters, calculates quotes, closes tab, and presents horizontal cards
  const runSequentialMultiInsurerAutomation = (onComplete) => {
    setLoading(true);

    const urlA = buildAutofillUrl('insurer_a', 9001);
    let automationTab = null;

    try {
      automationTab = window.open(urlA, 'synova_automation_tab');
    } catch (err) {
      console.warn('Popup blocked; running simulation', err);
    }

    // Step 1: Insurer A (ICICI Lombard)
    setActiveStepIndex(1);
    setAutomationStep('Opening ICICI Lombard Gateway (:9001)... Autofilling vehicle & calculating quote');

    // Step 2: Insurer B (ACKO)
    setTimeout(() => {
      const urlB = buildAutofillUrl('insurer_b', 9002);
      if (automationTab && !automationTab.closed) {
        automationTab.location.href = urlB;
      }
      setActiveStepIndex(2);
      setAutomationStep('Opening ACKO General Gateway (:9002)... Autofilling risk factors & querying quote');
    }, 2800);

    // Step 3: Insurer C (TATA AIG)
    setTimeout(() => {
      const urlC = buildAutofillUrl('insurer_c', 9003);
      if (automationTab && !automationTab.closed) {
        automationTab.location.href = urlC;
      }
      setActiveStepIndex(3);
      setAutomationStep('Opening TATA AIG Gateway (:9003)... Submitting coverage & deductible terms');
    }, 5600);

    // Step 4: Insurer D (HDFC ERGO)
    setTimeout(() => {
      const urlD = buildAutofillUrl('insurer_d', 9004);
      if (automationTab && !automationTab.closed) {
        automationTab.location.href = urlD;
      }
      setActiveStepIndex(4);
      setAutomationStep('Opening HDFC ERGO Gateway (:9004)... Extracting final actuarial quotation');
    }, 8400);

    // Step 5: Close automation tab and reveal cards
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
        rating: 4.8,
        claim_ratio: '98.6%',
        cashless_network: '7,500+ Garages',
        badge: 'POPULAR CHOICE',
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
        rating: 4.7,
        claim_ratio: '99.0%',
        cashless_network: '6,800+ Garages',
        badge: 'DIGITAL FIRST',
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
        rating: 4.9,
        claim_ratio: '98.2%',
        cashless_network: '8,200+ Garages',
        badge: 'TOP RATED',
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
        rating: 4.9,
        claim_ratio: '98.8%',
        cashless_network: '9,000+ Garages',
        badge: 'MAXIMUM COVERAGE',
      },
    ];

    return [...quotes].sort((x, y) => y.premium - x.premium);
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
    setComparisonResults(null);

    const calculatedQuotes = calculateExactInsurersQuotes(formData);

    runSequentialMultiInsurerAutomation(() => {
      setComparisonResults(calculatedQuotes);
    });
  };

  // Auth-Guarded Policy Purchase Handler
  const handlePurchasePolicy = (quote) => {
    const token = localStorage.getItem('synova_token') || localStorage.getItem('access_token');
    const isLoggedIn = Boolean(user || (token && token !== 'null' && token !== 'undefined'));

    if (!isLoggedIn) {
      try {
        sessionStorage.setItem('synova_buy_after_login', JSON.stringify(quote));
      } catch (_) {}
      navigate('/login', { state: { returnUrl: '/compare', selectedProduct: quote } });
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
      coverage_amount: quote.idv || parseFloat(formData.idv) || 650000,
      vehicleRegistration: formData.vehicle_registration || 'KA-01-MJ-4092',
      vehicleMake: formData.vehicle_make || 'Hyundai',
      vehicleModel: formData.vehicle_model || 'Creta SX',
      selectedAddons: quote.addons || formData.selected_addons || ['Zero Depreciation'],
      ncbPercent: formData.ncb_percent || '20',
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

  // Sorted items based on current sortOrder
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
          background: #111111;
          border-radius: 10px;
        }
        .horizontal-quotes-scroll::-webkit-scrollbar-thumb:hover {
          background: #333333;
        }
      `}</style>

      {/* Euler Voice Advisor Floating Popup (Auto-dismisses in 5s) */}
      {showEulerVoicePrompt && (
        <div
          style={{
            position: 'fixed',
            top: 88,
            right: 24,
            zIndex: 9998,
            maxWidth: 390,
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: 22,
            border: '1.5px solid rgba(222, 216, 237, 0.95)',
            boxShadow: '0 20px 45px rgba(17, 17, 17, 0.18), inset 0 1px 0 #FFFFFF',
            padding: '20px 22px',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#111111',
                  color: '#DED8ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(17, 17, 17, 0.25)',
                }}
              >
                <Sparkles size={18} color="#DED8ED" />
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#111111', background: '#DED8ED', padding: '2px 8px', borderRadius: 8 }}>
                  Euler AI
                </span>
                <h4 style={{ margin: '3px 0 0', fontSize: 15, fontWeight: 800, color: '#1C1C1C' }}>
                  Hate Filling Forms?
                </h4>
              </div>
            </div>
            <button
              onClick={() => setShowEulerVoicePrompt(false)}
              style={{
                background: '#EBEBEB',
                border: 'none',
                borderRadius: '50%',
                width: 26,
                height: 26,
                cursor: 'pointer',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666666',
              }}
            >
              ✕
            </button>
          </div>

          <p style={{ fontSize: 13, color: '#555555', margin: '0 0 16px', lineHeight: 1.5 }}>
            You can get insurance quotes from leading underwriters in <strong>under 60 seconds without form filling</strong> by speaking with Euler Voice Advisor.
          </p>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => navigate('/voice-advisor')}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 12,
                border: 'none',
                background: '#111111',
                color: '#DED8ED',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(17, 17, 17, 0.3)',
              }}
            >
              <Mic size={15} color="#DED8ED" />
              Talk to Voice Advisor
            </button>
            <button
              onClick={() => setShowEulerVoicePrompt(false)}
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid rgba(17, 17, 17, 0.15)',
                background: '#FFFFFF',
                color: '#1C1C1C',
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer',
              }}
            >
              Manual
            </button>
          </div>
        </div>
      )}

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
            <Scale size={13} color="#111111" />
            Autonomous Multi-Insurer Quotation
          </span>
          <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 900, color: '#1C1C1C', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            {hasResults ? 'Real-Time Insurer Quotations' : 'Compare Top Insurers in Real Time'}
          </h1>
          <p style={{ fontSize: 14.5, color: '#666666', maxWidth: 640, margin: '0 auto', lineHeight: 1.5 }}>
            {hasResults
              ? 'Below are the exact quotation results scraped directly from mock insurer underwriting engines. Scroll horizontally to review all plans.'
              : 'Enter your vehicle risk factors below. Clicking Compare will automatically cycle through each mock insurer website in a new tab and extract live quotes.'}
          </p>
        </div>

        {/* Voice Advisor Autofill Banner if triggered from voice and form is visible */}
        {!hasResults && isAutofilled && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1.5px solid #111111',
              borderRadius: 18,
              padding: '16px 22px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 8px 24px rgba(17, 17, 17, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 24 }}>🎙️</span>
              <div>
                <strong style={{ color: '#111111', fontSize: 14, display: 'block' }}>
                  Form Autofilled by Euler Voice Advisor
                </strong>
                <span style={{ color: '#555555', fontSize: 12.5 }}>
                  Extracted: <strong>{formData.vehicle_make} {formData.vehicle_model}</strong> ({formData.vehicle_registration}) • IDV: <strong>₹{Number(formData.idv).toLocaleString('en-IN')}</strong> • NCB: <strong>{formData.ncb_percent}%</strong>
                </span>
              </div>
            </div>
            <span
              style={{
                background: '#DED8ED',
                color: '#111111',
                fontSize: 11.5,
                fontWeight: 800,
                padding: '5px 14px',
                borderRadius: 20,
                border: '1px solid #111111',
              }}
            >
              ✓ Live Voice Data
            </span>
          </div>
        )}

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

        {/* Central Vehicle & Risk Configuration Form (ONLY SHOWN BEFORE COMPARISON) */}
        {!hasResults && (
          <div
            className="anim-fade-in"
            style={{
              maxWidth: 860,
              margin: '0 auto 40px',
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              borderRadius: 26,
              border: '1px solid rgba(255, 255, 255, 0.85)',
              padding: '36px 40px',
              boxShadow: '0 12px 36px 0 rgba(17, 17, 17, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1C1C1C', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Car size={24} color="#111111" /> Vehicle & Risk Configuration
                </h2>
                <p style={{ fontSize: 13.5, color: '#666666', margin: 0 }}>
                  Fill your parameters to trigger multi-portal automation across ICICI Lombard, ACKO, TATA AIG, and HDFC ERGO.
                </p>
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#111111', background: '#DED8ED', padding: '4px 12px', borderRadius: 20 }}>
                Insurer Portals
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#1C1C1C', marginBottom: 6 }}>
                    Policyholder Name *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Ramesh Patel"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 14,
                      border: validationErrors.customer_name ? '1.5px solid #DC2626' : '1px solid rgba(17, 17, 17, 0.18)',
                      fontSize: 14,
                      color: '#1C1C1C',
                      background: validationErrors.customer_name ? '#FFF1F2' : '#FFFFFF',
                      outline: 'none',
                    }}
                    required
                  />
                  {validationErrors.customer_name && (
                    <div style={{ fontSize: 11.5, color: '#DC2626', marginTop: 3 }}>{validationErrors.customer_name}</div>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: '#1C1C1C' }}>
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
                      padding: '12px 16px',
                      borderRadius: 14,
                      border: validationErrors.vehicle_registration ? '1.5px solid #DC2626' : '1px solid rgba(17, 17, 17, 0.18)',
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#1C1C1C',
                      letterSpacing: '0.4px',
                      background: validationErrors.vehicle_registration ? '#FFF1F2' : '#FFFFFF',
                      outline: 'none',
                    }}
                    required
                  />
                  {validationErrors.vehicle_registration && (
                    <div style={{ fontSize: 11.5, color: '#DC2626', marginTop: 3 }}>{validationErrors.vehicle_registration}</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#1C1C1C', marginBottom: 6 }}>
                    Vehicle Make *
                  </label>
                  <input
                    type="text"
                    name="vehicle_make"
                    value={formData.vehicle_make}
                    onChange={handleInputChange}
                    placeholder="e.g. Hyundai, Honda, Maruti"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 14,
                      border: validationErrors.vehicle_make ? '1.5px solid #DC2626' : '1px solid rgba(17, 17, 17, 0.18)',
                      fontSize: 14,
                      color: '#1C1C1C',
                      background: validationErrors.vehicle_make ? '#FFF1F2' : '#FFFFFF',
                      outline: 'none',
                    }}
                    required
                  />
                  {validationErrors.vehicle_make && (
                    <div style={{ fontSize: 11.5, color: '#DC2626', marginTop: 3 }}>{validationErrors.vehicle_make}</div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#1C1C1C', marginBottom: 6 }}>
                    Vehicle Model *
                  </label>
                  <input
                    type="text"
                    name="vehicle_model"
                    value={formData.vehicle_model}
                    onChange={handleInputChange}
                    placeholder="e.g. Creta SX, City VX"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 14,
                      border: validationErrors.vehicle_model ? '1.5px solid #DC2626' : '1px solid rgba(17, 17, 17, 0.18)',
                      fontSize: 14,
                      color: '#1C1C1C',
                      background: validationErrors.vehicle_model ? '#FFF1F2' : '#FFFFFF',
                      outline: 'none',
                    }}
                    required
                  />
                  {validationErrors.vehicle_model && (
                    <div style={{ fontSize: 11.5, color: '#DC2626', marginTop: 3 }}>{validationErrors.vehicle_model}</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#1C1C1C', marginBottom: 6 }}>
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
                      padding: '12px 16px',
                      borderRadius: 14,
                      border: '1px solid rgba(17, 17, 17, 0.18)',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#1C1C1C',
                      background: '#FFFFFF',
                      outline: 'none',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#1C1C1C', marginBottom: 6 }}>
                    No Claim Bonus
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
                      padding: '12px 16px',
                      borderRadius: 14,
                      border: '1px solid rgba(17, 17, 17, 0.18)',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#1C1C1C',
                      background: '#FFFFFF',
                      outline: 'none',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#1C1C1C', marginBottom: 6 }}>
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
                      padding: '12px 16px',
                      borderRadius: 14,
                      border: '1px solid rgba(17, 17, 17, 0.18)',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#1C1C1C',
                      background: '#FFFFFF',
                      outline: 'none',
                    }}
                    required
                  />
                </div>
              </div>

              {/* Add-on Coverage Multi-Select */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#1C1C1C', marginBottom: 10 }}>
                  Included Add-on Coverages
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {['Zero Depreciation', 'Engine Protection', 'Roadside Assistance', 'Key Replacement', 'Tyre Protect'].map((addon) => {
                    const isChecked = formData.selected_addons.includes(addon);
                    return (
                      <button
                        key={addon}
                        type="button"
                        onClick={() => handleAddonToggle(addon)}
                        style={{
                          padding: '8px 18px',
                          borderRadius: 20,
                          fontSize: 13,
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

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '18px 28px',
                  borderRadius: 16,
                  border: '1px solid rgba(222, 216, 237, 0.45)',
                  background: 'linear-gradient(135deg, #111111 0%, #2A2A2A 100%)',
                  color: '#DED8ED',
                  fontWeight: 900,
                  fontSize: 15.5,
                  cursor: loading ? 'wait' : 'pointer',
                  boxShadow: '0 10px 28px rgba(17, 17, 17, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  transition: 'all 0.25s ease',
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    <span>Automating & Querying Insurers...</span>
                  </>
                ) : (
                  <>
                    <span>Compare Insurers in Real-Time</span>
                    <ArrowRight size={18} color="#DED8ED" />
                  </>
                )}
              </button>
            </form>
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
                    background: '#111111',
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
                    Policyholder: <strong>{formData.customer_name}</strong> • IDV: <strong>₹{Number(formData.idv).toLocaleString('en-IN')}</strong> • NCB: <strong>{formData.ncb_percent}%</strong> • Age: <strong>{formData.vehicle_age_years} Yrs</strong>
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
                Modify Details / Re-Compare
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
                    Compared Quotations
                  </h2>
                  <span
                    style={{
                      background: '#111111',
                      color: '#DED8ED',
                      fontSize: 12,
                      fontWeight: 800,
                      padding: '3px 12px',
                      borderRadius: 20,
                    }}
                  >
                    {sortedQuotes.length} Underwriters Ready
                  </span>
                </div>
                <p style={{ fontSize: 13.5, color: '#666666', margin: '4px 0 0' }}>
                  Scroll right or left to browse plans. Sorted by premium: <strong>{sortOrder === 'high_to_low' ? 'High to Low' : 'Low to High'}</strong>.
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
                      background: '#111111',
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
                        background: '#111111',
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
                          <span style={{ color: '#666666' }}>Cover Value (IDV):</span>
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
                          Included Coverages:
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
                          <span style={{ fontSize: 11, color: '#666666', fontWeight: 700 }}>Total Annual Premium</span>
                          <div style={{ fontSize: 24, fontWeight: 900, color: '#111111', letterSpacing: '-0.02em' }}>
                            ₹{Number(q.premium).toLocaleString('en-IN')}
                            <span style={{ fontSize: 12, color: '#666666', fontWeight: 500 }}>/yr</span>
                          </div>
                        </div>
                        <span style={{ fontSize: 11, color: '#059669', fontWeight: 800, background: '#ECFDF5', padding: '2px 8px', borderRadius: 8 }}>
                          Incl. 18% GST
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
                          background: '#111111',
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
                        <span>Choose Plan & Issue</span>
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
                Policy Successfully Issued!
              </h2>
              <p style={{ fontSize: 14, color: '#666666', marginTop: 8 }}>
                Your insurance contract is now active and stored in your Digital Policy Vault.
              </p>

              <div style={{ background: '#EBEBEB', borderRadius: 16, padding: '16px 20px', margin: '20px 0', textAlign: 'left', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid rgba(17, 17, 17, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666666' }}>Policy Number:</span>
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
                    background: '#111111',
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
    </div>
  );
}
