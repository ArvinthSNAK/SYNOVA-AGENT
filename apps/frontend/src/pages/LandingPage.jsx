import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  CheckCircleIcon,
  ArrowRightIcon,
} from '../components/common/icons';
import { Sparkles, MessageSquare, ArrowRight, ShieldCheck, Car, RefreshCcw, Zap, CheckCircle2, Star } from 'lucide-react';
import './LandingPage.css';

const INSURERS = ['ICICI Lombard', 'ACKO', 'Tata AIG', 'HDFC ERGO', 'Bajaj Allianz'];

const TESTIMONIALS_ROW_1 = [
  {
    name: 'Ananya Rao',
    vehicle: 'Hyundai Creta',
    quote: "Renewed my Creta's policy in under 3 minutes — Euler pulled my old policy details automatically and I saved ₹3,200 over last year.",
    rating: 5,
  },
  {
    name: 'Vikram Sinha',
    vehicle: 'Royal Enfield Classic 350',
    quote: 'First time insuring a bike online without calling five different agents. The comparison table made the IDV difference obvious immediately.',
    rating: 5,
  },
  {
    name: 'Priya Menon',
    vehicle: 'Maruti Swift',
    quote: 'Euler explained zero depreciation vs. engine protection in plain language — I actually understood what I was paying for.',
    rating: 4,
  },
];

const TESTIMONIALS_ROW_2 = [
  {
    name: 'Arjun Nair',
    vehicle: 'Honda Activa 6G',
    quote: 'Uploaded my RC and got scooter quotes from three insurers in under a minute. Zero paperwork, zero phone calls.',
    rating: 5,
  },
  {
    name: 'Sneha Kulkarni',
    vehicle: 'Tata Nexon',
    quote: "The claims tracker gave me more visibility than my previous insurer's app ever did.",
    rating: 5,
  },
  {
    name: 'Rahul Verma',
    vehicle: 'Bajaj Pulsar 150',
    quote: 'Compared 5 carriers side by side and picked the one with better roadside assistance, not just the cheapest premium.',
    rating: 4,
  },
];

function TestimonialCard({ t }) {
  return (
    <div className="testimonial-card glass-card-interactive">
      <div className="testimonial-stars" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={13} fill={i < t.rating ? 'currentColor' : 'none'} />
        ))}
      </div>
      <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
      <div className="testimonial-author">
        <span className="testimonial-avatar" aria-hidden="true">{t.name.charAt(0)}</span>
        <div>
          <span className="testimonial-name">{t.name}</span>
          <span className="testimonial-vehicle">{t.vehicle}</span>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    title: 'Pick a journey or ask Euler',
    desc: 'Choose New Insurance or Renewal for your car in seconds with AI assistance.',
    icon: <SparkleIcon width={32} height={32} />,
    tint: 'primary',
  },
  {
    title: 'Auto-fill specs with 1-click OCR',
    desc: 'Euler auto-extracts registration, model, and fuel details directly from RC or policy PDF.',
    icon: <UploadIcon width={32} height={32} />,
    tint: 'accent',
  },
  {
    title: 'Simultaneous 5-carrier quoting',
    desc: 'Vehicle specifications flow across ICICI, ACKO, Tata AIG, and HDFC ERGO simultaneously.',
    icon: <LayersIcon width={32} height={32} />,
    tint: 'primary',
  },
  {
    title: 'Compare, bind & save 20%+',
    desc: 'Ranked quotes by premium, IDV, NCB, and add-on protection in a single glass workspace.',
    icon: <CheckCircleIcon width={32} height={32} />,
    tint: 'accent',
  },
];

