import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import TextReveal from '../components/common/TextReveal';
import HeroBackground from '../components/HeroBackground';
import EulerChat from '../features/dashboard/components/EulerChat';
import {
  SparkleIcon,
  UploadIcon,
  LayersIcon,
  ShieldIcon,
  ArrowRightIcon,
} from '../components/common/icons';
import { Sparkles, MessageSquare, ArrowRight, ShieldCheck, Car, RefreshCcw } from 'lucide-react';
import './LandingPage.css';

const INSURERS = ['ICICI Lombard', 'ACKO', 'Tata AIG', 'HDFC ERGO', 'Bajaj Allianz'];

const STEPS = [
  {
    title: 'Login & pick a journey',
    desc: 'Choose New Insurance or Renewal for your vehicle in seconds.',
  },
  {
    title: 'Fill with Euler or upload RC',
    desc: 'New business: Euler auto-extracts your vehicle specs. Renewals: upload policy documents for instant recognition.',
  },
  {
    title: 'Auto-fill across 5 carriers',
    desc: 'Vehicle specifications flow straight into ICICI Lombard, ACKO, Tata AIG and more — zero repetitive typing.',
  },
  {
    title: 'Compare & bind policy',
    desc: 'Quotes ranked by premium, IDV, NCB, and add-on coverage side by side in a unified InsurTech workspace.',
  },
];

const FEATURES = [
  {
    icon: <SparkleIcon />,
    title: 'Euler AI Assistant',
    desc: 'A real-time voice and conversational copilot that fills auto insurance applications step by step.',
  },
  {
    icon: <UploadIcon />,
    title: 'Intelligent Document OCR',
    desc: 'Upload vehicle RC, Aadhaar, or existing policy PDFs — details are extracted in under 2 seconds.',
  },
  {
    icon: <LayersIcon />,
    title: 'Multi-Carrier Quoting',
    desc: 'One single request submitted across all connected insurance carriers simultaneously.',
  },
  {
    icon: <ShieldIcon />,
    title: 'Insurance Wallet',
    desc: 'Consolidate all personal and third-party motor insurance policies into one unified dashboard.',
  },
];

