import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { httpClient } from '../api/httpClient';
import InsurerMarquee from '../components/common/InsurerMarquee';
import CityHeroAnimation from '../components/common/CityHeroAnimation';

export default function LandingPage() {
  const navigate = useNavigate();
  const [quickReg, setQuickReg] = useState('');
  const [metrics, setMetrics] = useState({
    total_policies: 142,
    active_policies: 128,
    gross_written_premium: 3240500,
    settlement_rate: 98.6,
  });

  useEffect(() => {
    httpClient.get('/admin/metrics')
      .then((res) => {
        if (res.data && res.data.total_policies) {
          setMetrics(res.data);
        }
      })
      .catch(() => { });

    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickReg.trim()) {
      navigate(`/new-insurance?reg=${encodeURIComponent(quickReg.trim().toUpperCase())}`);
    } else {
      navigate('/new-insurance');
    }
  };

  return (
    <div style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* 0. SCROLL-DRIVEN ISOMETRIC CITY HERO ANIMATION */}
      <CityHeroAnimation />

      {/* 1. HERO SECTION */}
      <section className="page-container" style={{ marginBottom: 64 }}>
        <div className="hero-rounded-container">
          {/* Subtle Radial Glow */}
          <div
            style={{
              position: 'absolute',
              top: -80,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 600,
              height: 300,
              background: 'radial-gradient(ellipse at center, rgba(139, 127, 168, 0.12) 0%, rgba(28, 28, 28, 0.05) 50%, transparent 80%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 880, margin: '0 auto' }}>
            {/* Pill Tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#FFFFFF',
                border: '1px solid rgba(28, 28, 28, 0.18)',
                padding: '6px 18px',
                borderRadius: 9999,
                marginBottom: 24,
                boxShadow: '0 2px 10px rgba(28, 28, 28, 0.04)',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ai-accent)' }}></span>
              <span style={{ color: 'var(--blue-primary)', fontSize: 13, fontWeight: 700, letterSpacing: '0.02em' }}>
                Autonomous AI Insurance Platform
              </span>
            </div>

            {/* Editorial Main Headline */}
            <h1
              style={{
                fontSize: 'clamp(40px, 5.8vw, 76px)',
                lineHeight: 1.02,
                fontWeight: 800,
                color: 'var(--primary-navy)',
                letterSpacing: '-0.035em',
                marginBottom: 20,
              }}
            >
              Insurance, <span className="gradient-text">intelligently handled.</span>
            </h1>

            {/* Secondary Headline */}
            <h2
              style={{
                fontSize: 'clamp(18px, 2.4vw, 24px)',
                fontWeight: 600,
                color: 'var(--dark-blue)',
                letterSpacing: '-0.015em',
                marginBottom: 16,
              }}
            >
              Compare policies. Automate quotes. Protect what matters.
            </h2>

            {/* Supporting Paragraph */}
            <p
              style={{
                fontSize: 'clamp(15px, 1.8vw, 17px)',
                color: 'var(--text-muted)',
                lineHeight: 1.65,
                maxWidth: 680,
                margin: '0 auto 36px',
              }}
            >
              Synova uses AI to analyze your insurance, compare multiple providers, automate quote collection, and help you choose coverage with confidence.
            </p>

            {/* Quick Vehicle Search Form */}
            <form
              onSubmit={handleQuickSearch}
              style={{
                maxWidth: 540,
                margin: '0 auto 32px',
                display: 'flex',
                gap: 8,
                background: '#FFFFFF',
                padding: '6px 8px',
                borderRadius: 9999,
                border: '1px solid rgba(28, 28, 28, 0.16)',
                boxShadow: '0 8px 30px rgba(28, 28, 28, 0.08)',
              }}
            >
              <input
                type="text"
                placeholder="Enter Vehicle Number (e.g. KA-01-MJ-4092)"
                value={quickReg}
                onChange={(e) => setQuickReg(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  padding: '10px 18px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--primary-navy)',
                  background: 'transparent',
                }}
              />
              <button type="submit" className="btn-pill-primary" style={{ padding: '10px 22px', fontSize: 13.5 }}>
                Get Live Quotes →
              </button>
            </form>

            {/* Primary & Secondary Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/new-insurance" className="btn-pill-primary" style={{ padding: '14px 28px', fontSize: 15 }}>
                Get Your Best Quote
              </Link>
              <a href="#how-it-works" className="btn-pill-secondary" style={{ padding: '14px 28px', fontSize: 15 }}>
                Explore How It Works
              </a>
            </div>
          </div>

          {/* 2. HERO PRODUCT PREVIEW (Dark Navy Container) */}
          <div
            id="insurance-overview"
            className="dark-preview-card"
            style={{
              marginTop: 56,
              padding: '36px 32px',
              borderRadius: 32,
              background: 'linear-gradient(180deg, #111111 0%, #0A0A0A 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            {/* Window bar header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, paddingBottom: 16, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }}></div>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }}></div>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }}></div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-on-dark-muted)' }}>
                  synova.io/app/overview
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-ai" style={{ fontSize: 10.5 }}>● AI AGENT ACTIVE</span>
              </div>
            </div>

            {/* Dashboard Mock Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
              {/* Active Policies Stack */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-on-dark-muted)', marginBottom: 14 }}>
                  Your Insurance Overview
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Policy Item 1: Motor */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 16,
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#FFFFFF' }}>Motor Insurance</span>
                        <span className="badge badge-active" style={{ fontSize: 10 }}>ACTIVE</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-on-dark-muted)', marginTop: 4 }}>
                        Hyundai Creta SX • KA-01-MJ-4092
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#FFFFFF' }}>₹18,450<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-on-dark-muted)' }}>/year</span></div>
                      <div style={{ fontSize: 11, color: 'var(--text-on-dark-muted)', marginTop: 2 }}>Expires 14 Aug 2026</div>
                    </div>
                  </div>

                  {/* Policy Item 2: Health */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 16,
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#FFFFFF' }}>Health Insurance</span>
                        <span className="badge badge-active" style={{ fontSize: 10 }}>ACTIVE</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-on-dark-muted)', marginTop: 4 }}>
                        Optima Restore • ₹5,00,000 Sum Insured
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#FFFFFF' }}>₹12,600<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-on-dark-muted)' }}>/year</span></div>
                      <div style={{ fontSize: 11, color: 'var(--text-on-dark-muted)', marginTop: 2 }}>Cashless Network</div>
                    </div>
                  </div>

                  {/* Policy Item 3: Term */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 16,
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#FFFFFF' }}>Term Insurance</span>
                        <span className="badge badge-warning" style={{ fontSize: 10 }}>RENEWAL IN 42 DAYS</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-on-dark-muted)', marginTop: 4 }}>
                        iProtect Smart • ₹1 Crore Cover
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#FFFFFF' }}>₹8,900<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-on-dark-muted)' }}>/year</span></div>
                      <div style={{ fontSize: 11, color: 'var(--status-amber)', marginTop: 2 }}>Renewal Alert</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Recommendation Sidebar Card */}
              <div
                style={{
                  background: 'linear-gradient(145deg, rgba(28, 28, 28, 0.25) 0%, rgba(139, 127, 168, 0.15) 100%)',
                  border: '1px solid rgba(139, 127, 168, 0.35)',
                  borderRadius: 20,
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--ai-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" stroke="#FFFFFF" strokeWidth="2" /></svg>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                      AI Recommendation
                    </span>
                  </div>

                  <div style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, marginBottom: 8 }}>
                    Save up to ₹4,200/year
                  </div>
                  <p style={{ fontSize: 12.5, color: 'var(--text-on-dark-muted)', lineHeight: 1.55 }}>
                    Our AI engine detected lower competitor premiums with higher IDV coverage and full 25% NCB transfer.
                  </p>
                </div>

                <Link
                  to="/new-insurance"
                  className="btn-pill-ai"
                  style={{ width: '100%', marginTop: 20, padding: '10px 16px', fontSize: 13, textAlign: 'center' }}
                >
                  Compare & Apply →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MINIMAL TRUST SECTION */}
      <section className="page-container" style={{ marginBottom: 80 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Insurance decisions, simplified by AI
          </h3>
        </div>

        <div className="grid-4">
          <div className="saas-card" style={{ textAlign: 'center', padding: '24px 20px' }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.03em' }}>4+</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginTop: 4 }}>Insurers Compared</div>
          </div>
          <div className="saas-card" style={{ textAlign: 'center', padding: '24px 20px' }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--blue-primary)', letterSpacing: '-0.03em' }}>24/7</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginTop: 4 }}>AI Assistance</div>
          </div>
          <div className="saas-card" style={{ textAlign: 'center', padding: '24px 20px' }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--status-emerald)', letterSpacing: '-0.03em' }}>100%</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginTop: 4 }}>Digital Process</div>
          </div>
          <div className="saas-card" style={{ textAlign: 'center', padding: '24px 20px' }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.03em' }}>1</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginTop: 4 }}>Unified Policy Vault</div>
          </div>
        </div>

        {/* Dynamic Infinite Marquee of Insurer Networks */}
        <InsurerMarquee />
      </section>

      {/* 4. FEATURE STORYTELLING: 01 ANALYZE / 02 COMPARE / 03 AUTOMATE / 04 RECOMMEND */}
      <section id="how-it-works" className="page-container" style={{ marginBottom: 96 }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 56px' }}>
          <div className="feature-step-num">HOW IT WORKS</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            The AI Insurance Workflow
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 12 }}>
            From policy document scanning to autonomous multi-quote calculation and optimal recommendations.
          </p>
        </div>

        <div className="grid-2" style={{ gap: 32 }}>
          {/* STEP 01: ANALYZE */}
          <div className="saas-card" style={{ padding: 36, borderLeft: '4px solid var(--blue-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span className="feature-step-num">01 ANALYZE</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-primary)' }}>OCR & Vision Parser</span>
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 10 }}>
              Understand your existing insurance
            </h3>
            <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
              Synova scans uploaded policy documents using PDF text extraction and OCR, automatically identifying Policy Number, Insurer, Premium, IDV, Coverage, NCB%, and Vehicle particulars.
            </p>
            <div style={{ background: 'var(--bg-tinted)', borderRadius: 14, padding: '14px 18px', fontSize: 12.5, color: 'var(--text-body)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>✓ Policy # & Insurer Name</div>
              <div>✓ Insured Declared Value (IDV)</div>
              <div>✓ No Claim Bonus (NCB %)</div>
              <div>✓ Vehicle Reg & Expiry Dates</div>
            </div>
          </div>

          {/* STEP 02: COMPARE */}
          <div className="saas-card" style={{ padding: 36, borderLeft: '4px solid var(--ai-accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span className="feature-step-num">02 COMPARE</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ai-accent)' }}>Multi-Insurer Engine</span>
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 10 }}>
              Compare insurers in one place
            </h3>
            <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
              Query live quotes across leading insurers simultaneously. Inspect breakdown of Own Damage, Third-Party Liability, Add-on covers, and GST transparently.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#EBEBEB', borderRadius: 10, fontSize: 13, border: '1px solid rgba(28,28,28,0.06)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>Comprehensive Motor Shield</span>
                <span style={{ fontWeight: 800, color: 'var(--text-heading)' }}>₹14,850 • IDV ₹8.7L</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-tinted)', borderRadius: 10, fontSize: 13, border: '1px solid rgba(28,28,28,0.2)' }}>
                <span style={{ fontWeight: 600, color: 'var(--blue-primary)' }}>Direct Drive Plan • <span className="badge badge-ai" style={{ fontSize: 10 }}>BEST VALUE</span></span>
                <span style={{ fontWeight: 800, color: 'var(--blue-primary)' }}>₹13,950 • IDV ₹8.5L</span>
              </div>
            </div>
          </div>

          {/* STEP 03: AUTOMATE */}
          <div className="saas-card" style={{ padding: 36, borderLeft: '4px solid var(--dark-blue)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span className="feature-step-num">03 AUTOMATE</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark-blue)' }}>Autonomous Quotation Gateway</span>
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 10 }}>
              Let AI handle the busy work
            </h3>
            <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
              Autonomous quotation adapters communicate with insurer pricing gateways, auto-populate risk parameters, and extract policy contracts in seconds.
            </p>
            {/* Visual Workflow Diagram */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', borderRadius: 14, padding: '16px 14px', fontSize: 12, fontWeight: 700, color: 'var(--primary-navy)' }}>
              <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(28,28,28,0.1)' }}>Vehicle Data</div>
              <span style={{ color: 'var(--blue-primary)' }}>→</span>
              <div style={{ background: 'var(--primary-navy)', color: '#FFFFFF', padding: '8px 12px', borderRadius: 8 }}>Synova AI</div>
              <span style={{ color: 'var(--blue-primary)' }}>→</span>
              <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(28,28,28,0.1)' }}>4 Insurers</div>
              <span style={{ color: 'var(--blue-primary)' }}>→</span>
              <div style={{ background: 'var(--status-emerald-bg)', color: 'var(--status-emerald)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--status-emerald-border)' }}>Best Quote</div>
            </div>
          </div>

          {/* STEP 04: RECOMMEND */}
          <div className="saas-card" style={{ padding: 36, borderLeft: '4px solid var(--status-emerald)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span className="feature-step-num">04 RECOMMEND</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-emerald)' }}>Optimal Confidence</span>
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 10 }}>
              Choose with confidence
            </h3>
            <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
              Synova ranks quotes using a multi-factor score balancing price, coverage limits, cashless garage network density, and claim settlement ratios.
            </p>
            <div style={{ background: '#EBEBEB', borderRadius: 14, padding: '16px 20px', border: '1px solid rgba(28,28,28,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--status-emerald)' }}>✓ RECOMMENDED BY SYNOVA</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary-navy)', marginTop: 2 }}>Direct Drive Comprehensive</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Zero Dep • 24x7 RSA • Engine Protect</div>
              </div>
              <Link to="/new-insurance" className="btn-pill-primary" style={{ padding: '8px 18px', fontSize: 12.5 }}>
                View Policy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. RENEWAL SECTION (Dark Navy) */}
      <section className="page-container" style={{ marginBottom: 96 }}>
        <div
          className="dark-preview-card"
          style={{
            padding: '56px 48px',
            borderRadius: 32,
            background: 'linear-gradient(135deg, #111111 0%, #111111 100%)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <span className="badge badge-ai" style={{ marginBottom: 16 }}>RENEWAL INTELLIGENCE</span>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
                Never miss a renewal.
              </h2>
              <p style={{ fontSize: 16, color: 'var(--text-on-dark-muted)', lineHeight: 1.65, marginBottom: 28 }}>
                Upload your previous policy document and let Synova's OCR scan the expiration date, calculate your new NCB discount bracket, and compare renewal premiums across the market.
              </p>
              <Link to="/renew-insurance" className="btn-pill-ai" style={{ padding: '14px 30px', fontSize: 15 }}>
                Compare Renewal Options →
              </Link>
            </div>

            {/* Renewal Counter Mock */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 24,
                padding: '32px 28px',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-on-dark-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Your Motor Insurance
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF', marginTop: 6 }}>
                Expires in <span style={{ color: 'var(--status-amber)' }}>42 days</span>
              </div>

              <div style={{ marginTop: 24, padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-on-dark-muted)' }}>Current Policy:</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>₹18,450</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-on-dark-muted)' }}>Synova Found:</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--status-emerald)', marginTop: 2 }}>₹15,980</div>
                </div>
              </div>

              <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-on-dark-muted)' }}>Potential Saving:</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--status-emerald)' }}>₹2,470 / year</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INSURANCE VAULT SECTION */}
      <section id="vault-preview" className="page-container" style={{ marginBottom: 96 }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
          <div className="feature-step-num">POLICY VAULT</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Everything you insure. One intelligent vault.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 12 }}>
            Centralized policy repository with real-time claims management, cashless network locator, and instant First Notice of Loss (FNOL) dispatch.
          </p>
        </div>

        <div className="grid-4">
          <div className="saas-card" style={{ padding: 24, borderTop: '4px solid var(--blue-primary)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue-primary)', marginBottom: 8 }}>MOTOR COVER</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary-navy)' }}>KA-01-MJ-4092</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }}>Comprehensive Shield</div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(28,28,28,0.06)', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span className="badge badge-active">ACTIVE</span>
              <strong style={{ color: 'var(--primary-navy)' }}>₹18,450</strong>
            </div>
          </div>

          <div className="saas-card" style={{ padding: 24, borderTop: '4px solid var(--ai-purple)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ai-purple)', marginBottom: 8 }}>HEALTH COVER</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary-navy)' }}>POL-HLT-99214</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }}>Family Floater ₹5L</div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(28,28,28,0.06)', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span className="badge badge-active">ACTIVE</span>
              <strong style={{ color: 'var(--primary-navy)' }}>₹12,600</strong>
            </div>
          </div>

          <div className="saas-card" style={{ padding: 24, borderTop: '4px solid var(--dark-blue)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark-blue)', marginBottom: 8 }}>TERM LIFE</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary-navy)' }}>POL-TRM-30041</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }}>₹1 Cr Pure Protection</div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(28,28,28,0.06)', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span className="badge badge-warning">42 DAYS</span>
              <strong style={{ color: 'var(--primary-navy)' }}>₹8,900</strong>
            </div>
          </div>

          <div className="saas-card" style={{ padding: 24, borderTop: '4px solid var(--status-emerald)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--status-emerald)', marginBottom: 8 }}>TRAVEL COVER</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary-navy)' }}>POL-TRV-88192</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }}>Schengen Multi-Trip</div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(28,28,28,0.06)', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span className="badge badge-active">ACTIVE</span>
              <strong style={{ color: 'var(--primary-navy)' }}>₹2,400</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 6.5 ABOUT SYNOVA SECTION */}
      <section id="about" className="page-container" style={{ marginBottom: 96 }}>
        <div style={{ background: '#FFFFFF', borderRadius: 28, padding: '48px 40px', border: '1px solid rgba(28, 28, 28, 0.08)', boxShadow: '0 16px 48px rgba(28, 28, 28, 0.04)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <span className="badge badge-ai" style={{ marginBottom: 12 }}>ABOUT SYNOVA</span>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 38px)', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                Pioneering Autonomous Insurance Intelligence
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginTop: 16 }}>
                Synova was built to eliminate policy opacity and bring mathematical precision to consumer insurance. By orchestrating real-time gateway scrapers, neural vision OCR parsers, and multi-insurer ranking algorithms, Synova empowers policyholders to effortlessly secure optimal coverage at true market rates.
              </p>

              <div style={{ display: 'flex', gap: 24, marginTop: 28 }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-navy)' }}>100%</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Transparent Pricing</div>
                </div>
                <div style={{ width: 1, height: 40, background: 'rgba(28, 28, 28, 0.1)' }} />
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--blue-primary)' }}>&lt; 30s</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Quote Generation</div>
                </div>
                <div style={{ width: 1, height: 40, background: 'rgba(28, 28, 28, 0.1)' }} />
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--status-emerald)' }}>256-bit</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>Encrypted Vault</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', borderRadius: 20, padding: 32, border: '1px solid rgba(28, 28, 28, 0.08)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 16 }}>
                Core Principles
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ color: 'var(--status-emerald)', fontWeight: 800, fontSize: 16 }}>✓</span>
                  <div>
                    <strong style={{ fontSize: 14, color: 'var(--primary-navy)' }}>Zero Bias Aggregation</strong>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Objective ranking based solely on coverage limits, IDV values, and premium calculations.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ color: 'var(--status-emerald)', fontWeight: 800, fontSize: 16 }}>✓</span>
                  <div>
                    <strong style={{ fontSize: 14, color: 'var(--primary-navy)' }}>IRDAI Standard Adherence</strong>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Strict regulatory compliance across all Own-Damage and Third-Party liability frameworks.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ color: 'var(--status-emerald)', fontWeight: 800, fontSize: 16 }}>✓</span>
                  <div>
                    <strong style={{ fontSize: 14, color: 'var(--primary-navy)' }}>Instant Digital Dispatch</strong>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Direct API gateway communication for instant digital policy delivery and FNOL claim tracking.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA SECTION (Large Rounded Gradient Container) */}
      <section className="page-container" style={{ marginBottom: 32 }}>
        <div
          style={{
            borderRadius: 32,
            background: 'linear-gradient(135deg, #111111 0%, #1C1C1C 50%, #6E6285 100%)',
            color: '#FFFFFF',
            padding: '64px 48px',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(28, 28, 28, 0.2)',
          }}
        >
          <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
            Insurance decisions shouldn't be complicated.
          </h2>
          <p style={{ fontSize: 'clamp(15px, 1.8vw, 18px)', color: 'rgba(255, 255, 255, 0.85)', maxWidth: 640, margin: '0 auto 36px', lineHeight: 1.6 }}>
            Let Synova analyze, compare, and recommend the right coverage for you in under 3 minutes.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn-pill-primary" style={{ background: '#FFFFFF', color: 'var(--primary-navy)', border: 'none', padding: '14px 32px', fontSize: 15 }}>
              Get Started
            </Link>
            <Link to="/new-insurance" className="btn-pill-secondary" style={{ background: 'transparent', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.4)', padding: '14px 32px', fontSize: 15 }}>
              Explore Synova
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
