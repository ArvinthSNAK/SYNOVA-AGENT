import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '../../api/httpClient';
import { useAuth } from '../../context/AuthContext';
import InsurerLogoBadge from '../common/InsurerLogoBadge';
import WalletTopupModal from '../wallet/WalletTopupModal';
import { downloadPolicyPdf } from '../../utils/generatePolicyPdf';
import {
  validateVehicleRegistration,
  formatVehicleRegistration,
  validatePAN,
  validatePhone,
  validateEmail,
  validateVehicleYear,
} from '../../utils/validators';
import { ShieldCheck, QrCode, CreditCard, Landmark, ArrowRight, ArrowLeft, Check, Shield, Download, Lock, CheckSquare, Square, Wallet, Plus, Sparkles, AlertCircle, AlertTriangle } from 'lucide-react';

export default function BuyPolicyModal({ product, onClose, onSuccess }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentAgreed, setPaymentAgreed] = useState(false);

  // Vault Wallet Balance
  const uKey = user ? (user.id || user.email) : 'guest';
  const [vaultBalance, setVaultBalance] = useState(() => {
    const stored = localStorage.getItem(`synova_wallet_balance_${uKey}`);
    if (stored !== null) return parseFloat(stored);
    localStorage.setItem(`synova_wallet_balance_${uKey}`, '50000');
    return 50000;
  });
  const [showTopupModal, setShowTopupModal] = useState(false);

  const refreshVaultBalance = () => {
    const stored = localStorage.getItem(`synova_wallet_balance_${uKey}`);
    if (stored !== null) {
      setVaultBalance(parseFloat(stored));
    }
  };

  useEffect(() => {
    refreshVaultBalance();
    const handleWalletEvent = () => refreshVaultBalance();
    window.addEventListener('synova_wallet_updated', handleWalletEvent);
    window.addEventListener('storage', handleWalletEvent);
    return () => {
      window.removeEventListener('synova_wallet_updated', handleWalletEvent);
      window.removeEventListener('storage', handleWalletEvent);
    };
  }, [uKey]);

  // Form State
  const [formData, setFormData] = useState({
    // Proposer Details
    fullName: user?.name || 'Hariharan Murugesan',
    email: user?.email || 'hariharan@synova.ai',
    phone: '9876543210',
    dob: '1995-06-15',
    panNumber: 'ABCDE1234F',
    address: '142, Indiranagar 100ft Road, Bengaluru, Karnataka - 560038',

    // Category Details
    // Health
    planType: 'Family Floater',
    memberCount: '2',
    adultsCount: '2',
    childrenCount: '0',
    hasPreExisting: 'no',
    sumInsured: product?.coverage_amount || 1000000,

    // Motor
    vehicleRegistration: 'KA-01-MJ-8821',
    vehicleMake: 'Hyundai',
    vehicleModel: 'Creta 1.5 SX',
    registrationYear: '2023',
    fuelType: 'Petrol',

    // Term Life
    lifeCover: 10000000,
    coverAge: '65',
    tobaccoUser: 'no',
    incomeRange: '15-25LPA',
    occupation: 'Salaried Professional',

    // Nominee Details
    nomineeName: 'Priya Murugesan',
    nomineeRelation: 'Spouse',
    nomineeDob: '1996-08-20',

    // Add-ons / Riders
    selectedAddons: [],

    // KYC
    kycDocumentType: 'Aadhaar Card / PAN',
    kycVerified: true,

    // Payment Method - defaults to 'wallet' for seamless instant checkout
    paymentMethod: 'wallet',
    upiId: 'hariharan@okhdfcbank',
  });

  // Server-side Payment State
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [issuedPolicy, setIssuedPolicy] = useState(null);

  const formatCurrency = (val) => {
    if (!val && val !== 0) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const isTermLife = product.category === 'term' || product.insurance_type === 'term';
  const isMotor = product.category === 'motor' || product.insurance_type === 'motor';
  const isHealth = !isTermLife && !isMotor;

  const [fieldErrors, setFieldErrors] = useState({});

  const validateCurrentStep = (currStep = step) => {
    const errs = {};

    if (currStep === 1) {
      if (!formData.sumInsured || formData.sumInsured <= 0) {
        errs.sumInsured = 'Please select a valid coverage amount';
      }
    } else if (currStep === 2) {
      if (!formData.fullName || formData.fullName.trim().length < 3) {
        errs.fullName = 'Full name is required (at least 3 characters)';
      }
      const emailRes = validateEmail(formData.email);
      if (!emailRes.isValid) errs.email = emailRes.error;

      const phoneRes = validatePhone(formData.phone);
      if (!phoneRes.isValid) errs.phone = phoneRes.error;

      const panRes = validatePAN(formData.panNumber);
      if (!panRes.isValid) errs.panNumber = panRes.error;

      if (!formData.address || formData.address.trim().length < 8) {
        errs.address = 'Residential address is required (minimum 8 characters)';
      }
    } else if (currStep === 3) {
      if (isMotor) {
        const regVal = validateVehicleRegistration(formData.vehicleRegistration);
        if (!regVal.isValid) {
          errs.vehicleRegistration = regVal.error;
        }
        if (!formData.vehicleMake || formData.vehicleMake.trim().length < 2) {
          errs.vehicleMake = 'Vehicle Make is required (e.g. Hyundai, Honda, Maruti, Tata)';
        }
        if (!formData.vehicleModel || formData.vehicleModel.trim().length < 2) {
          errs.vehicleModel = 'Vehicle Model & Variant is required (e.g. Creta 1.5 SX, City VX)';
        }
        const yrVal = validateVehicleYear(formData.registrationYear);
        if (!yrVal.isValid) {
          errs.registrationYear = yrVal.error;
        }
      } else if (isTermLife) {
        if (!formData.annualIncome || Number(formData.annualIncome) < 100000) {
          errs.annualIncome = 'Annual income must be at least ₹1,00,000 for life cover eligibility';
        }
      }
    } else if (currStep === 4) {
      if (!formData.nomineeName || formData.nomineeName.trim().length < 3) {
        errs.nomineeName = 'Nominee full name is required';
      }
      if (!formData.nomineeDob) {
        errs.nomineeDob = 'Nominee date of birth is required';
      }
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const calculateTotalPremium = (coverVal = formData.sumInsured) => {
    const defaultCover = product?.coverage_amount || (isTermLife ? 10000000 : (isMotor ? 650000 : 1000000));
    const defaultBase = product?.premium || (isTermLife ? 1499 : (isMotor ? 11500 : 8500));
    const chosenCover = Number(coverVal) || defaultCover;

    let base = defaultBase;

    if (isTermLife) {
      // Linear actuarial scale for Pure Term Life
      const ratio = chosenCover / (defaultCover || 10000000);
      base = Math.round(defaultBase * ratio);
      if (formData.tobaccoUser === 'yes' || formData.isSmoker === 'yes') {
        base = Math.round(base * 1.4);
      }
    } else if (isMotor) {
      // Motor Own Damage + TP statutory
      const ratio = chosenCover / (defaultCover || 650000);
      const ownDamage = (defaultBase * 0.7) * ratio;
      const thirdParty = 3416;
      base = Math.round(ownDamage + thirdParty);
    } else {
      // Health - Sublinear risk curve
      const ratio = chosenCover / (defaultCover || 1000000);
      base = Math.round(defaultBase * Math.pow(ratio, 0.74));
      if (formData.planType === 'Family Floater') {
        base = Math.round(base * 1.25);
      } else if (formData.planType === 'Parents') {
        base = Math.round(base * 1.45);
      }
      if (formData.hasPreExisting === 'yes') {
        base = Math.round(base * 1.2);
      }
    }

    if (formData.selectedAddons && formData.selectedAddons.length > 0) {
      base += formData.selectedAddons.length * 450;
    }

    const gst = Math.round(base * 0.18);
    return {
      base,
      gst,
      total: Math.round(base + gst),
    };
  };

  const premiums = calculateTotalPremium(formData.sumInsured);

  // Create Server Payment Order
  const handleInitiatePayment = async () => {
    setLoading(true);
    setError(null);

    // If wallet chosen, check balance
    if (formData.paymentMethod === 'wallet' && vaultBalance < premiums.total) {
      setError(`Insufficient Vault balance. You need ${formatCurrency(premiums.total - vaultBalance)} more. Please top up your Vault balance or choose another payment method.`);
      setLoading(false);
      return;
    }

    try {
      const res = await httpClient.post('/payments/create-order', {
        product_id: product.id,
        amount: premiums.total,
        customer_id: user?.id || 1,
        payment_method: formData.paymentMethod,
        application_data: {
          ...formData,
          product_name: product.name,
          insurer_name: product.insurer_name,
          category: product.category || product.insurance_type,
          coverage_amount: formData.sumInsured || product.coverage_amount || 1000000,
        },
      });

      setPaymentOrder(res.data);
      setStep(8); // Proceed to Sandbox / Vault Payment Gateway Modal
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create payment order');
    } finally {
      setLoading(false);
    }
  };

  // Verify Server Payment & Debit Wallet if used
  const handleVerifyPayment = async (status = 'success') => {
    setLoading(true);
    setError(null);
    try {
      const res = await httpClient.post('/payments/verify', {
        order_id: paymentOrder.order_id,
        simulated_status: status,
      });

      const policyNum = res.data?.policy_number || `SYN-POL-${Date.now().toString().slice(-6)}`;
      const savedPolicy = {
        id: res.data?.policy_id || Date.now(),
        policy_number: policyNum,
        policy_type: product.name,
        product_name: product.name,
        plan_name: product.name,
        insurer_name: product.insurer_name || res.data?.insurer_name || 'ICICI Lombard General',
        insurer: product.insurer_name || res.data?.insurer_name || 'ICICI Lombard General',
        insurance_type: product.category || product.insurance_type || 'health',
        status: 'active',
        premium: premiums.total,
        premium_amount: premiums.total,
        coverage_amount: formData.sumInsured || product.coverage_amount || 1000000,
        idv: formData.sumInsured || product.coverage_amount || 1000000,
        idv_amount: formData.sumInsured || product.coverage_amount || 1000000,
        vehicle_registration: formData.vehicleRegistration || (product.category === 'motor' ? 'KA-01-MJ-8821' : null),
        vehicle_number: formData.vehicleRegistration || (product.category === 'motor' ? 'KA-01-MJ-8821' : null),
        ncb_percent: product.category === 'motor' ? 20 : 0,
        start_date: new Date().toISOString().substring(0, 10),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        created_at: new Date().toISOString(),
        payment_method: formData.paymentMethod === 'wallet' ? 'Insurance Vault Balance' : (formData.paymentMethod === 'upi' ? 'Instant UPI' : 'Card/NetBanking'),
        holder_name: formData.fullName || 'Hariharan Murugesan',
        proposer_name: formData.fullName || 'Hariharan Murugesan',
        customer_name: formData.fullName || 'Hariharan Murugesan',
        notes: `Digitally issued via Synova Marketplace. Order: ${paymentOrder.order_id}`,
      };

      // If paid via Vault Balance, deduct from wallet & log ledger transaction
      if (formData.paymentMethod === 'wallet') {
        const remainingBal = Math.max(0, vaultBalance - premiums.total);
        localStorage.setItem(`synova_wallet_balance_${uKey}`, remainingBal);
        setVaultBalance(remainingBal);

        const debitTxn = {
          id: Date.now(),
          type: 'DEBIT',
          amount: premiums.total,
          description: `Policy Issuance: ${product.name} (${savedPolicy.policy_number})`,
          date: new Date().toISOString(),
          txn_id: `SYN-DEBIT-${Date.now().toString().slice(-8)}`,
        };

        const existingTxns = JSON.parse(localStorage.getItem(`synova_wallet_txns_${uKey}`) || '[]');
        localStorage.setItem(`synova_wallet_txns_${uKey}`, JSON.stringify([debitTxn, ...existingTxns]));

        // Broadcast wallet update event across app
        window.dispatchEvent(new CustomEvent('synova_wallet_updated', { detail: { newBalance: remainingBal, txn: debitTxn } }));
      }

      // Persist strictly to this user's isolated vault storage
      const keysToSave = uKey === 'guest'
        ? ['synova_vault_policies_guest']
        : [
            `synova_vault_policies_${uKey}`,
            `synova_vault_policies_user_${uKey}`,
            user?.id ? `synova_vault_policies_${user.id}` : null,
            user?.id ? `synova_vault_policies_user_${user.id}` : null,
            user?.email ? `synova_vault_policies_${user.email}` : null,
            user?.email ? `synova_vault_policies_user_${user.email}` : null,
          ].filter(Boolean);

      for (const k of keysToSave) {
        try {
          const existing = JSON.parse(localStorage.getItem(k) || '[]');
          const filtered = Array.isArray(existing) ? existing.filter((p) => p.policy_number !== savedPolicy.policy_number) : [];
          localStorage.setItem(k, JSON.stringify([savedPolicy, ...filtered]));
        } catch (e) {}
      }

      // Dispatch global purchase events so Insurance Vault updates instantly
      window.dispatchEvent(new CustomEvent('synova_policy_purchased', { detail: savedPolicy }));
      window.dispatchEvent(new Event('storage'));

      setIssuedPolicy(savedPolicy);
      setStep(10); // Success Screen
      if (onSuccess) onSuccess(savedPolicy);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
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
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 24,
          maxWidth: 700,
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar Header */}
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid #E2E8F0',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#111111', background: '#DED8ED', padding: '3px 10px', borderRadius: 20 }}>
                Step {step <= 7 ? step : step === 8 ? '8 of 10' : 'Complete'}
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1C1C1C', margin: '6px 0 0' }}>
                {step === 1 && '1. Plan Confirmation'}
                {step === 2 && '2. Proposer & Contact Details'}
                {step === 3 && '3. Underwriting & Health Details'}
                {step === 4 && '4. Nominee & Beneficiary Information'}
                {step === 5 && '5. Digital KYC Verification'}
                {step === 6 && '6. Application Review'}
                {step === 7 && '7. Premium & Payment Confirmation'}
                {step === 8 && '8. Sandbox Payment Gateway'}
                {step === 10 && '✓ Policy Successfully Issued'}
              </h3>
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                cursor: 'pointer',
                fontSize: 16,
                color: '#64748B',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ width: '100%', height: 6, background: '#EBEBEB', borderRadius: 3, overflow: 'hidden' }}>
            <div
              style={{
                width: `${(step / 10) * 100}%`,
                height: '100%',
                background: '#111111',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div style={{ padding: 12, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, color: '#DC2626', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* STEP 1: Plan Confirmation */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ padding: 18, background: '#EBEBEB', borderRadius: 16, border: '1px solid rgba(17, 17, 17, 0.08)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <InsurerLogoBadge insurerName={product.insurer_name} size={48} rounded={12} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#111111', fontWeight: 800, textTransform: 'uppercase' }}>Selected Product</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#1C1C1C', marginTop: 2 }}>{product.name}</div>
                  <div style={{ fontSize: 13, color: '#666666', marginTop: 2 }}>{product.insurer_name} • ★ {product.rating || '4.8'}</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(17, 17, 17, 0.08)' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#666666', fontWeight: 700 }}>Active Sum Insured / Cover</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#1C1C1C', marginTop: 2 }}>{formatCurrency(formData.sumInsured)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#666666', fontWeight: 700 }}>Total Annual Premium (incl. GST)</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#111111', marginTop: 2 }}>{formatCurrency(premiums.total)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 800, color: '#1C1C1C', display: 'block' }}>
                    {isMotor ? 'Select Insured Declared Value (IDV)' : isTermLife ? 'Select Term Life Cover Amount' : 'Choose Health Coverage / Sum Insured'}
                  </label>
                  <span style={{ fontSize: 11.5, color: '#111111', fontWeight: 800, background: '#DED8ED', padding: '3px 10px', borderRadius: 12 }}>
                    ⚡ Real-Time Premium Adjuster
                  </span>
                </div>

                <select
                  value={formData.sumInsured}
                  onChange={(e) => setFormData({ ...formData, sumInsured: Number(e.target.value) })}
                  style={{ width: '100%', padding: '13px 14px', borderRadius: 12, border: '1.5px solid #111111', fontSize: 14, fontWeight: 700, color: '#1C1C1C', background: '#FFFFFF', cursor: 'pointer' }}
                >
                  {isTermLife ? (
                    <>
                      <option value={5000000}>₹50 Lakh Cover — {formatCurrency(calculateTotalPremium(5000000).total)}/yr</option>
                      <option value={10000000}>₹1 Crore Cover (Recommended) — {formatCurrency(calculateTotalPremium(10000000).total)}/yr</option>
                      <option value={15000000}>₹1.5 Crore Cover — {formatCurrency(calculateTotalPremium(15000000).total)}/yr</option>
                      <option value={20000000}>₹2 Crore Cover — {formatCurrency(calculateTotalPremium(20000000).total)}/yr</option>
                      <option value={50000000}>₹5 Crore High Protection — {formatCurrency(calculateTotalPremium(50000000).total)}/yr</option>
                    </>
                  ) : isMotor ? (
                    <>
                      <option value={350000}>₹3.5 Lakh IDV (Hatchback/Sedan) — {formatCurrency(calculateTotalPremium(350000).total)}/yr</option>
                      <option value={500000}>₹5.0 Lakh IDV (Compact SUV) — {formatCurrency(calculateTotalPremium(500000).total)}/yr</option>
                      <option value={650000}>₹6.5 Lakh IDV (Creta / Seltos) — {formatCurrency(calculateTotalPremium(650000).total)}/yr</option>
                      <option value={950000}>₹9.5 Lakh IDV (Mid-size SUV / EV) — {formatCurrency(calculateTotalPremium(950000).total)}/yr</option>
                      <option value={1500000}>₹15.0 Lakh IDV (Premium SUV) — {formatCurrency(calculateTotalPremium(1500000).total)}/yr</option>
                      <option value={2500000}>₹25.0 Lakh IDV (Luxury Car) — {formatCurrency(calculateTotalPremium(2500000).total)}/yr</option>
                    </>
                  ) : (
                    <>
                      <option value={500000}>₹5 Lakh Cover — {formatCurrency(calculateTotalPremium(500000).total)}/yr</option>
                      <option value={1000000}>₹10 Lakh Cover (Recommended) — {formatCurrency(calculateTotalPremium(1000000).total)}/yr</option>
                      <option value={1500000}>₹15 Lakh Cover — {formatCurrency(calculateTotalPremium(1500000).total)}/yr</option>
                      <option value={2500000}>₹25 Lakh Multi-City Protection — {formatCurrency(calculateTotalPremium(2500000).total)}/yr</option>
                      <option value={5000000}>₹50 Lakh Super Saver — {formatCurrency(calculateTotalPremium(5000000).total)}/yr</option>
                      <option value={10000000}>₹1 Crore Global Shield — {formatCurrency(calculateTotalPremium(10000000).total)}/yr</option>
                    </>
                  )}
                </select>

                <div style={{ marginTop: 12, padding: '10px 14px', background: '#DED8ED', borderRadius: 12, border: '1px solid #111111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                  <span style={{ color: '#111111', fontWeight: 700 }}>Net Payable (incl. Base + 18% GST):</span>
                  <strong style={{ color: '#111111', fontSize: 15, fontWeight: 900 }}>{formatCurrency(premiums.total)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Proposer Details */}
          {step === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Full Name (as per PAN/Aadhaar) *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: null });
                  }}
                  placeholder="e.g. Ramesh Patel"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: fieldErrors.fullName ? '1.5px solid #E11D48' : '1px solid #CBD5E1',
                    fontSize: 14,
                    background: fieldErrors.fullName ? '#FFF1F2' : '#FFFFFF',
                  }}
                />
                {fieldErrors.fullName && <div style={{ fontSize: 11.5, color: '#E11D48', marginTop: 3 }}>{fieldErrors.fullName}</div>}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                  }}
                  placeholder="name@domain.com"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: fieldErrors.email ? '1.5px solid #E11D48' : '1px solid #CBD5E1',
                    fontSize: 14,
                    background: fieldErrors.email ? '#FFF1F2' : '#FFFFFF',
                  }}
                />
                {fieldErrors.email && <div style={{ fontSize: 11.5, color: '#E11D48', marginTop: 3 }}>{fieldErrors.email}</div>}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Mobile Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({ ...formData, phone: clean });
                    if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: null });
                  }}
                  placeholder="e.g. 9876543210"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: fieldErrors.phone ? '1.5px solid #E11D48' : '1px solid #CBD5E1',
                    fontSize: 14,
                    background: fieldErrors.phone ? '#FFF1F2' : '#FFFFFF',
                  }}
                />
                {fieldErrors.phone && <div style={{ fontSize: 11.5, color: '#E11D48', marginTop: 3 }}>{fieldErrors.phone}</div>}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  PAN Card Number *
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={formData.panNumber}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setFormData({ ...formData, panNumber: val });
                    if (fieldErrors.panNumber) setFieldErrors({ ...fieldErrors, panNumber: null });
                  }}
                  placeholder="e.g. ABCDE1234F"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: fieldErrors.panNumber ? '1.5px solid #E11D48' : '1px solid #CBD5E1',
                    fontSize: 14,
                    background: fieldErrors.panNumber ? '#FFF1F2' : '#FFFFFF',
                  }}
                />
                {fieldErrors.panNumber && <div style={{ fontSize: 11.5, color: '#E11D48', marginTop: 3 }}>{fieldErrors.panNumber}</div>}
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Permanent Residential Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (fieldErrors.address) setFieldErrors({ ...fieldErrors, address: null });
                  }}
                  placeholder="House/Flat No, Street, City, State, PIN"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: fieldErrors.address ? '1.5px solid #E11D48' : '1px solid #CBD5E1',
                    fontSize: 14,
                    background: fieldErrors.address ? '#FFF1F2' : '#FFFFFF',
                  }}
                />
                {fieldErrors.address && <div style={{ fontSize: 11.5, color: '#E11D48', marginTop: 3 }}>{fieldErrors.address}</div>}
              </div>
            </div>
          )}

          {/* STEP 3: Underwriting & Category Specific */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {product.category === 'health' || product.insurance_type === 'health' ? (
                <>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>Policy Type</label>
                    <select
                      value={formData.planType}
                      onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                    >
                      <option value="Individual">Individual (Self Only)</option>
                      <option value="Family Floater">Family Floater (Self + Spouse + Kids)</option>
                      <option value="Parents">Parents Only Plan</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Do any covered members have pre-existing medical conditions (Diabetes, BP, Thyroid, Asthma)?
                    </label>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="ped"
                          value="no"
                          checked={formData.hasPreExisting === 'no'}
                          onChange={() => setFormData({ ...formData, hasPreExisting: 'no' })}
                        />
                        No Pre-existing Conditions
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="ped"
                          value="yes"
                          checked={formData.hasPreExisting === 'yes'}
                          onChange={() => setFormData({ ...formData, hasPreExisting: 'yes' })}
                        />
                        Yes, I have conditions to declare
                      </label>
                    </div>
                  </div>
                </>
              ) : product.category === 'term' || product.insurance_type === 'term' ? (
                <>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Annual Income (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.annualIncome || 1200000}
                      onChange={(e) => {
                        setFormData({ ...formData, annualIncome: e.target.value });
                        if (fieldErrors.annualIncome) setFieldErrors({ ...fieldErrors, annualIncome: null });
                      }}
                      placeholder="e.g. 1200000"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: fieldErrors.annualIncome ? '1.5px solid #E11D48' : '1px solid #CBD5E1',
                        fontSize: 14,
                        background: fieldErrors.annualIncome ? '#FFF1F2' : '#FFFFFF',
                      }}
                    />
                    {fieldErrors.annualIncome && <div style={{ fontSize: 11.5, color: '#E11D48', marginTop: 3 }}>{fieldErrors.annualIncome}</div>}
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>Tobacco / Smoking Status</label>
                    <select
                      value={formData.isSmoker}
                      onChange={(e) => setFormData({ ...formData, isSmoker: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                    >
                      <option value="no">Non-Smoker / Zero Tobacco (Preferred Rate)</option>
                      <option value="yes">Smoker / Consumes Tobacco</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                        Vehicle Registration Number (RTO Format) *
                      </label>
                      {formData.vehicleRegistration && validateVehicleRegistration(formData.vehicleRegistration).isValid && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Check size={13} /> Valid RTO Number
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={14}
                      value={formData.vehicleRegistration || ''}
                      onChange={(e) => {
                        const formatted = formatVehicleRegistration(e.target.value);
                        setFormData({ ...formData, vehicleRegistration: formatted });
                        if (fieldErrors.vehicleRegistration) {
                          if (validateVehicleRegistration(formatted).isValid) {
                            setFieldErrors({ ...fieldErrors, vehicleRegistration: null });
                          }
                        }
                      }}
                      placeholder="e.g. KA-01-MJ-8821 or MH-12-DE-1433"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: fieldErrors.vehicleRegistration ? '1.5px solid #E11D48' : '1px solid #CBD5E1',
                        fontSize: 14,
                        letterSpacing: '0.5px',
                        fontWeight: 700,
                        background: fieldErrors.vehicleRegistration ? '#FFF1F2' : '#FFFFFF',
                      }}
                    />
                    {fieldErrors.vehicleRegistration && (
                      <div style={{ fontSize: 11.5, color: '#E11D48', marginTop: 3 }}>
                        {fieldErrors.vehicleRegistration}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                        Vehicle Make *
                      </label>
                      <input
                        type="text"
                        value={formData.vehicleMake || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, vehicleMake: e.target.value });
                          if (fieldErrors.vehicleMake) setFieldErrors({ ...fieldErrors, vehicleMake: null });
                        }}
                        placeholder="e.g. Hyundai, Honda, Maruti"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: fieldErrors.vehicleMake ? '1.5px solid #E11D48' : '1px solid #CBD5E1',
                          fontSize: 14,
                          background: fieldErrors.vehicleMake ? '#FFF1F2' : '#FFFFFF',
                        }}
                      />
                      {fieldErrors.vehicleMake && <div style={{ fontSize: 11.5, color: '#E11D48', marginTop: 3 }}>{fieldErrors.vehicleMake}</div>}
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                        Vehicle Model & Variant *
                      </label>
                      <input
                        type="text"
                        value={formData.vehicleModel || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, vehicleModel: e.target.value });
                          if (fieldErrors.vehicleModel) setFieldErrors({ ...fieldErrors, vehicleModel: null });
                        }}
                        placeholder="e.g. Creta 1.5 SX"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: fieldErrors.vehicleModel ? '1.5px solid #E11D48' : '1px solid #CBD5E1',
                          fontSize: 14,
                          background: fieldErrors.vehicleModel ? '#FFF1F2' : '#FFFFFF',
                        }}
                      />
                      {fieldErrors.vehicleModel && <div style={{ fontSize: 11.5, color: '#E11D48', marginTop: 3 }}>{fieldErrors.vehicleModel}</div>}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                        Registration Year (YYYY) *
                      </label>
                      <input
                        type="number"
                        min="1995"
                        max={new Date().getFullYear()}
                        value={formData.registrationYear || '2023'}
                        onChange={(e) => {
                          setFormData({ ...formData, registrationYear: e.target.value });
                          if (fieldErrors.registrationYear) setFieldErrors({ ...fieldErrors, registrationYear: null });
                        }}
                        placeholder="e.g. 2023"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: fieldErrors.registrationYear ? '1.5px solid #E11D48' : '1px solid #CBD5E1',
                          fontSize: 14,
                          background: fieldErrors.registrationYear ? '#FFF1F2' : '#FFFFFF',
                        }}
                      />
                      {fieldErrors.registrationYear && <div style={{ fontSize: 11.5, color: '#E11D48', marginTop: 3 }}>{fieldErrors.registrationYear}</div>}
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>Fuel Type</label>
                      <select
                        value={formData.fuelType || 'Petrol'}
                        onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="CNG">CNG</option>
                        <option value="Electric">Electric (EV)</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 4: Nominee Details */}
          {step === 4 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Nominee Full Name *
                </label>
                <input
                  type="text"
                  value={formData.nomineeName}
                  onChange={(e) => {
                    setFormData({ ...formData, nomineeName: e.target.value });
                    if (fieldErrors.nomineeName) setFieldErrors({ ...fieldErrors, nomineeName: null });
                  }}
                  placeholder="e.g. Priya Murugesan"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: fieldErrors.nomineeName ? '1.5px solid #E11D48' : '1px solid #CBD5E1',
                    fontSize: 14,
                    background: fieldErrors.nomineeName ? '#FFF1F2' : '#FFFFFF',
                  }}
                />
                {fieldErrors.nomineeName && <div style={{ fontSize: 11.5, color: '#E11D48', marginTop: 3 }}>{fieldErrors.nomineeName}</div>}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>Relationship with Proposer</label>
                <select
                  value={formData.nomineeRelation}
                  onChange={(e) => setFormData({ ...formData, nomineeRelation: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 14 }}
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Nominee Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.nomineeDob}
                  onChange={(e) => {
                    setFormData({ ...formData, nomineeDob: e.target.value });
                    if (fieldErrors.nomineeDob) setFieldErrors({ ...fieldErrors, nomineeDob: null });
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: fieldErrors.nomineeDob ? '1.5px solid #E11D48' : '1px solid #CBD5E1',
                    fontSize: 14,
                    background: fieldErrors.nomineeDob ? '#FFF1F2' : '#FFFFFF',
                  }}
                />
                {fieldErrors.nomineeDob && <div style={{ fontSize: 11.5, color: '#E11D48', marginTop: 3 }}>{fieldErrors.nomineeDob}</div>}
              </div>
            </div>
          )}

          {/* STEP 5: KYC Verification */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center', padding: '20px 0', alignItems: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#DED8ED', color: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={36} color="#111111" />
              </div>
              <h4 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>Instant Paperless Digital KYC</h4>
              <p style={{ fontSize: 14, color: '#64748B', maxWidth: 450, margin: '0 auto' }}>
                Your identity has been auto-verified via UIDAI / NSDL sandbox matching PAN: <strong>{formData.panNumber}</strong>.
              </p>
              <div style={{ padding: 14, background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, color: '#047857', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={16} /> Central KYC Registry (CKYC) Verified & Compliant
              </div>
            </div>
          )}

          {/* STEP 6: Application Review */}
          {step === 6 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: 18 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 12px', color: '#0F172A', textTransform: 'uppercase' }}>Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                  <div><span style={{ color: '#64748B' }}>Insurer:</span> <strong>{product.insurer_name}</strong></div>
                  <div><span style={{ color: '#64748B' }}>Plan:</span> <strong>{product.name}</strong></div>
                  <div><span style={{ color: '#64748B' }}>Proposer:</span> <strong>{formData.fullName}</strong></div>
                  <div><span style={{ color: '#64748B' }}>Nominee:</span> <strong>{formData.nomineeName} ({formData.nomineeRelation})</strong></div>
                  <div><span style={{ color: '#666666' }}>Coverage:</span> <strong style={{ color: '#111111', fontWeight: 800 }}>{formatCurrency(formData.sumInsured)}</strong></div>
                  <div><span style={{ color: '#64748B' }}>Tenure:</span> <strong>1 Year (Renewable)</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Premium & Payment Confirmation */}
          {step === 7 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: '#64748B' }}>Base Premium</span>
                  <span style={{ fontWeight: 700 }}>{formatCurrency(premiums.base)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                  <span style={{ color: '#64748B' }}>GST (18% Statutory)</span>
                  <span style={{ fontWeight: 700 }}>{formatCurrency(premiums.gst)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '2px dashed rgba(17, 17, 17, 0.15)', fontSize: 18 }}>
                  <span style={{ fontWeight: 800, color: '#1C1C1C' }}>Total Payable Amount</span>
                  <span style={{ fontWeight: 900, color: '#111111' }}>{formatCurrency(premiums.total)}</span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 800, color: '#0F172A', display: 'block' }}>
                    Choose Payment Method
                  </label>
                  <span style={{ fontSize: 12, color: '#64748B' }}>
                    Vault Balance: <strong style={{ color: '#059669' }}>{formatCurrency(vaultBalance)}</strong>
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                  {[
                    {
                      id: 'wallet',
                      label: 'Vault Balance',
                      sub: 'Instant 1-Click',
                      icon: <Wallet size={20} />,
                      badge: formatCurrency(vaultBalance),
                      isWallet: true,
                    },
                    { id: 'upi', label: 'UPI / QR', sub: 'Instant QR', icon: <QrCode size={20} /> },
                    { id: 'card', label: 'Cards', sub: 'Credit/Debit', icon: <CreditCard size={20} /> },
                    { id: 'netbanking', label: 'Net Banking', sub: 'All Banks', icon: <Landmark size={20} /> },
                  ].map((m) => {
                    const isSelected = formData.paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: m.id })}
                        style={{
                          padding: '14px 10px',
                          borderRadius: 14,
                          border: isSelected ? '2px solid #111111' : '1px solid rgba(17, 17, 17, 0.15)',
                          background: isSelected ? '#DED8ED' : '#FFFFFF',
                          color: isSelected ? '#111111' : '#1C1C1C',
                          fontWeight: 800,
                          fontSize: 12.5,
                          cursor: 'pointer',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          position: 'relative',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 4px 14px rgba(17, 17, 17, 0.15)' : 'none',
                        }}
                      >
                        {m.isWallet && (
                          <span
                            style={{
                              position: 'absolute',
                              top: -8,
                              right: -4,
                              background: '#059669',
                              color: '#FFFFFF',
                              fontSize: 9,
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: 8,
                            }}
                          >
                            RECOMMENDED
                          </span>
                        )}
                        <div>{m.icon}</div>
                        <div style={{ fontWeight: 800 }}>{m.label}</div>
                        <div style={{ fontSize: 10.5, color: isSelected ? '#111111' : '#666666' }}>{m.sub}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Vault Balance Highlight Box */}
                {formData.paymentMethod === 'wallet' && (
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      background: vaultBalance >= premiums.total ? '#F0FDF4' : '#FFFBEB',
                      border: vaultBalance >= premiums.total ? '1.5px solid #86EFAC' : '1.5px solid #FDE68A',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: vaultBalance >= premiums.total ? '#DCFCE7' : '#FEF3C7',
                            color: vaultBalance >= premiums.total ? '#059669' : '#D97706',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Wallet size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                            Available Vault Balance: <span style={{ color: '#059669' }}>{formatCurrency(vaultBalance)}</span>
                          </div>
                          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                            {vaultBalance >= premiums.total
                              ? '✓ Sufficient balance for instant 1-click issuance without gateway fee.'
                              : `⚠️ Short by ${formatCurrency(premiums.total - vaultBalance)} to complete purchase.`}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowTopupModal(true)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 10,
                          border: '1px solid #CBD5E1',
                          background: '#FFFFFF',
                          color: '#0F172A',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          flexShrink: 0,
                        }}
                      >
                        <Plus size={13} strokeWidth={3} />
                        <span>Add Money</span>
                      </button>
                    </div>

                    {vaultBalance >= premiums.total && (
                      <div
                        style={{
                          fontSize: 11.5,
                          color: '#065F46',
                          background: 'rgba(255, 255, 255, 0.6)',
                          padding: '8px 12px',
                          borderRadius: 8,
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>Remaining Balance After Payment:</span>
                        <strong>{formatCurrency(vaultBalance - premiums.total)}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 8: Secure Payment Authorization & Gateway */}
          {step === 8 && paymentOrder && (
            <div style={{ padding: '8px 0' }}>
              {/* Security Banner */}
              <div
                style={{
                  padding: '12px 16px',
                  background: formData.paymentMethod === 'wallet' ? '#EFF6FF' : '#ECFDF5',
                  border: formData.paymentMethod === 'wallet' ? '1px solid #BFDBFE' : '1px solid #A7F3D0',
                  borderRadius: 14,
                  color: formData.paymentMethod === 'wallet' ? '#1E40AF' : '#065F46',
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                {formData.paymentMethod === 'wallet' ? (
                  <Wallet size={18} color="#2563EB" />
                ) : (
                  <Lock size={18} color="#059669" />
                )}
                <span>
                  {formData.paymentMethod === 'wallet'
                    ? 'Synova Digital Vault Settlement • 1-Click Instant Ledger Debit'
                    : '256-Bit Bank Grade SSL Encrypted Checkout • RBI Authorized'}
                </span>
              </div>

              {/* Order Summary Box */}
              <div
                style={{
                  padding: 20,
                  background: '#F8FAFC',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Policy Plan</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{product.name}</div>
                    <div style={{ fontSize: 13, color: '#1565C0', fontWeight: 700, marginTop: 2 }}>Underwriter: {product.insurer_name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Total Premium</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#0B1F3A', marginTop: 2 }}>
                      {formatCurrency(paymentOrder.amount)}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 11.5, color: '#64748B', borderTop: '1px solid #E2E8F0', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Gateway Order Ref: <code>{paymentOrder.order_id}</code></span>
                  <span>Payment Mode: <strong style={{ color: formData.paymentMethod === 'wallet' ? '#2563EB' : '#0F172A' }}>{formData.paymentMethod === 'wallet' ? 'VAULT BALANCE (WALLET)' : formData.paymentMethod.toUpperCase()}</strong></span>
                </div>

                {formData.paymentMethod === 'wallet' && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #E2E8F0', fontSize: 12, display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Vault Balance After Purchase:</span>
                    <strong style={{ color: '#059669' }}>{formatCurrency(Math.max(0, vaultBalance - paymentOrder.amount))}</strong>
                  </div>
                )}
              </div>

              {/* Statutory Disclaimer Box */}
              <div
                style={{
                  padding: 14,
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 14,
                  marginBottom: 20,
                  fontSize: 12,
                  lineHeight: 1.55,
                  color: '#475569',
                }}
              >
                <strong>Statutory Notice (Section 64VB, Insurance Act 1938):</strong> Insurance risk commences only upon successful realization of premium. By proceeding, your policy schedule and digital certificate are issued in real-time.
              </div>

              {/* Mandatory Confirmation Checkbox */}
              <div
                onClick={() => setPaymentAgreed(!paymentAgreed)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: 14,
                  background: paymentAgreed ? '#F0FDF4' : '#FFFFFF',
                  border: paymentAgreed ? '2px solid #10B981' : '1.5px solid #CBD5E1',
                  borderRadius: 14,
                  cursor: 'pointer',
                  marginBottom: 24,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ marginTop: 2, flexShrink: 0 }}>
                  {paymentAgreed ? (
                    <CheckSquare size={20} color="#059669" />
                  ) : (
                    <Square size={20} color="#94A3B8" />
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: '#1E293B', lineHeight: 1.5, fontWeight: paymentAgreed ? 600 : 500 }}>
                  I confirm the proposer and declarations are accurate, and I authorize the deduction of <strong>{formatCurrency(paymentOrder.amount)}</strong> {formData.paymentMethod === 'wallet' ? 'from my Insurance Vault Balance' : 'via authorized gateway'} for instantaneous policy issuance.
                </div>
              </div>

              {/* Authorize & Confirm Payment Button */}
              <button
                disabled={!paymentAgreed || loading}
                onClick={() => handleVerifyPayment('success')}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 14,
                  border: 'none',
                  background: paymentAgreed
                    ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                    : '#94A3B8',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: paymentAgreed && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: paymentAgreed ? '0 6px 20px rgba(5, 150, 105, 0.35)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {formData.paymentMethod === 'wallet' ? <Wallet size={18} /> : <Lock size={18} />}
                <span>
                  {loading
                    ? (formData.paymentMethod === 'wallet' ? 'Debiting Vault Balance & Issuing Policy...' : 'Connecting to Banking Gateway...')
                    : (formData.paymentMethod === 'wallet' ? `Pay ${formatCurrency(paymentOrder.amount)} from Vault Balance` : `Authorize & Pay ${formatCurrency(paymentOrder.amount)} Securely`)}
                </span>
              </button>

              {/* Trust Footer */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 14, fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                <span>🛡️ Zero Surcharge</span>
                <span>•</span>
                <span>🔒 256-Bit SSL</span>
                <span>•</span>
                <span>📜 Instant Policy Delivery</span>
              </div>
            </div>
          )}

          {/* STEP 10: Issued Policy Success */}
          {step === 10 && issuedPolicy && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 900,
                margin: '0 auto 16px',
                border: '2px solid #A7F3D0'
              }}>✓</div>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', margin: '0 0 8px' }}>
                Policy Successfully Issued!
              </h3>
              <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 20px' }}>
                Your payment has been verified server-side. Your digital policy certificate is active and saved in your Insurance Vault.
              </p>

              <div style={{ padding: 18, background: '#EBEBEB', border: '1px solid rgba(17, 17, 17, 0.08)', borderRadius: 16, textAlign: 'left', maxWidth: 450, margin: '0 auto 24px' }}>
                <div style={{ fontSize: 12, color: '#666666', fontWeight: 700 }}>Policy Number</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#111111', marginTop: 2 }}>{issuedPolicy.policy_number}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, fontSize: 13 }}>
                  <div><span style={{ color: '#666666' }}>Insurer:</span> <strong style={{ color: '#1C1C1C' }}>{issuedPolicy.insurer_name}</strong></div>
                  <div><span style={{ color: '#666666' }}>Status:</span> <strong style={{ color: '#111111' }}>ACTIVE</strong></div>
                  <div><span style={{ color: '#666666' }}>Coverage:</span> <strong style={{ color: '#1C1C1C' }}>{formatCurrency(issuedPolicy.coverage_amount)}</strong></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => downloadPolicyPdf(issuedPolicy)}
                  style={{
                    padding: '14px 24px',
                    borderRadius: 14,
                    border: '1.5px solid #111111',
                    background: '#DED8ED',
                    color: '#111111',
                    fontWeight: 800,
                    fontSize: 14.5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Download size={18} color="#111111" />
                  <span>Download Policy PDF</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    navigate('/vault');
                  }}
                  style={{
                    padding: '14px 28px',
                    borderRadius: 14,
                    border: 'none',
                    background: '#111111',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: 14.5,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(17, 17, 17, 0.3)',
                  }}
                >
                  View in Insurance Vault ➔
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {step < 8 && (
          <div
            style={{
              padding: '18px 28px',
              borderTop: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {step < 7 ? (
              <button
                type="button"
                onClick={() => {
                  if (validateCurrentStep(step)) {
                    setStep(step + 1);
                  }
                }}
                style={{
                  padding: '12px 26px',
                  borderRadius: 14,
                  border: 'none',
                  background: '#111111',
                  color: '#DED8ED',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(17, 17, 17, 0.3)',
                  transition: 'all 0.15s ease',
                }}
              >
                Continue ➔
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleInitiatePayment}
                style={{
                  padding: '12px 28px',
                  borderRadius: 14,
                  border: 'none',
                  background: '#111111',
                  color: '#DED8ED',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(17, 17, 17, 0.3)',
                  transition: 'all 0.15s ease',
                }}
              >
                {loading ? 'Creating Order...' : `Proceed to Pay ${formatCurrency(premiums.total)} ➔`}
              </button>
            )}
          </div>
        )}

        {/* Wallet Topup Modal inside Checkout */}
        {showTopupModal && (
          <WalletTopupModal
            isOpen={showTopupModal}
            onClose={() => setShowTopupModal(false)}
            currentBalance={vaultBalance}
            userKey={uKey}
            onSuccess={(newBal) => {
              setVaultBalance(newBal);
              setShowTopupModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
