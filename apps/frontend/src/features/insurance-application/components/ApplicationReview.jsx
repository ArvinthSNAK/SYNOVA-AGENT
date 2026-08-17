import React from 'react';
import { Edit2, Check, ChevronRight, User, Car, Shield, FileText } from 'lucide-react';
import './ApplicationReview.css';

function ReviewSection({ icon: Icon, title, onEdit, children }) {
  return (
    <div className="review-section">
      <div className="review-section-header">
        <div className="review-section-title-wrap">
          <div className="review-section-icon" aria-hidden="true">
            <Icon size={13} />
          </div>
          <h3 className="review-section-title">{title}</h3>
        </div>
        {onEdit && (
          <button
            className="review-edit-btn"
            onClick={onEdit}
            aria-label={`Edit ${title}`}
            type="button"
          >
            <Edit2 size={12} /> Edit
          </button>
        )}
      </div>
      <div className="review-section-body">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value, highlight }) {
  return (
    <div className="review-row">
      <span className="review-row-label">{label}</span>
      <span className={`review-row-value${highlight ? ' review-row-value--highlight' : ''}`}>
        {value || <span className="review-row-empty">—</span>}
      </span>
    </div>
  );
}

export default function ApplicationReview({
  vehicle,
  applicationId,
  estimatedPremium,
  userConfirmed,
  onConfirmChange,
  onGetQuotes,
  onEditVehicle,
  onBack,
}) {
  return (
    <div className="review-panel">
      <div className="review-header">
        <h2 className="review-title">Review Application</h2>
        <p className="review-sub">
          Confirm your information before retrieving live quotes from connected carriers.
        </p>
      </div>

      {/* Customer / Personal Information */}
      <ReviewSection icon={User} title="Customer Information">
        <ReviewRow label="Name" value="Naresh Kumar" />
        <ReviewRow label="Email" value="naresh.kumar@email.com" />
        <ReviewRow label="Phone" value="+91 98765 43210" />
      </ReviewSection>

      {/* Vehicle Information */}
      <ReviewSection icon={Car} title="Vehicle Information" onEdit={onEditVehicle}>
        <ReviewRow label="Make" value={vehicle.make} />
        <ReviewRow label="Model" value={vehicle.model} />
        <ReviewRow label="Year" value={vehicle.year} />
        <ReviewRow label="Fuel Type" value={vehicle.fuelType} />
        <ReviewRow label="Registration" value={vehicle.registrationNumber} />
        <ReviewRow label="City" value={vehicle.city} />
        {vehicle.variant && <ReviewRow label="Variant" value={vehicle.variant} />}
        <ReviewRow label="Ownership" value={vehicle.ownershipType} />
      </ReviewSection>

      {/* Carrier Quoting Notice */}
      <ReviewSection icon={Shield} title="Multi-Insurer Quoting">
        <div style={{ padding: '4px 0', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
          Quotes will be fetched in real time from <strong>ICICI Lombard, TATA AIG, ACKO, HDFC ERGO</strong>, and <strong>Bajaj Allianz</strong> with full coverage tier comparisons (Comprehensive, Third-Party, and Add-ons).
        </div>
      </ReviewSection>

      {/* Confirmation */}
      <div className="review-confirm-wrap">
        <label className="review-confirm-label" htmlFor="review-confirm-checkbox">
          <input
            id="review-confirm-checkbox"
            type="checkbox"
            className="review-confirm-checkbox"
            checked={userConfirmed}
            onChange={(e) => onConfirmChange(e.target.checked)}
          />
          <span className="review-confirm-custom-checkbox" aria-hidden="true">
            {userConfirmed && <Check size={11} />}
          </span>
          <span>
            I confirm that the vehicle details are accurate and authorize Synova to request quotes from partner insurers.
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="vi-actions">
        <button className="vi-btn vi-btn--secondary" onClick={onBack} type="button">
          ← Back
        </button>
        <button
          className={`vi-btn vi-btn--cta${!userConfirmed ? ' vi-btn--cta-disabled' : ''}`}
          onClick={onGetQuotes}
          disabled={!userConfirmed}
          type="button"
          aria-label={userConfirmed ? 'Get Quotes' : 'Confirm information before getting quotes'}
        >
          Get Quotes <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
