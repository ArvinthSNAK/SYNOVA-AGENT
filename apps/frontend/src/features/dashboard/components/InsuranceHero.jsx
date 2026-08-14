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

const { policy, vehicle, user } = dashboardData;

const statusLabels = {
  safe: 'Well covered',
  normal: 'Active',
  warning: 'Renew soon',
  danger: 'Expiring soon',
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

  return (
    <section className="insurance-hero" aria-label="Active insurance policy">
      {/* Policy Header */}
      <div className="hero-header">
        <div className="hero-header-left">
          <div className="hero-insurer-badge">
            <ShieldCheck size={15} aria-hidden="true" />
            <span>{policy.insurer}</span>
          </div>
          <h2 className="hero-policy-type">{policy.type}</h2>
        </div>
        <div className="hero-status-badge">
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

      {/* Vehicle Info */}
      <div className="hero-vehicle">
        <div className="hero-vehicle-visual" aria-hidden="true">
          <div className="hero-vehicle-icon-wrap">
            <Car size={36} strokeWidth={1.5} />
          </div>
          <div className="hero-vehicle-glow" />
        </div>
        <div className="hero-vehicle-info">
          <div className="hero-vehicle-name">
            {vehicle.make} {vehicle.model}
          </div>
          <div className="hero-vehicle-reg">{vehicle.registration}</div>
          <div className="hero-vehicle-meta">
            <span>{vehicle.fuel}</span>
            <span className="hero-meta-dot" aria-hidden="true">·</span>
            <span>{vehicle.year}</span>
            <span className="hero-meta-dot" aria-hidden="true">·</span>
            <span>{vehicle.seats} Seats</span>
          </div>
        </div>
      </div>

      {/* Policy Grid */}
      <div className="hero-policy-grid">
        <div className="hero-policy-field">
          <div className="hero-field-label">Policy Number</div>
          <div className="hero-field-value hero-field-mono">
            {policy.id}
            <button
              className="hero-copy-btn"
              onClick={handleCopyPolicy}
              aria-label="Copy policy number"
              title="Copy policy number"
            >
              {copied ? (
                <Check size={13} aria-hidden="true" />
              ) : (
                <Copy size={13} aria-hidden="true" />
              )}
              {copied && <span className="hero-copied-label">Copied</span>}
            </button>
          </div>
        </div>

        <div className="hero-policy-field">
          <div className="hero-field-label">Policy Period</div>
          <div className="hero-field-value">
            {formatDate(policy.startDate)} — {formatDate(policy.expiryDate)}
          </div>
        </div>

        <div className="hero-policy-field">
          <div className="hero-field-label">Annual Premium</div>
          <div className="hero-field-value hero-field-highlight">
            {formatINR(policy.premium)}
          </div>
        </div>

        <div className="hero-policy-field">
          <div className="hero-field-label">IDV</div>
          <div className="hero-field-value">{formatINRShort(policy.idv)}</div>
        </div>

        <div className="hero-policy-field">
          <div className="hero-field-label">NCB</div>
          <div className="hero-field-value">{policy.ncb}%</div>
        </div>

        <div className="hero-policy-field">
          <div className="hero-field-label">Deductible</div>
          <div className="hero-field-value">{formatINR(policy.deductible)}</div>
        </div>
      </div>

      {/* Policy Validity Bar */}
      <div className="hero-validity">
        <div className="hero-validity-header">
          <div className="hero-validity-label">
            <Calendar size={14} aria-hidden="true" />
            <span>Policy validity</span>
          </div>
          <div
            className="hero-validity-days"
            style={{ color: barColor }}
            aria-label={`${daysRemaining} days remaining`}
          >
            {daysRemaining} days remaining
          </div>
        </div>

        <div
          className="hero-validity-track"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Policy ${progressPercent}% through its term`}
        >
          <div
            className="hero-validity-bar"
            style={{
              width: `${progressPercent}%`,
              background: barColor,
            }}
          />
        </div>

        <div className="hero-validity-dates">
          <span>{formatDate(policy.startDate)}</span>
          <span>{formatDate(policy.expiryDate)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="hero-actions">
        <button
          className="hero-btn hero-btn--primary"
          onClick={() => navigate('/policies')}
          aria-label="View full policy details"
        >
          <Eye size={16} aria-hidden="true" />
          View Policy
        </button>
        <button
          className="hero-btn hero-btn--accent"
          onClick={() => navigate('/renewal')}
          aria-label="Renew your insurance policy"
        >
          <RefreshCcw size={16} aria-hidden="true" />
          Renew Policy
        </button>
        <button
          className="hero-btn hero-btn--ghost"
          onClick={() => {
            const link = document.createElement('a');
            link.href = '#';
            link.download = `${policy.id}-certificate.pdf`;
            alert('Policy document download initiated.');
          }}
          aria-label="Download policy document"
        >
          <Download size={16} aria-hidden="true" />
          Download
        </button>
      </div>
    </section>
  );
}
