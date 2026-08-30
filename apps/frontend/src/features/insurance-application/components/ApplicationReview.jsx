import React from 'react';
import { Edit2, Check, ChevronRight, User, Car, Shield, FileText } from 'lucide-react';
import { coverageOptions, addonOptions } from '../data/insuranceMockData.js';
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
        <button
          className="review-edit-btn"
          onClick={onEdit}
          aria-label={`Edit ${title}`}
          type="button"
        >
          <Edit2 size={12} /> Edit
        </button>
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
  coverage,
  applicationId,
  estimatedPremium,
  userConfirmed,
  onConfirmChange,
  onGetQuotes,
  onEditVehicle,
  onEditCoverage,
  onBack,
}) {
  const selectedCoverage = coverageOptions.find((c) => c.id === coverage.type);
  const selectedAddons = addonOptions.filter((a) => coverage.addons.includes(a.id));

  const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="review-panel">
      <div className="review-header">
        <h2 className="review-title">Review Application</h2>
        <p className="review-sub">
          Confirm everything looks right. You can edit any section before getting quotes.
        </p>
      </div>

      {/* Personal Information */}
      <ReviewSection icon={User} title="Personal Information" onEdit={() => {}}>
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

      {/* Coverage */}
      <ReviewSection icon={Shield} title="Coverage" onEdit={onEditCoverage}>
        <ReviewRow label="Coverage Type" value={selectedCoverage?.label} highlight />
        {selectedAddons.length > 0 ? (
          <div className="review-addons">
            <span className="review-addons-label">Add-ons</span>
            {selectedAddons.map((a) => (
              <div key={a.id} className="review-addon-item">
                <Check size={11} className="review-addon-check" aria-hidden="true" />
                {a.label}
              </div>
            ))}
          </div>
        ) : (
          <ReviewRow label="Add-ons" value="None selected" />
        )}
      </ReviewSection>

      {/* Estimated premium */}
      {estimatedPremium && (
        <div className="review-premium">
          <div className="review-premium-label">Estimated Premium</div>
          <div className="review-premium-amount">{formatINR(estimatedPremium)}</div>
          <div className="review-premium-note">per year · estimate only, final premium varies by insurer</div>
        </div>
      )}

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
            I confirm that the information provided is accurate and I authorize Synova to use it for insurance comparison.
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
