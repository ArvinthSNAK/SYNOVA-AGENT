import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { httpClient } from '../../api/httpClient';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [walletBalance, setWalletBalance] = useState(25000);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupSuccessMsg, setTopupSuccessMsg] = useState('');

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [modalStep, setModalStep] = useState('details'); // 'details' | 'payment' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('vault');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [customerVehicle, setCustomerVehicle] = useState('KA-01-MJ-8821');
  const [issuedPolicy, setIssuedPolicy] = useState(null);

  const walletRef = useRef(null);
  const notifRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const fetchWallet = async () => {
    const uKey = getUserNotifKey();
    const storedBal = localStorage.getItem(`synova_wallet_balance_${uKey}`);
    const storedTxns = JSON.parse(localStorage.getItem(`synova_wallet_txns_${uKey}`) || '[]');

    let bal = storedBal !== null ? parseFloat(storedBal) : 25000;
    if (storedBal === null) {
      localStorage.setItem(`synova_wallet_balance_${uKey}`, bal);
    }

    try {
      if (user && user.id) {
        const res = await httpClient.get('/wallet/me');
        if (res.data && typeof res.data.balance === 'number') {
          bal = res.data.balance;
          localStorage.setItem(`synova_wallet_balance_${uKey}`, bal);
        }
      }
    } catch (e) { }

    setWalletBalance(bal);
    setWalletTransactions(storedTxns);
  };

  const getUserNotifKey = () => {
    if (user?.id) return `user_${user.id}`;
    if (user?.email) return `user_${user.email}`;
    return 'guest';
  };

  const fetchNotifications = async () => {
    const uKey = getUserNotifKey();
    const storedReadIds = JSON.parse(localStorage.getItem(`synova_read_notifs_${uKey}`) || '[]');
    const storedClearedIds = JSON.parse(localStorage.getItem(`synova_cleared_notifs_${uKey}`) || '[]');

    const endpoints = [
      'http://127.0.0.1:9001/api/notifications',
      'http://127.0.0.1:9002/api/notifications',
      'http://127.0.0.1:9003/api/notifications',
      'http://127.0.0.1:9004/api/notifications',
    ];

    let mockNotifs = [];
    try {
      const results = await Promise.allSettled(
        endpoints.map((url) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1500);
          return fetch(url, { signal: controller.signal })
            .then((r) => {
              clearTimeout(timeoutId);
              return r.ok ? r.json() : [];
            })
            .catch(() => {
              clearTimeout(timeoutId);
              return [];
            });
        })
      );

      for (const res of results) {
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          mockNotifs.push(...res.value);
        }
      }
    } catch (e) { }

    let serverNotifs = [];
    try {
      const res = await httpClient.get('/notifications');
      if (Array.isArray(res.data)) serverNotifs = res.data;
    } catch (e) { }

    const combined = [...mockNotifs, ...serverNotifs];
    const unique = [];
    const seen = new Set();

    for (const n of combined) {
      const k = String(n.id || (n.title + (n.created_at || '')));
      if (k && !seen.has(k)) {
        seen.add(k);
        const isCleared = storedClearedIds.includes(k) || storedClearedIds.includes(String(n.id));
        if (isCleared) continue;

        const isRead = storedReadIds.includes(k) || storedReadIds.includes(String(n.id)) || n.status === 'read';
        unique.push({
          ...n,
          status: isRead ? 'read' : 'unread',
        });
      }
    }

    setNotifications(unique);
    setUnreadCount(unique.filter((n) => n.status !== 'read').length);
  };

  useEffect(() => {
    fetchWallet();
    fetchNotifications();

    const handleNotifEvent = () => fetchNotifications();
    window.addEventListener('synova_notification_created', handleNotifEvent);
    window.addEventListener('storage', handleNotifEvent);

    const interval = setInterval(() => {
      fetchWallet();
      fetchNotifications();
    }, 2500);

    return () => {
      window.removeEventListener('synova_notification_created', handleNotifEvent);
      window.removeEventListener('storage', handleNotifEvent);
      clearInterval(interval);
    };
  }, [user]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (walletRef.current && !walletRef.current.contains(event.target)) {
        setShowWalletDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTopup = async (e) => {
    e.preventDefault();
    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt <= 0) return;
    setTopupLoading(true);
    setTopupSuccessMsg('');
    const uKey = getUserNotifKey();

    const newBal = (parseFloat(walletBalance) || 0) + amt;
    setWalletBalance(newBal);
    localStorage.setItem(`synova_wallet_balance_${uKey}`, newBal);

    const newTxn = {
      id: Date.now(),
      type: 'CREDIT',
      amount: amt,
      description: 'Instant Top-up (UPI / Card)',
      date: new Date().toISOString(),
    };
    const existingTxns = JSON.parse(localStorage.getItem(`synova_wallet_txns_${uKey}`) || '[]');
    const updatedTxns = [newTxn, ...existingTxns];
    localStorage.setItem(`synova_wallet_txns_${uKey}`, JSON.stringify(updatedTxns));
    setWalletTransactions(updatedTxns);

    try {
      await httpClient.post('/wallet/add-funds', { amount: amt, payment_method: 'Instant UPI / Card' });
    } catch (err) { }

    setTopupAmount('');
    setTopupSuccessMsg(`✓ Added ₹${amt.toLocaleString('en-IN')} to vault balance!`);
    setTimeout(() => setTopupSuccessMsg(''), 3000);
    setTopupLoading(false);
  };

  const markAllRead = async () => {
    const uKey = getUserNotifKey();
    const allKeys = notifications.map((n) => String(n.id || (n.title + (n.created_at || ''))));
    const existing = JSON.parse(localStorage.getItem(`synova_read_notifs_${uKey}`) || '[]');
    const merged = Array.from(new Set([...existing, ...allKeys]));
    localStorage.setItem(`synova_read_notifs_${uKey}`, JSON.stringify(merged));

    setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
    setUnreadCount(0);

    try {
      await httpClient.post('/notifications/mark-all-read');
    } catch (e) { }
  };

  const clearAllNotifications = () => {
    const uKey = getUserNotifKey();
    const allKeys = notifications.map((n) => String(n.id || (n.title + (n.created_at || ''))));
    const existingCleared = JSON.parse(localStorage.getItem(`synova_cleared_notifs_${uKey}`) || '[]');
    const merged = Array.from(new Set([...existingCleared, ...allKeys]));
    localStorage.setItem(`synova_cleared_notifs_${uKey}`, JSON.stringify(merged));

    setNotifications([]);
    setUnreadCount(0);
  };

  const clearNotification = (idOrKey) => {
    const uKey = getUserNotifKey();
    const existingCleared = JSON.parse(localStorage.getItem(`synova_cleared_notifs_${uKey}`) || '[]');
    const merged = Array.from(new Set([...existingCleared, String(idOrKey)]));
    localStorage.setItem(`synova_cleared_notifs_${uKey}`, JSON.stringify(merged));

    const updated = notifications.filter((n) => String(n.id || (n.title + (n.created_at || ''))) !== String(idOrKey));
    setNotifications(updated);
    setUnreadCount(updated.filter((n) => n.status !== 'read').length);
  };

  const handleMockPayment = async (e) => {
    if (e) e.preventDefault();
    const uKey = getUserNotifKey();
    const totalAmount = 5780;

    // Check for insufficient balance when using Vault Balance
    if (paymentMethod === 'vault' && walletBalance < totalAmount) {
      alert(`⚠️ Insufficient Vault Balance!\n\nYour available balance is ₹${walletBalance.toLocaleString('en-IN')}, but ₹${totalAmount.toLocaleString('en-IN')} is required.\n\nPlease top-up your wallet or select UPI/Card payment.`);
      return;
    }

    setPaymentLoading(true);

    const policyNum = `SYN-POL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const planTitle = selectedQuote?.product_name || selectedQuote?.title?.replace('New Policy Alert: ', '') || 'Comprehensive Motor Shield';
    const insName = selectedQuote?.insurer_name || 'ICICI Lombard General';

    const newPol = {
      id: Date.now(),
      policy_number: policyNum,
      policy_type: planTitle,
      product_name: planTitle,
      plan_name: planTitle,
      insurer_name: insName,
      insurer: insName,
      status: 'active',
      premium: totalAmount,
      premium_amount: totalAmount,
      coverage_amount: 720000,
      idv: 720000,
      idv_amount: 720000,
      vehicle_registration: customerVehicle || 'KA-01-MJ-8821',
      vehicle_number: customerVehicle || 'KA-01-MJ-8821',
      ncb_percent: 20,
      start_date: new Date().toISOString().substring(0, 10),
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      created_at: new Date().toISOString(),
      payment_method: paymentMethod === 'vault' ? 'Synova Vault Balance' : (paymentMethod === 'upi' ? 'UPI Instant' : 'Credit / Debit Card'),
    };

    // Simulate gateway payment processing
    await new Promise((r) => setTimeout(r, 1000));

    // Deduct from wallet if paid via Vault
    if (paymentMethod === 'vault') {
      const newBal = Math.max(0, walletBalance - totalAmount);
      setWalletBalance(newBal);
      localStorage.setItem(`synova_wallet_balance_${uKey}`, newBal);

      const debitTxn = {
        id: Date.now(),
        type: 'DEBIT',
        amount: totalAmount,
        description: `Policy Purchase: ${policyNum} (${planTitle})`,
        date: new Date().toISOString(),
      };
      const existingTxns = JSON.parse(localStorage.getItem(`synova_wallet_txns_${uKey}`) || '[]');
      const updatedTxns = [debitTxn, ...existingTxns];
      localStorage.setItem(`synova_wallet_txns_${uKey}`, JSON.stringify(updatedTxns));
      setWalletTransactions(updatedTxns);

      try {
        await httpClient.post('/wallet/debit', { amount: totalAmount, reason: `Policy Premium: ${policyNum}` });
      } catch (err) { }
    }

    // Save to user's Insurance Vault across all user keys
    const keysToSave = [
      `synova_vault_policies_${uKey}`,
      `synova_vault_policies_user_${uKey}`,
      user?.id ? `synova_vault_policies_${user.id}` : null,
      user?.id ? `synova_vault_policies_user_${user.id}` : null,
      user?.email ? `synova_vault_policies_${user.email}` : null,
      user?.email ? `synova_vault_policies_user_${user.email}` : null,
      'synova_vault_policies_guest',
    ].filter(Boolean);

    for (const k of keysToSave) {
      try {
        const existing = JSON.parse(localStorage.getItem(k) || '[]');
        const filtered = existing.filter((p) => p.policy_number !== policyNum);
        localStorage.setItem(k, JSON.stringify([newPol, ...filtered]));
      } catch (err) { }
    }

    try {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('synova_policy_purchased'));
    } catch (err) { }

    // Also attempt backend policy creation if logged in
    if (user && user.id) {
      try {
        await httpClient.post('/policies/', {
          customer_id: user.id,
          policy_number: policyNum,
          policy_type: 'MOTOR',
          plan_name: planTitle,
          insurer: insName,
          premium_amount: totalAmount,
          idv_amount: 720000,
          vehicle_number: customerVehicle || 'KA-01-MJ-8821',
        });
      } catch (err) { }
    }

    setIssuedPolicy(newPol);
    setPaymentLoading(false);
    setModalStep('success');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleNavTo = (sectionId) => {
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(11, 31, 58, 0.08)',
        height: 76,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="page-container"
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Left: Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #0B1F3A 0%, #1565C0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(11, 31, 58, 0.15)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'var(--primary-navy)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              SYNOVA
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ai-accent)', display: 'inline-block' }}></span>
            </span>
          </div>
        </Link>

        {/* Center: Minimal Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <button
            type="button"
            onClick={() => handleNavTo('insurance-overview')}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-body)',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 0.2s ease',
            }}
          >
            Insurance
          </button>
          <button
            type="button"
            onClick={() => handleNavTo('how-it-works')}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-body)',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 0.2s ease',
            }}
          >
            How It Works
          </button>
          <Link
            to="/new-insurance"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: (isActive('/new-insurance') || isActive('/compare')) ? 'var(--blue-primary)' : 'var(--text-body)',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
          >
            Compare
          </Link>
          <Link
            to="/renew-insurance"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: (isActive('/renew-insurance') || isActive('/renewals')) ? 'var(--blue-primary)' : 'var(--text-body)',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
          >
            Renewals
          </Link>
          <Link
            to="/insurance-vault"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: (isActive('/insurance-vault') || isActive('/vault') || isActive('/claims')) ? 'var(--blue-primary)' : 'var(--text-body)',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
          >
            Claims & Vault
          </Link>
          <Link
            to="/ai-agent"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: isActive('/ai-agent') ? 'var(--ai-accent)' : 'var(--text-body)',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
          >
            SYNOVA AI
          </Link>
          <button
            type="button"
            onClick={() => handleNavTo('about')}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-body)',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 0.2s ease',
            }}
          >
            About Us
          </button>
        </nav>

        {/* Right: Actions / Auth Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {user ? (
            <>
              {/* Wallet Pill Button */}
              <div style={{ position: 'relative' }} ref={walletRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowWalletDropdown(!showWalletDropdown);
                    setShowNotifDropdown(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--bg-tinted)',
                    border: '1px solid rgba(21, 101, 192, 0.18)',
                    borderRadius: 9999,
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--blue-primary)',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="6" y1="12" x2="10" y2="12" />
                  </svg>
                  <span>₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                </button>

                {/* Wallet Dropdown */}
                {showWalletDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      width: 320,
                      background: '#FFFFFF',
                      border: '1px solid rgba(11, 31, 58, 0.12)',
                      borderRadius: 18,
                      boxShadow: '0 20px 50px rgba(11, 31, 58, 0.15)',
                      padding: 20,
                      zIndex: 1000,
                    }}
                  >
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Available Vault Balance</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)', marginBottom: 16 }}>
                      ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>

                    <form onSubmit={handleTopup} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      <input
                        type="number"
                        placeholder="Amount (₹)"
                        className="input-field"
                        style={{ padding: '8px 12px', fontSize: 13 }}
                        value={topupAmount}
                        onChange={(e) => setTopupAmount(e.target.value)}
                        min="100"
                        step="100"
                        required
                      />
                      <button type="submit" className="btn-pill-primary" style={{ padding: '8px 16px', fontSize: 13 }} disabled={topupLoading}>
                        {topupLoading ? 'Adding...' : 'Top-up'}
                      </button>
                    </form>

                    {topupSuccessMsg && (
                      <div style={{ fontSize: 12, color: 'var(--status-emerald)', fontWeight: 600, marginTop: 6 }}>
                        {topupSuccessMsg}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <div style={{ position: 'relative' }} ref={notifRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifDropdown(!showNotifDropdown);
                    setShowWalletDropdown(false);
                    if (!showNotifDropdown) markAllRead();
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    border: '1px solid rgba(11, 31, 58, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-navy)" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -3,
                        right: -3,
                        minWidth: 18,
                        height: 18,
                        borderRadius: 9999,
                        background: 'var(--status-rose)',
                        color: '#FFFFFF',
                        fontSize: 10.5,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px',
                        border: '2px solid #FFFFFF',
                        boxShadow: '0 2px 6px rgba(225, 29, 72, 0.4)',
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      width: 360,
                      maxHeight: 440,
                      background: '#FFFFFF',
                      border: '1px solid rgba(11, 31, 58, 0.12)',
                      borderRadius: 18,
                      boxShadow: '0 20px 50px rgba(11, 31, 58, 0.15)',
                      padding: 18,
                      zIndex: 1000,
                      overflowY: 'auto',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary-navy)' }}>
                        Live Policy & Insurer Alerts
                      </div>
                      {notifications.length > 0 && (
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <button
                            onClick={markAllRead}
                            style={{ background: 'none', border: 'none', fontSize: 11.5, color: 'var(--blue-primary)', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Mark all read
                          </button>
                          <span style={{ color: '#CBD5E1', fontSize: 12 }}>•</span>
                          <button
                            onClick={clearAllNotifications}
                            style={{ background: 'none', border: 'none', fontSize: 11.5, color: 'var(--status-rose)', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Clear all
                          </button>
                        </div>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '32px 0', textAlign: 'center' }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>🔕</div>
                        <strong>No notifications</strong>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>You're all caught up with policy updates.</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {notifications.slice(0, 8).map((n) => {
                          const itemKey = String(n.id || (n.title + (n.created_at || '')));
                          return (
                            <div
                              key={itemKey}
                              style={{
                                padding: 12,
                                borderRadius: 12,
                                background: n.status === 'unread' ? 'var(--bg-tinted)' : '#F8FAFD',
                                border: n.status === 'unread' ? '1px solid rgba(21, 101, 192, 0.2)' : '1px solid rgba(11, 31, 58, 0.05)',
                                fontSize: 12.5,
                                position: 'relative',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                <strong style={{ color: 'var(--primary-navy)', fontSize: 13, paddingRight: 18 }}>{n.title || 'Policy Alert'}</strong>
                                <button
                                  onClick={() => clearNotification(itemKey)}
                                  title="Dismiss notification"
                                  style={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    padding: '0 4px',
                                    lineHeight: 1,
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                              <div style={{ color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 6 }}>{n.message}</div>
                              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {n.insurer_name && (
                                    <span className="badge badge-ai" style={{ fontSize: 9.5, padding: '2px 6px' }}>{n.insurer_name}</span>
                                  )}
                                  <span>{n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedQuote(n);
                                    setShowNotifDropdown(false);
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--blue-primary)',
                                    fontWeight: 700,
                                    fontSize: 11.5,
                                    cursor: 'pointer',
                                    padding: '2px 6px',
                                    borderRadius: 6,
                                  }}
                                >
                                  View Quote Details →
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Admin Link if role === 'admin' */}
              {user.role === 'admin' && (
                <Link to="/admin" className="btn-pill-secondary" style={{ padding: '8px 16px', fontSize: 12.5 }}>
                  Admin
                </Link>
              )}

              {/* User Avatar with initials and Logout */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: 'var(--primary-navy)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                  title={user.email}
                >
                  {getInitials(user.full_name || user.email)}
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  Log out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--primary-navy)',
                  padding: '8px 16px',
                  textDecoration: 'none',
                }}
              >
                Sign In
              </Link>
              <Link to="/signup" className="btn-pill-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Interactive Policy Quote Details & Mock Checkout Modal (Rendered to Body) */}
      {selectedQuote && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(11, 31, 58, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: 20,
            overflowY: 'auto',
          }}
          onClick={() => {
            setSelectedQuote(null);
            setModalStep('details');
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              maxWidth: 580,
              width: '100%',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              overflow: 'hidden',
              margin: 'auto',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, var(--primary-navy) 0%, #1565C0 100%)',
                color: '#FFFFFF',
                padding: '24px 28px',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}>
                      {selectedQuote.insurer_name || 'Verified Underwriter'}
                    </span>
                    <span style={{ background: '#10B981', color: '#FFFFFF', padding: '3px 8px', borderRadius: 9999, fontSize: 10, fontWeight: 800 }}>
                      ⚡ LIVE GATEWAY
                    </span>
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                    {modalStep === 'details' && (selectedQuote.title?.replace('New Policy Alert: ', '') || selectedQuote.title || 'Comprehensive Motor Shield')}
                    {modalStep === 'payment' && 'Secure Mock Payment & Checkout'}
                    {modalStep === 'success' && 'Policy Successfully Issued!'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setSelectedQuote(null);
                    setModalStep('details');
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: 'none',
                    color: '#FFFFFF',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    fontSize: 16,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body with 3 Steps */}
            <div style={{ padding: '24px 28px', overflowY: 'auto' }}>
              {/* STEP 1: QUOTE DETAILS */}
              {modalStep === 'details' && (
                <div>
                  {/* Description highlights */}
                  <div style={{ background: 'var(--bg-tinted)', borderRadius: 16, padding: '16px 20px', marginBottom: 20, border: '1px solid rgba(21, 101, 192, 0.1)' }}>
                    <div style={{ fontSize: 13, color: 'var(--primary-navy)', lineHeight: 1.6, fontWeight: 500 }}>
                      {selectedQuote.message}
                    </div>
                  </div>

                  {/* Underwriting Metrics Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                    <div style={{ padding: 14, borderRadius: 14, background: '#F8FAFD', border: '1px solid rgba(11, 31, 58, 0.06)' }}>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Underwriting Partner</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary-navy)', marginTop: 4 }}>
                        {selectedQuote.insurer_name || 'Mock Insurer Gateway'}
                      </div>
                    </div>
                    <div style={{ padding: 14, borderRadius: 14, background: '#F8FAFD', border: '1px solid rgba(11, 31, 58, 0.06)' }}>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Instant Premium Quote</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--blue-primary)', marginTop: 4 }}>
                        ₹5,780 <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>/ yr (incl. GST)</span>
                      </div>
                    </div>
                  </div>

                  {/* Included Protections */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                      Standard Included Protections:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: 12.5, color: 'var(--primary-navy)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: 'var(--status-emerald)', fontWeight: 800 }}>✓</span> 100% Cashless Garages
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: 'var(--status-emerald)', fontWeight: 800 }}>✓</span> Zero Depreciation Cover
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: 'var(--status-emerald)', fontWeight: 800 }}>✓</span> 24/7 Roadside Assistance
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: 'var(--status-emerald)', fontWeight: 800 }}>✓</span> Instant Digital Vault Policy
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-pill-secondary"
                      onClick={() => setSelectedQuote(null)}
                      style={{ padding: '10px 20px', fontSize: 13 }}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn-pill-primary"
                      onClick={() => setModalStep('payment')}
                      style={{ padding: '10px 24px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <span>Proceed to Pay (₹5,780)</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: MOCK PAYMENT AREA */}
              {modalStep === 'payment' && (
                <form onSubmit={handleMockPayment}>
                  {/* Order Summary Box */}
                  <div style={{ background: '#F8FAFD', borderRadius: 16, padding: '16px 20px', marginBottom: 18, border: '1px solid rgba(11, 31, 58, 0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                      <span>Base OD Premium</span>
                      <span>₹4,899</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
                      <span>GST (18%)</span>
                      <span>₹881</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: 'var(--primary-navy)', borderTop: '1px solid #E2E8F0', paddingTop: 10 }}>
                      <span>Total Payable</span>
                      <span style={{ color: 'var(--blue-primary)' }}>₹5,780</span>
                    </div>
                  </div>

                  {/* Vehicle Reg Input */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 6 }}>
                      Vehicle Registration Number
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ padding: '10px 14px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}
                      value={customerVehicle}
                      onChange={(e) => setCustomerVehicle(e.target.value.toUpperCase())}
                      placeholder="e.g. KA-01-MJ-8821"
                      required
                    />
                  </div>

                  {/* Payment Method Selector */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 8 }}>
                      Select Mock Payment Method
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: 12,
                          border: paymentMethod === 'vault' ? '2px solid var(--blue-primary)' : '1px solid #E2E8F0',
                          background: paymentMethod === 'vault' ? 'var(--bg-tinted)' : '#FFFFFF',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === 'vault'}
                            onChange={() => setPaymentMethod('vault')}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary-navy)' }}>⚡ Synova Vault Balance</div>
                            <div style={{ fontSize: 11, color: walletBalance < 5780 ? 'var(--status-rose)' : 'var(--text-muted)', fontWeight: walletBalance < 5780 ? 700 : 500 }}>
                              Available Balance: ₹{walletBalance.toLocaleString('en-IN')} {walletBalance < 5780 && '(Low Balance)'}
                            </div>
                          </div>
                        </div>
                        <span style={{ background: walletBalance >= 5780 ? '#DCFCE7' : '#FEE2E2', color: walletBalance >= 5780 ? '#166534' : '#991B1B', padding: '2px 8px', borderRadius: 9999, fontSize: 10.5, fontWeight: 800 }}>
                          {walletBalance >= 5780 ? '1-CLICK INSTANT' : 'INSUFFICIENT'}
                        </span>
                      </label>

                      {/* Insufficient Balance Alert */}
                      {paymentMethod === 'vault' && walletBalance < 5780 && (
                        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                          <div>
                            <div style={{ color: '#991B1B', fontSize: 12.5, fontWeight: 700 }}>
                              ⚠️ Insufficient Vault Balance
                            </div>
                            <div style={{ color: '#7F1D1D', fontSize: 11.5, marginTop: 2 }}>
                              Need ₹5,780, but available balance is ₹{walletBalance.toLocaleString('en-IN')}.
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const uKey = getUserNotifKey();
                              const newBal = (parseFloat(walletBalance) || 0) + 10000;
                              setWalletBalance(newBal);
                              localStorage.setItem(`synova_wallet_balance_${uKey}`, newBal);
                              const newTxn = {
                                id: Date.now(),
                                type: 'CREDIT',
                                amount: 10000,
                                description: 'Quick Top-up for Policy Checkout',
                                date: new Date().toISOString(),
                              };
                              const existingTxns = JSON.parse(localStorage.getItem(`synova_wallet_txns_${uKey}`) || '[]');
                              localStorage.setItem(`synova_wallet_txns_${uKey}`, JSON.stringify([newTxn, ...existingTxns]));
                              setWalletTransactions([newTxn, ...existingTxns]);
                            }}
                            style={{ background: '#DC2626', color: '#FFF', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            + Add ₹10,000
                          </button>
                        </div>
                      )}

                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '12px 16px',
                          borderRadius: 12,
                          border: paymentMethod === 'upi' ? '2px solid var(--blue-primary)' : '1px solid #E2E8F0',
                          background: paymentMethod === 'upi' ? 'var(--bg-tinted)' : '#FFFFFF',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'upi'}
                          onChange={() => setPaymentMethod('upi')}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary-navy)' }}>📱 Instant UPI / QR Payment</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Google Pay, PhonePe, Paytm, BHIM</div>
                        </div>
                      </label>

                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '12px 16px',
                          borderRadius: 12,
                          border: paymentMethod === 'card' ? '2px solid var(--blue-primary)' : '1px solid #E2E8F0',
                          background: paymentMethod === 'card' ? 'var(--bg-tinted)' : '#FFFFFF',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary-navy)' }}>💳 Credit / Debit Card</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Visa, MasterCard, RuPay (Sandbox)</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Sandbox Banner */}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 20, textAlign: 'center' }}>
                    🔒 Sandbox Mock Payment Gateway • Instant Policy Issuance
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-pill-secondary"
                      onClick={() => setModalStep('details')}
                      disabled={paymentLoading}
                      style={{ padding: '10px 20px', fontSize: 13 }}
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="btn-pill-primary"
                      disabled={paymentLoading || (paymentMethod === 'vault' && walletBalance < 5780)}
                      style={{
                        padding: '10px 24px',
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        opacity: (paymentMethod === 'vault' && walletBalance < 5780) ? 0.6 : 1,
                        cursor: (paymentMethod === 'vault' && walletBalance < 5780) ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {paymentLoading ? (
                        <>
                          <span className="spinner-border" style={{ width: 14, height: 14, border: '2px solid #FFF', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                          <span>Processing Payment...</span>
                        </>
                      ) : (paymentMethod === 'vault' && walletBalance < 5780) ? (
                        <span>⚠️ Insufficient Balance</span>
                      ) : (
                        <span>Pay ₹5,780 & Issue Policy →</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: PAYMENT SUCCESS & POLICY ISSUED */}
              {modalStep === 'success' && issuedPolicy && (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    ✓
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary-navy)', margin: '0 0 6px 0' }}>
                    Payment Successful!
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
                    Your policy has been underwritten and deposited into your Insurance Vault.
                  </p>

                  {/* Digital Policy Card Receipt */}
                  <div style={{ background: '#F8FAFD', borderRadius: 16, padding: '18px 20px', textAlign: 'left', border: '1px solid rgba(11, 31, 58, 0.08)', marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Policy Number:</span>
                      <strong style={{ fontSize: 13, color: 'var(--primary-navy)', letterSpacing: '0.5px' }}>{issuedPolicy.policy_number}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Underwriter:</span>
                      <strong style={{ fontSize: 13, color: 'var(--primary-navy)' }}>{issuedPolicy.insurer_name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Vehicle Registered:</span>
                      <strong style={{ fontSize: 13, color: 'var(--primary-navy)' }}>{issuedPolicy.vehicle_number}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Amount Paid:</span>
                      <strong style={{ fontSize: 13, color: 'var(--status-emerald)' }}>₹5,780 (Paid via {issuedPolicy.payment_method})</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Policy Term:</span>
                      <strong style={{ fontSize: 13, color: 'var(--primary-navy)' }}>1 Year (Active till Aug 2027)</strong>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="btn-pill-secondary"
                      onClick={() => {
                        setSelectedQuote(null);
                        setModalStep('details');
                      }}
                      style={{ padding: '10px 20px', fontSize: 13 }}
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      className="btn-pill-primary"
                      onClick={() => {
                        setSelectedQuote(null);
                        setModalStep('details');
                        navigate('/vault');
                      }}
                      style={{ padding: '10px 24px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <span>Go to Insurance Vault 🛡️</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