export default function LandingPage() {
  const [eulerOpen, setEulerOpen] = useState(false);
  const [eulerDocked, setEulerDocked] = useState(false);

  const handleStartEuler = () => {
    setEulerDocked(true);
    setEulerOpen(true);
  };

  return (
    <>
      <Navbar />

      <section className="hero">
        <HeroBackground />
        <div className="container hero-content">
          <span className="hero-badge center-out">
            <span className="dot" />
            Next-Gen AI Auto Insurance Platform
          </span>

          <h1>
            <TextReveal
              as="span"
              lines={[
                <>
                  Insurance, <em>without the paperwork.</em>
                </>,
                'The best quote, every time.',
              ]}
            />
          </h1>

          <p className="hero-subtext">
            Meet Synova — your intelligent insurance assistant for comparing, managing, and renewing auto insurance across India’s leading carriers.
          </p>

          <div className="hero-cta">
            <Button as={Link} to="/signup" variant="accent">
              Get Started <ArrowRightIcon width={18} height={18} />
            </Button>
            <Button as={Link} to="/signin" variant="secondary">
              Explore Insurance
            </Button>
          </div>

          {/* ─── Centered Glass Euler Assistant in Hero ───────────────────────── */}
          {!eulerDocked && (
            <div className="hero-euler-centerpiece center-out" style={{ animationDelay: '0.2s' }}>
              <div className="hero-euler-glass-card">
                <div className="hero-euler-head">
                  <div className="hero-euler-sparkle-avatar">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <span className="hero-euler-tag">✦ Talk to Euler</span>
                    <h3 className="hero-euler-prompt">"How can I help with your car insurance?"</h3>
                  </div>
                </div>

                <div className="hero-euler-quick-options">
                  <button
                    className="hero-euler-chip"
                    onClick={handleStartEuler}
                  >
                    <Car size={13} />
                    <span>Get New Auto Insurance</span>
                  </button>
                  <button
                    className="hero-euler-chip"
                    onClick={handleStartEuler}
                  >
                    <RefreshCcw size={13} />
                    <span>Renew Existing Policy</span>
                  </button>
                  <button
                    className="hero-euler-chip"
                    onClick={handleStartEuler}
                  >
                    <ShieldCheck size={13} />
                    <span>Explain My Coverage</span>
                  </button>
                </div>

                <button
                  className="hero-euler-start-btn"
                  onClick={handleStartEuler}
                  aria-label="Start conversation with Euler"
                >
                  <MessageSquare size={16} />
                  <span>Start Chat with Euler</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Hero Visual Mock Application */}
          <div className="hero-visual center-out" style={{ animationDelay: '0.35s' }}>
            <div className="hero-visual-inner">
              <div className="browser-bar">
                <span className="browser-dot" />
                <span className="browser-dot" />
                <span className="browser-dot" />
                <span className="browser-url">app.synova.ai/quotes/comparison</span>
              </div>
              <div className="mock-app">
                <div className="mock-sidebar">
                  <span className="mock-sidebar-item active">Quotes Comparison</span>
                  <span className="mock-sidebar-item">Insurance Wallet</span>
                  <span className="mock-sidebar-item">New Insurance</span>
                  <span className="mock-sidebar-item">Renewals</span>
                  <span className="mock-sidebar-item">Documents</span>
                </div>
                <div className="mock-main">
                  <div className="mock-main-title">Comparing 4 live quotes for Hyundai Creta (KA-01-XX-0000)</div>
                  <div className="mock-quote-row best">
                    <span className="mock-insurer">Tata AIG</span>
                    <span className="mock-premium">₹16,240 / yr</span>
                    <span className="mock-bar-track">
                      <span className="mock-bar-fill" style={{ width: '88%' }} />
                    </span>
                    <span className="mock-tag">Best Value</span>
                  </div>
                  <div className="mock-quote-row">
                    <span className="mock-insurer">ICICI Lombard</span>
                    <span className="mock-premium">₹18,450 / yr</span>
                    <span className="mock-bar-track">
                      <span className="mock-bar-fill" style={{ width: '74%' }} />
                    </span>
                    <span />
                  </div>
                  <div className="mock-quote-row">
                    <span className="mock-insurer">ACKO</span>
                    <span className="mock-premium">₹15,980 / yr</span>
                    <span className="mock-bar-track">
                      <span className="mock-bar-fill" style={{ width: '61%' }} />
                    </span>
                    <span />
                  </div>
                  <div className="mock-quote-row">
                    <span className="mock-insurer">HDFC ERGO</span>
                    <span className="mock-premium">₹19,120 / yr</span>
                    <span className="mock-bar-track">
                      <span className="mock-bar-fill" style={{ width: '69%' }} />
                    </span>
                    <span />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insurers strip */}
      <section className="trusted-strip">
        <div className="container">
          <div className="trusted-label">Live API & Quoting automation across</div>
          <div className="trusted-logos">
            {INSURERS.map((name) => (
              <span key={name} className="trusted-logo">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow">How it works</span>
            <h2>From vehicle details to bound policy in 4 steps</h2>
            <p>Built for effortless auto insurance discovery, backed by real-time carrier integrations.</p>
          </div>
          <div className="steps-grid">
            {STEPS.map((step, i) => (
              <div className="step-card hover-lift" key={step.title}>
                <div className="step-number">{i + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product */}
      <section className="section" id="product">
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow">Product Capabilities</span>
            <h2>Everything you need to manage auto insurance</h2>
            <p>No more switching between carrier portals or repeating vehicle data.</p>
          </div>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div className="feature-card hover-lift" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section" id="insurers">
        <div className="container">
          <div className="stats-band">
            <div>
              <div className="stat-value">5+</div>
              <div className="stat-label">Insurance carriers</div>
            </div>
            <div>
              <div className="stat-value">&lt; 15s</div>
              <div className="stat-label">Multi-quote SLA</div>
            </div>
            <div>
              <div className="stat-value">100%</div>
              <div className="stat-label">NCB preservation</div>
            </div>
            <div>
              <div className="stat-value">₹4,200</div>
              <div className="stat-label">Avg. annual savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" id="pricing">
        <div className="container">
          <div className="cta-banner">
            <div>
              <h2>Ready to compare your car insurance?</h2>
              <p>Create your free account and see quotes from India's top insurers in minutes.</p>
            </div>
            <Button as={Link} to="/signup" variant="accent">
              Get Started Free
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Floating Euler Assistant when active/docked */}
      {eulerDocked && (
        <EulerChat open={eulerOpen} onClose={() => setEulerOpen(false)} />
      )}

      {/* Floating Button when docked but closed */}
      {eulerDocked && !eulerOpen && (
        <div className="euler-launcher-wrap">
          <button
            className="euler-fab"
            onClick={() => setEulerOpen(true)}
            aria-label="Open Euler assistant"
          >
            <Sparkles size={18} aria-hidden="true" />
            <div className="euler-fab-text">
              <span className="euler-fab-name">Euler</span>
              <span className="euler-fab-subtitle">Insurance Assistant</span>
            </div>
          </button>
        </div>
      )}
    </>
  );
}
