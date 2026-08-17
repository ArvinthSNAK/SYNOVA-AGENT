import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const { policy, vehicle } = dashboardData;

const statusLabels = {
  safe: 'Active & Protected',
  normal: 'Active',
  warning: 'Renewal Due Soon',
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

  const daysRemaining = getDaysUntilExpiry(policy.expiryDate);
  const validityPercent = getPolicyValidityPercent(policy.startDate, policy.expiryDate);
  const expiryLevel = getExpiryLevel(daysRemaining);
  const progressPercent = Math.round((1 - validityPercent) * 100);

  const handleCopyPolicy = () => {
    navigator.clipboard.writeText(policy.id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const barColor = statusColors[expiryLevel];

  // Lifecycle Timeline Steps
  const timelineSteps = [
    { id: 'purchased', label: 'Policy Issued', date: '25 Sep 2025', state: 'done' },
    { id: 'active', label: 'Coverage Active', date: 'KA-01-XX-0000', state: 'done' },
    { id: 'renewal', label: 'Renewal Due', date: 'In 43 Days', state: 'current' },
    { id: 'renewed', label: 'NCB 25% Ready', date: '25 Sep 2026', state: 'upcoming' },
  ];

  return (
    <section className="insurance-hero-container" aria-label="Active Auto Insurance">
      {/* Top Banner / Card Head */}
      <div className="hero-head-row">
        <div className="hero-insurer-info">
          <div className="hero-carrier-badge">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{policy.insurer}</span>
          </div>
          <div>
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
      </div>

      {/* Main Grid: Vehicle Details + Financial Highlights */}
      <div className="hero-main-details-grid">
        {/* Vehicle Showcase */}
        <div className="hero-vehicle-card">
          <div className="hero-vehicle-avatar">
            <Car size={32} strokeWidth={1.5} />
          </div>
          <div className="hero-vehicle-meta">
            <h3 className="hero-vehicle-title">{vehicle.make} {vehicle.model}</h3>
            <span className="hero-vehicle-reg mono">{vehicle.registration}</span>
            <div className="hero-vehicle-specs">
              <span>{vehicle.variant}</span>
              <span>·</span>
              <span>{vehicle.fuel}</span>
              <span>·</span>
              <span>{vehicle.year}</span>
            </div>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="hero-stats-quad">
          <div className="hero-stat-cell">
            <span className="hero-stat-label">Annual Premium</span>
            <span className="hero-stat-val hero-stat-val--premium mono">{formatINR(policy.premium)}</span>
          </div>

          <div className="hero-stat-cell">
            <span className="hero-stat-label">Vehicle IDV</span>
            <span className="hero-stat-val mono">{formatINRShort(policy.idv)}</span>
          </div>

          <div className="hero-stat-cell">
            <span className="hero-stat-label">No Claim Bonus</span>
            <span className="hero-stat-val">{policy.ncb}%</span>
          </div>

          <div className="hero-stat-cell">
            <span className="hero-stat-label">Deductible</span>
            <span className="hero-stat-val mono">{formatINR(policy.deductible)}</span>
          </div>
        </div>
      </div>

      {/* Policy Timeline */}
      <div className="hero-timeline-section">
        <div className="hero-timeline-head">
          <span className="hero-timeline-label">Policy Lifecycle & Coverage Term</span>
          <span className="hero-timeline-days" style={{ color: barColor }}>
            <Calendar size={13} aria-hidden="true" />
            {daysRemaining} Days Until Renewal
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div
          className="hero-timeline-track"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Policy term progress: ${progressPercent}%`}
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

      {/* Actions */}
      <div className="hero-cta-footer">
        <button
          className="hero-cta-btn hero-cta-btn--accent"
          onClick={() => navigate('/renewal')}
        >
          <RefreshCcw size={15} aria-hidden="true" />
          <span>Renew with ICICI Lombard</span>
        </button>

        <button
          className="hero-cta-btn hero-cta-btn--secondary"
          onClick={() => navigate('/policies')}
        >
          <Eye size={15} aria-hidden="true" />
          <span>View Policy Schedule</span>
        </button>

        <button
          className="hero-cta-btn hero-cta-btn--ghost"
          onClick={() => alert(`Downloading ${policy.id}-policy-certificate.pdf`)}
        >
          <Download size={15} aria-hidden="true" />
          <span>Download PDF</span>
        </button>
      </div>
    </section>
  );
}
