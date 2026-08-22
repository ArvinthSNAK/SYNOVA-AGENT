import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Calendar, Car, Motorbike, Shield, IndianRupee, FileText, RefreshCcw, Package } from 'lucide-react';
import Badge from '../../../components/common/Badge.jsx';
import './PolicyDetailsDrawer.css';

const STATUS_MAP = {
  active: { label: 'Active', tone: 'good' },
  'expiring-soon': { label: 'Expiring Soon', tone: 'warning' },
  expired: { label: 'Expired', tone: 'critical' },
};

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function PolicyDetailsDrawer({ policy, open, onClose }) {
  const drawerRef = useRef(null);

  // Trap focus and handle escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!policy) return null;

  const status = STATUS_MAP[policy.status] || STATUS_MAP.active;
  const VehicleIcon = policy.vehicle.type === 'two-wheeler' ? Motorbike : Car;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop${open ? ' drawer-backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        ref={drawerRef}
        className={`drawer-panel${open ? ' drawer-panel--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${policy.provider} policy details`}
      >
        {/* Header */}
        <div className="drawer-header">
          <div>
            <span className={`wpolicy-provider-badge wpolicy-provider-badge--${policy.providerType}`}>
              {policy.provider}
            </span>
            <h2 className="drawer-title">{policy.policyType}</h2>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close details">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="drawer-body">
          {/* Status */}
          <div className="drawer-status-row">
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>

          {/* Details */}
          <div className="drawer-details">
            <div className="drawer-detail-row">
              <span className="drawer-detail-label">Policy Number</span>
              <span className="drawer-detail-value mono">{policy.policyNumber}</span>
            </div>
            <div className="drawer-detail-row">
              <span className="drawer-detail-label">Vehicle</span>
              <span className="drawer-detail-value">
                <VehicleIcon size={14} /> {policy.vehicle.make} {policy.vehicle.model} {policy.vehicle.variant}
              </span>
            </div>
            <div className="drawer-detail-row">
              <span className="drawer-detail-label">Registration</span>
              <span className="drawer-detail-value mono">{policy.vehicle.registration}</span>
            </div>
            <div className="drawer-detail-row">
              <span className="drawer-detail-label">Coverage</span>
              <span className="drawer-detail-value">
                <Shield size={14} /> {policy.coverageType}
              </span>
            </div>
            <div className="drawer-detail-row">
              <span className="drawer-detail-label">Premium</span>
              <span className="drawer-detail-value drawer-detail-value--premium">
                <IndianRupee size={14} /> {formatINR(policy.premium)}/yr
              </span>
            </div>
            <div className="drawer-detail-row">
              <span className="drawer-detail-label">IDV</span>
              <span className="drawer-detail-value">{formatINR(policy.idv)}</span>
            </div>
            <div className="drawer-detail-row">
              <span className="drawer-detail-label">NCB</span>
              <span className="drawer-detail-value">{policy.ncb}%</span>
            </div>
            <div className="drawer-detail-row">
              <span className="drawer-detail-label">Start Date</span>
              <span className="drawer-detail-value">
                <Calendar size={14} /> {formatDate(policy.startDate)}
              </span>
            </div>
            <div className="drawer-detail-row">
              <span className="drawer-detail-label">Expiry Date</span>
              <span className="drawer-detail-value">
                <Calendar size={14} /> {formatDate(policy.expiryDate)}
              </span>
            </div>
          </div>

          {/* Add-ons */}
          {policy.addons && policy.addons.length > 0 && (
            <div className="drawer-addons">
              <h3 className="drawer-section-title">
                <Package size={14} /> Add-ons
              </h3>
              <div className="drawer-addon-list">
                {policy.addons.map((addon) => (
                  <span key={addon} className="drawer-addon-pill">{addon}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="drawer-footer">
          <Link to="/renewal" className="wpolicy-action-btn wpolicy-action-btn--primary" style={{ flex: 1, justifyContent: 'center' }}>
            <RefreshCcw size={14} />
            Renew Policy
          </Link>
          <button className="wpolicy-action-btn wpolicy-action-btn--secondary" style={{ flex: 1, justifyContent: 'center' }}>
            <FileText size={14} />
            View Document
          </button>
        </div>
      </aside>
    </>
  );
}
