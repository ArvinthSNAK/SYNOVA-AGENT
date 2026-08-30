import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Calendar,
  RefreshCcw,
  Eye,
  Download,
  Copy,
  Check,
  Car,
  CheckCircle2,
  Clock,
  CheckCheck,
  Sparkles,
  Zap,
  Layers,
  FileText,
  Sliders,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  dashboardData,
  getDaysUntilExpiry,
  getPolicyValidityPercent,
  getExpiryLevel,
  formatINR,
  formatINRShort,
  formatDate,
} from '../data/dashboardData.js';
import './InsuranceHero.css';

const { policy, vehicle, coverage: initialCoverage, addons: initialAddons } = dashboardData;

const statusLabels = {
  safe: 'Active & Protected',
  normal: 'Active',
  warning: 'Renewal Due Soon (43d)',
  danger: 'Expiring Urgently',
};

const statusColors = {
  safe: 'var(--color-success)',
  normal: 'var(--color-primary)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-error)',
};

export default function InsuranceHero() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'coverage' | 'market'
  const [addonsState, setAddonsState] = useState(initialAddons);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const daysRemaining = getDaysUntilExpiry(policy.expiryDate);
  const validityPercent = getPolicyValidityPercent(policy.startDate, policy.expiryDate);
  const expiryLevel = getExpiryLevel(daysRemaining);
  const progressPercent = Math.round((1 - validityPercent) * 100);

  const handleCopyPolicy = () => {
    navigator.clipboard.writeText(policy.id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const toggleAddon = (id) => {
    setAddonsState((prev) =>
      prev.map((addon) =>
        addon.id === id ? { ...addon, included: !addon.included } : addon
      )
    );
  };

  // Calculate dynamic protection score
  const includedAddonsCount = addonsState.filter((a) => a.included).length;
  const protectionScore = Math.round(75 + (includedAddonsCount / addonsState.length) * 25);

  const barColor = statusColors[expiryLevel];

  // Lifecycle steps
  const timelineSteps = [
    { id: 'purchased', label: 'Policy Issued', date: '25 Sep 2025', state: 'done' },
    { id: 'active', label: 'Coverage Active', date: vehicle.registration, state: 'done' },
    { id: 'renewal', label: 'Renewal Due', date: `${daysRemaining} Days`, state: 'current' },
    { id: 'renewed', label: 'NCB 25% Ready', date: '25 Sep 2026', state: 'upcoming' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="insurance-hero-container glass-panel glow-border"
      aria-label="Active Auto Insurance Command Center"
    >
      {/* Top Banner / Header Row */}
      <div className="hero-head-row">
        <div className="hero-insurer-info">
          <div className="hero-carrier-badge">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{policy.insurer}</span>
          </div>
          <div>
            <div className="hero-title-wrap">
              <h2 className="hero-policy-title">{policy.type}</h2>
              <div className="hero-policy-number-row">
                <span className="hero-policy-number mono">{policy.id}</span>
                <button
                  className="hero-copy-btn"
                  onClick={handleCopyPolicy}
                  aria-label="Copy policy number"
                  title="Copy policy number"
                >
                  {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                  {copied && <span className="hero-copied-label">Copied</span>}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-head-right">
          <div className="hero-status-pill">
            <span
              className="hero-status-dot"
              style={{ background: statusColors[expiryLevel] }}
              aria-hidden="true"
            />
            <span style={{ color: statusColors[expiryLevel] }}>
              {statusLabels[expiryLevel]}
            </span>
          </div>

          <div className="hero-ncb-badge">
            <TrendingUp size={14} />
            <span>{policy.ncb}% No Claim Bonus</span>
          </div>
        </div>
      </div>

      {/* Vehicle Ribbon & Interactive View Tabs */}
      <div className="hero-middle-bar">
        {/* Vehicle Showcase Snippet */}
        <div className="hero-vehicle-snippet">
          <div className="hero-vehicle-icon-box">
            <Car size={22} strokeWidth={1.7} />
          </div>
          <div className="hero-vehicle-meta">
            <div className="hero-vehicle-name-row">
              <span className="hero-vehicle-name">{vehicle.make} {vehicle.model}</span>
              <span className="hero-vehicle-variant">{vehicle.variant}</span>
            </div>
            <div className="hero-vehicle-tags">
              <span className="hero-tag mono">{vehicle.registration}</span>
              <span className="hero-tag">{vehicle.fuel}</span>
              <span className="hero-tag">{vehicle.year}</span>
            </div>
          </div>
        </div>

        {/* Interactive Segmented Tabs */}
        <div className="hero-segmented-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'overview'}
            className={`hero-tab-btn ${activeTab === 'overview' ? 'hero-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FileText size={14} />
            <span>Overview & Term</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'coverage'}
            className={`hero-tab-btn ${activeTab === 'coverage' ? 'hero-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('coverage')}
          >
            <Sliders size={14} />
            <span>Live Coverage Simulator</span>
            <span className="hero-tab-pill">{protectionScore}%</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'market'}
            className={`hero-tab-btn ${activeTab === 'market' ? 'hero-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('market')}
          >
            <Sparkles size={14} />
            <span>Carrier Market Rates</span>
          </button>
        </div>
      </div>

      {/* Tab Content Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="hero-tab-panel"
          >
            {/* Financial Highlights Quad */}
            <div className="hero-stats-quad">
              <div className="hero-stat-cell hero-stat-cell--highlight">
                <span className="hero-stat-label">Annual Premium</span>
                <span className="hero-stat-val hero-stat-val--premium mono">{formatINR(policy.premium)}</span>
                <span className="hero-stat-sub">Includes 18% GST</span>
              </div>

              <div className="hero-stat-cell">
                <span className="hero-stat-label">Vehicle IDV (Insured Value)</span>
                <span className="hero-stat-val mono">{formatINRShort(policy.idv)}</span>
                <span className="hero-stat-sub">Max Claim Payout</span>
              </div>

              <div className="hero-stat-cell">
                <span className="hero-stat-label">Active NCB Discount</span>
                <span className="hero-stat-val hero-stat-val--ncb">{policy.ncb}%</span>
                <span className="hero-stat-sub">Saves ₹3,690 on renewal</span>
              </div>

              <div className="hero-stat-cell">
                <span className="hero-stat-label">Compulsory Deductible</span>
                <span className="hero-stat-val mono">{formatINR(policy.deductible)}</span>
                <span className="hero-stat-sub">Standard IRDAI Rate</span>
              </div>
            </div>

            {/* Policy Lifecycle Term Progress */}
            <div className="hero-timeline-section">
              <div className="hero-timeline-head">
                <span className="hero-timeline-label">Policy Lifecycle & Protection Term</span>
                <span className="hero-timeline-days" style={{ color: barColor }}>
                  <Calendar size={13} aria-hidden="true" />
                  {daysRemaining} Days Remaining Until Renewal
                </span>
              </div>

              {/* Progress Bar */}
              <div
                className="hero-timeline-track"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="hero-timeline-fill"
                  style={{ width: `${progressPercent}%`, background: barColor }}
                />
              </div>

              {/* Milestone Steps */}
              <div className="hero-milestone-grid">
                {timelineSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`hero-milestone hero-milestone--${step.state}`}
                  >
                    <div className="hero-milestone-dot">
                      {step.state === 'done' && <CheckCheck size={11} />}
                      {step.state === 'current' && <Clock size={11} />}
                      {step.state === 'upcoming' && <span className="hero-milestone-inner-dot" />}
                    </div>
                    <span className="hero-milestone-title">{step.label}</span>
                    <span className="hero-milestone-sub">{step.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'coverage' && (
          <motion.div
            key="coverage"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="hero-tab-panel"
          >
            <div className="hero-coverage-simulator">
              <div className="hero-coverage-sim-header">
                <div>
                  <h3 className="hero-sim-title">Interactive Coverage & Add-on Sandbox</h3>
                  <p className="hero-sim-desc">
                    Toggle add-on covers to see real-time protection score and coverage benefits.
                  </p>
                </div>
                <div className="hero-sim-score-badge">
                  <div className="hero-sim-score-ring">
                    <span className="hero-sim-score-number">{protectionScore}%</span>
                  </div>
                  <span className="hero-sim-score-text">Protection Index</span>
                </div>
              </div>

              <div className="hero-addons-interactive-grid">
                {addonsState.map((addon) => (
                  <div
                    key={addon.id}
                    className={`hero-addon-card ${addon.included ? 'hero-addon-card--active' : ''}`}
                    onClick={() => toggleAddon(addon.id)}
                  >
                    <div className="hero-addon-left">
                      <div className={`hero-addon-checkbox ${addon.included ? 'hero-addon-checkbox--checked' : ''}`}>
                        {addon.included && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div>
                        <div className="hero-addon-title">{addon.label}</div>
                        <div className="hero-addon-sub">
                          {addon.id === 'zero-dep' && '100% reimbursement on replaced parts without depreciation'}
                          {addon.id === 'rsa' && '24x7 roadside towing, flat tyre & battery jumpstart support'}
                          {addon.id === 'engine-protection' && 'Covers hydrostatic engine lock and oil leakage damage'}
                          {addon.id === 'consumables' && 'Covers nuts, bolts, engine oil, coolant and lubricants'}
                        </div>
                      </div>
                    </div>
                    <span className={`hero-addon-status-pill ${addon.included ? 'hero-addon-status-pill--active' : ''}`}>
                      {addon.included ? 'Active in Policy' : '+ Add Cover'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'market' && (
          <motion.div
            key="market"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="hero-tab-panel"
          >
            <div className="hero-market-rates">
              <div className="hero-market-header">
                <div>
                  <h3 className="hero-sim-title">Live Carrier Market Benchmarks</h3>
                  <p className="hero-sim-desc">
                    Quotes automatically synced via Synova multi-carrier broker engine.
                  </p>
                </div>
                <button
                  className="hero-market-compare-btn"
                  onClick={() => navigate('/new-insurance/quotes')}
                >
                  <span>Open Full Comparison</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="hero-market-grid">
                {[
                  { name: 'ICICI Lombard', premium: 18450, idv: '₹8.40L', ncb: '20%', badge: 'Current Insurer', tone: 'primary' },
                  { name: 'Tata AIG', premium: 17290, idv: '₹8.45L', ncb: '20%', badge: 'Best Value', tone: 'success' },
                  { name: 'ACKO', premium: 16850, idv: '₹8.30L', ncb: '20%', badge: 'Lowest Price', tone: 'accent' },
                  { name: 'HDFC ERGO', premium: 19100, idv: '₹8.50L', ncb: '20%', badge: 'Max Cashless Garages', tone: 'neutral' },
                ].map((c, i) => (
                  <div key={i} className="hero-market-card">
                    <div className="hero-market-card-head">
                      <span className="hero-market-carrier">{c.name}</span>
                      <span className={`hero-market-tag hero-market-tag--${c.tone}`}>{c.badge}</span>
                    </div>
                    <div className="hero-market-price-row">
                      <span className="hero-market-price mono">{formatINR(c.premium)}</span>
                      <span className="hero-market-period">/ year</span>
                    </div>
                    <div className="hero-market-stats">
                      <span>IDV: {c.idv}</span>
                      <span>·</span>
                      <span>NCB: {c.ncb}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions Footer */}
      <div className="hero-cta-footer">
        <div className="hero-cta-left">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hero-cta-btn hero-cta-btn--accent"
            onClick={() => navigate('/renewal')}
          >
            <RefreshCcw size={15} aria-hidden="true" />
            <span>1-Click Renew Policy</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hero-cta-btn hero-cta-btn--secondary"
            onClick={() => navigate('/wallet')}
          >
            <Eye size={15} aria-hidden="true" />
            <span>View in Policy Vault</span>
          </motion.button>
        </div>

        <div className="hero-cta-right">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hero-cta-btn hero-cta-btn--ghost"
            onClick={handleDownload}
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 size={15} style={{ color: 'var(--color-success)' }} />
                <span style={{ color: 'var(--color-success)' }}>Certificate Downloaded</span>
              </>
            ) : (
              <>
                <Download size={15} aria-hidden="true" />
                <span>Download Certificate</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
}
