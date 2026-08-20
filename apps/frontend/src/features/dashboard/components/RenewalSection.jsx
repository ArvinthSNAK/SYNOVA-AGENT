import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw, Calendar, AlertTriangle } from 'lucide-react';
import {
  dashboardData,
  getDaysUntilExpiry,
  getExpiryLevel,
  formatDate,
} from '../data/dashboardData.js';
import './RenewalSection.css';

const { policy } = dashboardData;

const urgencyConfig = {
  safe: { color: 'var(--color-success)', bg: 'var(--color-success-tint)', border: 'rgba(47,163,107,0.2)' },
  normal: { color: 'var(--color-primary)', bg: 'var(--color-primary-tint)', border: 'var(--color-border-strong)' },
  warning: { color: 'var(--color-warning)', bg: 'var(--color-warning-tint)', border: 'rgba(224,163,62,0.3)' },
  danger: { color: 'var(--color-error)', bg: 'var(--color-error-tint)', border: 'rgba(220,38,38,0.2)' },
};

export default function RenewalSection() {
  const navigate = useNavigate();
  const daysRemaining = getDaysUntilExpiry(policy.expiryDate);
  const level = getExpiryLevel(daysRemaining);
  const cfg = urgencyConfig[level];

  return (
    <section
      className="renewal-section"
      style={{ background: cfg.bg, borderColor: cfg.border }}
      aria-label="Policy renewal"
    >
      <div className="renewal-header">
        <div className="renewal-icon" style={{ color: cfg.color }}>
          {level === 'warning' || level === 'danger'
            ? <AlertTriangle size={18} aria-hidden="true" />
            : <RefreshCcw size={18} aria-hidden="true" />
          }
        </div>
        <div className="renewal-label" style={{ color: cfg.color }}>
          Policy Renewal
        </div>
      </div>

      <div className="renewal-body">
        <div className="renewal-insurer">{policy.insurer} policy expires on</div>
        <div className="renewal-expiry-date">{formatDate(policy.expiryDate)}</div>
        <div className="renewal-days" style={{ color: cfg.color }}>
          <Calendar size={14} aria-hidden="true" />
          {daysRemaining} days remaining
        </div>
        <p className="renewal-message">
          Renew without re-entering your policy information. Your details are already saved.
        </p>
      </div>

      <button
        className="renewal-btn"
        onClick={() => navigate('/renewal')}
        style={{ background: cfg.color }}
        aria-label={`Renew your ${policy.insurer} policy, expires in ${daysRemaining} days`}
      >
        <RefreshCcw size={15} aria-hidden="true" />
        Renew Policy
      </button>
    </section>
  );
}
