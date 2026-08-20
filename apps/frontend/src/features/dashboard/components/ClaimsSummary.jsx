import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight } from 'lucide-react';
import { dashboardData } from '../data/dashboardData.js';
import './ClaimsSummary.css';

const { claims } = dashboardData;

export default function ClaimsSummary() {
  const navigate = useNavigate();

  return (
    <section className="claims-summary" aria-label="Claims summary">
      <div className="claims-header">
        <h3 className="claims-title">Claims</h3>
        <button
          className="claims-view-btn"
          onClick={() => navigate('/policies')}
          aria-label="View all claims"
        >
          View claims <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>

      <div className="claims-stats">
        <div className="claims-stat">
          <div className="claims-stat-value">{claims.thisYear}</div>
          <div className="claims-stat-label">Claims this year</div>
        </div>
        <div className="claims-stat-divider" aria-hidden="true" />
        <div className="claims-stat">
          <div className="claims-stat-value">{claims.active}</div>
          <div className="claims-stat-label">Active claims</div>
        </div>
        <div className="claims-stat-divider" aria-hidden="true" />
        <div className="claims-stat">
          <div className="claims-stat-value claims-stat-value--muted">
            {claims.lastClaim || '—'}
          </div>
          <div className="claims-stat-label">Last claim</div>
        </div>
      </div>

      {claims.thisYear === 0 && (
        <div className="claims-empty" aria-live="polite">
          <Shield size={28} className="claims-empty-icon" aria-hidden="true" />
          <div className="claims-empty-text">No claims filed this year</div>
          <div className="claims-empty-sub">
            You are maintaining a clean claims record.
          </div>
        </div>
      )}
    </section>
  );
}
