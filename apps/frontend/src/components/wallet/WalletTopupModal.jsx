import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShieldCheck, 
  QrCode, 
  CreditCard, 
  Landmark, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Shield, 
  Lock, 
  Smartphone,
  Sparkles,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { httpClient } from '../../api/httpClient';

export default function WalletTopupModal({ isOpen, onClose, currentBalance = 0, onSuccess, userKey = 'guest' }) {
  const [step, setStep] = useState(1); // 1: Amount, 2: Payment Method, 3: Processing, 4: Success
  const [amount, setAmount] = useState(2500);
  const [customAmount, setCustomAmount] = useState('2500');
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  
  // Card details
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('•••');
  const [cardName, setCardName] = useState('Hariharan M');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [txnId, setTxnId] = useState('');
  const [newBalance, setNewBalance] = useState(0);

  const quickAmounts = [500, 1000, 2500, 5000, 10000, 25000];

  const popularBanks = [
    { name: 'HDFC Bank', code: 'HDFC' },
    { name: 'ICICI Bank', code: 'ICICI' },
    { name: 'State Bank of India', code: 'SBI' },
    { name: 'Axis Bank', code: 'AXIS' },
    { name: 'Kotak Mahindra', code: 'KOTAK' },
    { name: 'Punjab National', code: 'PNB' },
  ];

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setAmount(2500);
      setCustomAmount('2500');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectQuickAmount = (val) => {
    setAmount(val);
    setCustomAmount(String(val));
    setError('');
  };

  const handleCustomAmountChange = (e) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
      setError('');
    }
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    const num = parseFloat(customAmount);
    if (isNaN(num) || num < 100) {
      setError('Minimum top-up amount is ₹100.');
      return;
    }
    if (num > 500000) {
      setError('Maximum single top-up limit is ₹5,00,000.');
      return;
    }
    setAmount(num);
    setError('');
    setStep(2);
  };

  const handleExecutePayment = async () => {
    setLoading(true);
    setError('');
    setStep(3);

    // Simulate 1.8s bank gateway processing
    await new Promise((r) => setTimeout(r, 1800));

    const generatedTxnId = `SYN-TXN-${Date.now().toString().slice(-8)}`;
    const calcNewBal = (parseFloat(currentBalance) || 0) + amount;
    
    // Save to local storage ledger
    const newTxn = {
      id: Date.now(),
      type: 'CREDIT',
      amount: amount,
      description: `Wallet Top-up (${paymentMethod === 'upi' ? 'UPI / QR' : (paymentMethod === 'card' ? 'Debit/Credit Card' : `NetBanking - ${selectedBank}`)})`,
      date: new Date().toISOString(),
      txn_id: generatedTxnId,
    };

    const existingTxns = JSON.parse(localStorage.getItem(`synova_wallet_txns_${userKey}`) || '[]');
    const updatedTxns = [newTxn, ...existingTxns];
    localStorage.setItem(`synova_wallet_txns_${userKey}`, JSON.stringify(updatedTxns));
    localStorage.setItem(`synova_wallet_balance_${userKey}`, calcNewBal);

    // Trigger backend add-funds endpoint
    try {
      await httpClient.post('/wallet/add-funds', { 
        amount: amount, 
        payment_method: paymentMethod === 'upi' ? 'UPI Instant' : (paymentMethod === 'card' ? 'Credit/Debit Card' : `Net Banking: ${selectedBank}`) 
      });
    } catch (err) { }

    setTxnId(generatedTxnId);
    setNewBalance(calcNewBal);
    setLoading(false);
    setStep(4);

    if (onSuccess) {
      onSuccess(calcNewBal, newTxn);
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(11, 31, 58, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 24,
          width: '100%',
          maxWidth: 520,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #111111 0%, #2A2A2A 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >
              <CreditCard size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em' }}>
                Add Money to Insurance Vault
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.85)', marginTop: 2 }}>
                Current Balance: <strong>₹{Number(currentBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>
          </div>

          {step !== 3 && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Step 1: Amount Selection */}
        {step === 1 && (
          <form onSubmit={handleProceedToPayment} style={{ padding: '24px' }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                Enter Top-up Amount
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#F8FAFC',
                  borderRadius: 14,
                  border: error ? '1.5px solid #EF4444' : '1.5px solid #CBD5E1',
                  padding: '4px 16px',
                }}
              >
                <span style={{ fontSize: 24, fontWeight: 900, color: '#111111', marginRight: 8 }}>₹</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  placeholder="Enter amount (min ₹100)"
                  min="100"
                  max="500000"
                  step="100"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    fontSize: 22,
                    fontWeight: 800,
                    color: '#111111',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                  }}
                />
              </div>
              {error && (
                <div style={{ color: '#DC2626', fontSize: 12, fontWeight: 600, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Quick Amounts */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Quick Selection
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {quickAmounts.map((q) => {
                  const isSelected = amount === q;
                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSelectQuickAmount(q)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 12,
                        border: isSelected ? '2px solid #1565C0' : '1px solid #E2E8F0',
                        background: isSelected ? '#EFF6FF' : '#FFFFFF',
                        color: isSelected ? '#1565C0' : '#1E293B',
                        fontSize: 14,
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      + ₹{q.toLocaleString('en-IN')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Breakdown */}
            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: 14, border: '1px solid #E2E8F0', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569', marginBottom: 8 }}>
                <span>Top-up Amount</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>₹{amount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569', marginBottom: 8 }}>
                <span>Gateway Convenience Fee</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>FREE (₹0)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #E2E8F0' }}>
                <span>GST (18%)</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>₹0.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 900, color: '#111111' }}>
                <span>Total Amount Payable</span>
                <span style={{ color: '#111111' }}>₹{amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn-pill-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: 15,
                fontWeight: 800,
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>Proceed to Payment</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* Step 2: Payment Method */}
        {step === 2 && (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#475569',
                  }}
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>Select Payment Method</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#111111' }}>
                ₹{amount.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                style={{
                  padding: '12px 8px',
                  borderRadius: 12,
                  border: paymentMethod === 'upi' ? '2px solid #1565C0' : '1px solid #E2E8F0',
                  background: paymentMethod === 'upi' ? '#EFF6FF' : '#FFFFFF',
                  color: paymentMethod === 'upi' ? '#1565C0' : '#475569',
                  fontSize: 12.5,
                  fontWeight: 800,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <QrCode size={20} />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                style={{
                  padding: '12px 8px',
                  borderRadius: 12,
                  border: paymentMethod === 'card' ? '2px solid #1565C0' : '1px solid #E2E8F0',
                  background: paymentMethod === 'card' ? '#EFF6FF' : '#FFFFFF',
                  color: paymentMethod === 'card' ? '#1565C0' : '#475569',
                  fontSize: 12.5,
                  fontWeight: 800,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <CreditCard size={20} />
                <span>Debit/Credit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                style={{
                  padding: '12px 8px',
                  borderRadius: 12,
                  border: paymentMethod === 'netbanking' ? '2px solid #1565C0' : '1px solid #E2E8F0',
                  background: paymentMethod === 'netbanking' ? '#EFF6FF' : '#FFFFFF',
                  color: paymentMethod === 'netbanking' ? '#1565C0' : '#475569',
                  fontSize: 12.5,
                  fontWeight: 800,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <Landmark size={20} />
                <span>NetBanking</span>
              </button>
            </div>

            {/* UPI Option */}
            {paymentMethod === 'upi' && (
              <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 16, border: '1px solid #E2E8F0', marginBottom: 20 }}>
                <div style={{ textAlign: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'inline-block', padding: 10, background: '#FFFFFF', borderRadius: 14, border: '1px solid #CBD5E1', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                    <svg width="140" height="140" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="#FFFFFF" />
                      {/* Outer Position Markers */}
                      <rect x="10" y="10" width="24" height="24" rx="4" fill="#0B1F3A" />
                      <rect x="14" y="14" width="16" height="16" rx="2" fill="#FFFFFF" />
                      <rect x="18" y="18" width="8" height="8" rx="1" fill="#1565C0" />

                      <rect x="66" y="10" width="24" height="24" rx="4" fill="#0B1F3A" />
                      <rect x="70" y="14" width="16" height="16" rx="2" fill="#FFFFFF" />
                      <rect x="74" y="18" width="8" height="8" rx="1" fill="#1565C0" />

                      <rect x="10" y="66" width="24" height="24" rx="4" fill="#0B1F3A" />
                      <rect x="14" y="70" width="16" height="16" rx="2" fill="#FFFFFF" />
                      <rect x="18" y="74" width="8" height="8" rx="1" fill="#1565C0" />

                      {/* Random Matrix Modules */}
                      <rect x="42" y="12" width="6" height="6" fill="#0B1F3A" />
                      <rect x="52" y="18" width="6" height="6" fill="#1565C0" />
                      <rect x="40" y="30" width="6" height="6" fill="#0B1F3A" />
                      <rect x="54" y="32" width="6" height="6" fill="#0B1F3A" />
                      <rect x="12" y="44" width="6" height="6" fill="#1565C0" />
                      <rect x="24" y="52" width="6" height="6" fill="#0B1F3A" />
                      <rect x="44" y="48" width="12" height="12" rx="2" fill="#1565C0" />
                      <rect x="68" y="42" width="6" height="6" fill="#0B1F3A" />
                      <rect x="80" y="50" width="6" height="6" fill="#1565C0" />
                      <rect x="42" y="70" width="6" height="6" fill="#0B1F3A" />
                      <rect x="54" y="76" width="6" height="6" fill="#1565C0" />
                      <rect x="70" y="72" width="6" height="6" fill="#0B1F3A" />
                      <rect x="82" y="82" width="6" height="6" fill="#1565C0" />
                    </svg>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 8, fontWeight: 600 }}>
                    Scan with Google Pay, PhonePe, Paytm or any UPI App
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0', color: '#94A3B8', fontSize: 12, fontWeight: 700 }}>
                  <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
                  <span>OR PAY VIA UPI ID</span>
                  <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
                </div>

                <input
                  type="text"
                  placeholder="e.g. yourname@okhdfcbank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', padding: '10px 14px', fontSize: 13 }}
                />
              </div>
            )}

            {/* Card Option */}
            {paymentMethod === 'card' && (
              <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 16, border: '1px solid #E2E8F0', marginBottom: 20 }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '10px 12px', fontSize: 13, letterSpacing: '0.05em' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Valid Thru (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="input-field"
                      style={{ width: '100%', padding: '10px 12px', fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      CVV
                    </label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      maxLength={4}
                      className="input-field"
                      style={{ width: '100%', padding: '10px 12px', fontSize: 13 }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Name on Card
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '10px 12px', fontSize: 13 }}
                  />
                </div>
              </div>
            )}

            {/* NetBanking Option */}
            {paymentMethod === 'netbanking' && (
              <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 16, border: '1px solid #E2E8F0', marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 10 }}>
                  Select Your Bank
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {popularBanks.map((b) => (
                    <button
                      key={b.code}
                      type="button"
                      onClick={() => setSelectedBank(b.name)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: selectedBank === b.name ? '2px solid #1565C0' : '1px solid #CBD5E1',
                        background: selectedBank === b.name ? '#EFF6FF' : '#FFFFFF',
                        color: selectedBank === b.name ? '#1565C0' : '#1E293B',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Security Guarantee */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: '#64748B', marginBottom: 18 }}>
              <Lock size={14} color="#059669" />
              <span>256-bit Bank Grade SSL Encryption • RBI Compliant</span>
            </div>

            <button
              type="button"
              onClick={handleExecutePayment}
              disabled={loading}
              className="btn-pill-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: 15,
                fontWeight: 800,
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>Pay ₹{amount.toLocaleString('en-IN')} Securely</span>
              <Lock size={16} />
            </button>
          </div>
        )}

        {/* Step 3: Gateway Processing */}
        {step === 3 && (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                border: '4px solid #E2E8F0',
                borderTopColor: '#1565C0',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 24px',
              }}
            />
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111111', margin: '0 0 8px' }}>
              Authorizing Payment...
            </h3>
            <p style={{ fontSize: 14, color: '#64748B', maxWidth: 360, margin: '0 auto', lineHeight: 1.5 }}>
              Connecting to secure banking gateway. Please do not close or refresh this window.
            </p>
          </div>
        )}

        {/* Step 4: Success Confirmation */}
        {step === 4 && (
          <div style={{ padding: '36px 24px', textAlign: 'center' }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: '#ECFDF5',
                border: '2px solid #A7F3D0',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                boxShadow: '0 8px 24px rgba(5, 150, 105, 0.2)',
              }}
            >
              <Check size={36} strokeWidth={3} />
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 900, color: '#111111', margin: '0 0 6px' }}>
              Funds Added Successfully!
            </h3>
            <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 24px' }}>
              ₹{amount.toLocaleString('en-IN')} has been credited to your Insurance Vault wallet.
            </p>

            {/* Receipt Box */}
            <div
              style={{
                background: '#F8FAFC',
                borderRadius: 16,
                border: '1px solid #E2E8F0',
                padding: 18,
                textAlign: 'left',
                marginBottom: 24,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#64748B', marginBottom: 8 }}>
                <span>Transaction Ref ID</span>
                <span style={{ fontWeight: 700, color: '#111111' }}>{txnId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#64748B', marginBottom: 8 }}>
                <span>Payment Mode</span>
                <span style={{ fontWeight: 700, color: '#111111' }}>
                  {paymentMethod === 'upi' ? 'UPI Instant Transfer' : (paymentMethod === 'card' ? 'Debit/Credit Card' : `NetBanking (${selectedBank})`)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#64748B', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #E2E8F0' }}>
                <span>Amount Paid</span>
                <span style={{ fontWeight: 800, color: '#059669' }}>+ ₹{amount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 900, color: '#111111' }}>
                <span>Updated Vault Balance</span>
                <span style={{ color: '#111111' }}>₹{newBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-pill-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: 14.5,
                fontWeight: 800,
                borderRadius: 14,
              }}
            >
              Done & Return to App
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
