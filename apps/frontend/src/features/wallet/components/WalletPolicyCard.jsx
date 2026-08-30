import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Calendar, Shield, Eye, RefreshCcw } from 'lucide-react';
import Badge from '../../../components/common/Badge.jsx';
import './WalletPolicyCard.css';

const STATUS_MAP = {
  active: { label: 'Active', tone: 'good' },
  'expiring-soon': { label: 'Expiring Soon', tone: 'warning' },
  expired: { label: 'Expired', tone: 'critical' },
};

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function WalletPolicyCard({ policy, onViewDetails }) {
  const status = STATUS_MAP[policy.status] || STATUS_MAP.active;

  return (
    <article className="wpolicy-card hover-lift" aria-label={`${policy.provider} ${policy.policyType}`}>
      {/* Provider header */}
      <div className="wpolicy-header">
        <div className="wpolicy-provider">
          <span className={`wpolicy-provider-badge wpolicy-provider-badge--${policy.providerType}`}>
            {policy.provider}
          </span>
          <span className="wpolicy-type">{policy.policyType}</span>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      {/* Policy body */}
      <div className="wpolicy-body">
        <div className="wpolicy-detail-grid">
          <div className="wpolicy-detail">
            <span className="wpolicy-detail-label">Policy Number</span>
            <span className="wpolicy-detail-value mono">{policy.policyNumber}</span>
          </div>
          <div className="wpolicy-detail">
            <span className="wpolicy-detail-label">Vehicle</span>
            <span className="wpolicy-detail-value">
              <Car size={13} /> {policy.vehicle.make} {policy.vehicle.model}
            </span>
          </div>
          <div className="wpolicy-detail">
            <span className="wpolicy-detail-label">Coverage</span>
            <span className="wpolicy-detail-value">
              <Shield size={13} /> {policy.coverageType}
            </span>
          </div>
          <div className="wpolicy-detail">
            <span className="wpolicy-detail-label">Premium</span>
            <span className="wpolicy-detail-value wpolicy-detail-value--premium">
              {formatINR(policy.premium)}/yr
            </span>
          </div>
          <div className="wpolicy-detail">
            <span className="wpolicy-detail-label">Renewal Date</span>
            <span className="wpolicy-detail-value">
              <Calendar size={13} /> {formatDate(policy.expiryDate)}
            </span>
          </div>
          <div className="wpolicy-detail">
            <span className="wpolicy-detail-label">Source</span>
            <span className="wpolicy-detail-value">
              {policy.providerType === 'synova' ? 'Synova Platform' : 'External Provider'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="wpolicy-actions">
        <button className="wpolicy-action-btn wpolicy-action-btn--secondary" onClick={onViewDetails}>
          <Eye size={14} />
          View Details
        </button>
        <Link to="/renewal" className="wpolicy-action-btn wpolicy-action-btn--primary">
          <RefreshCcw size={14} />
          Renew
        </Link>
      </div>
    </article>
  );
}