const FEATURES = [
  {
    icon: <SparkleIcon />,
    title: 'Euler AI Voice & Chat Copilot',
    desc: 'Real-time conversational intelligence guiding auto insurance discovery and policy renewals.',
  },
  {
    icon: <UploadIcon />,
    title: 'Instant Document OCR',
    desc: 'Upload vehicle RC, Aadhaar, or policy certificates — specifications extracted in under 2 seconds.',
  },
  {
    icon: <LayersIcon />,
    title: 'Multi-Carrier Quoting',
    desc: 'A single unified request dispatched across India\'s leading auto insurers simultaneously.',
  },
  {
    icon: <ShieldIcon />,
    title: 'Centralized Vault',
    desc: 'Store, track and manage all active, expired and third-party motor policies in one dashboard.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

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
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="hero-badge center-out">
              <span className="dot" />
              Next-Gen AI Auto Insurance Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <TextReveal
              as="span"
              lines={[
                <>
                  Insurance, <em>without the paperwork.</em>
                </>,
                'The best quote, every time.',
              ]}
            />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hero-subtext"
          >
            Meet Synova — your intelligent AI insurance copilot for comparing, managing, and renewing auto insurance across India’s leading carriers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="hero-cta"
          >
            <Button as={Link} to="/signup" variant="accent">
              Get Started Free <ArrowRightIcon width={18} height={18} />
            </Button>
            <Button as={Link} to="/dashboard" variant="secondary">
              Open Dashboard
            </Button>
          </motion.div>

          {/* ─── Centered Glass Euler Assistant in Hero ───────────────────────── */}
          {!eulerDocked && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="hero-euler-centerpiece center-out"
            >
              <div className="hero-euler-glass-card glow-border">
                <div className="hero-euler-head">
                  <div className="hero-euler-sparkle-avatar glow-pulse">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <span className="hero-euler-tag">✦ Talk to Euler AI</span>
                    <h3 className="hero-euler-prompt">"How can I help with your car insurance today?"</h3>
                  </div>
                </div>

                <div className="hero-euler-quick-options">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="hero-euler-chip"
                    onClick={handleStartEuler}
                  >
                    <Car size={13} />
                    <span>Get New Auto Insurance</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="hero-euler-chip"
                    onClick={handleStartEuler}
                  >
                    <RefreshCcw size={13} />
                    <span>Renew Existing Policy</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="hero-euler-chip"
                    onClick={handleStartEuler}
                  >
                    <ShieldCheck size={13} />
                    <span>Explain My Coverage</span>
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="hero-euler-start-btn"
                  onClick={handleStartEuler}
                  aria-label="Start conversation with Euler"
                >
                  <MessageSquare size={16} />
                  <span>Start Live Session with Euler</span>
                  <ArrowRight size={14} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Hero Visual Mock Application */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="hero-visual center-out"
          >
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
                  <span className="mock-sidebar-item">Insurance Vault</span>
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
          </motion.div>
        </div>
      </section>

      {/* Insurers strip — infinite scroll marquee */}
      <section className="trusted-strip">
        <div className="container">
          <div className="trusted-label">Live Quoting & Policy Automation Across</div>
        </div>
        <div className="trusted-marquee">
          <div className="trusted-marquee-track">
            {[...INSURERS, ...INSURERS].map((name, i) => (
              <span key={`${name}-${i}`} className="trusted-logo">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — stacking cards on scroll */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow">How It Works</span>
            <h2>From vehicle details to bound policy in 4 steps</h2>
            <p>Built for effortless auto insurance discovery, backed by real-time carrier integrations.</p>
          </div>
          <div className="steps-stack">
            {STEPS.map((step, i) => (
              <div className="step-stack-outer" key={step.title} style={{ zIndex: i + 1 }}>
                <motion.div
                  className={`step-stack-inner step-stack-inner--${step.tint} glass-card-interactive`}
                  style={{ top: `${88 + i * 26}px` }}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="step-stack-text">
                    <div className="step-number">{i + 1}</div>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                  <div className="step-stack-visual" aria-hidden="true">
                    <motion.span
                      className="step-stack-visual-dot step-stack-visual-dot--a"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.span
                      className="step-stack-visual-dot step-stack-visual-dot--b"
                      animate={{ y: [0, 8, 0] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                    />
                    <div className="step-stack-visual-tile">{step.icon}</div>
                  </div>
                </motion.div>
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
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="feature-grid"
          >
            {FEATURES.map((f) => (
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                className="feature-card glass-card-interactive"
                key={f.title}
              >
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Customer reviews — dual-lane opposite-direction marquee */}
      <section className="section testimonials-section" id="reviews">
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow">Customer Stories</span>
            <h2>Loved by drivers and riders across India</h2>
            <p>Real feedback from Synova customers insuring everything from scooters to SUVs.</p>
          </div>
        </div>
        <div className="testimonial-marquee-row">
          <div className="testimonial-marquee-track testimonial-marquee-track--left">
            {[...TESTIMONIALS_ROW_1, ...TESTIMONIALS_ROW_1].map((t, i) => (
              <TestimonialCard t={t} key={`${t.name}-${i}`} />
            ))}
          </div>
        </div>
        <div className="testimonial-marquee-row">
          <div className="testimonial-marquee-track testimonial-marquee-track--right">
            {[...TESTIMONIALS_ROW_2, ...TESTIMONIALS_ROW_2].map((t, i) => (
              <TestimonialCard t={t} key={`${t.name}-${i}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section" id="insurers">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="stats-band glass-panel"
          >
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
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" id="pricing">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="cta-banner glass-panel-dark glow-border"
          >
            <div>
              <h2>Ready to compare your car insurance?</h2>
              <p>Create your free account and see quotes from India's top insurers in minutes.</p>
            </div>
            <Button as={Link} to="/signup" variant="accent">
              Get Started Free
            </Button>
          </motion.div>
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
