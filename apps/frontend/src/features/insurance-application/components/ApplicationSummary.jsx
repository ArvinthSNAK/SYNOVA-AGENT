import React, { useState } from 'react';
import { Check, Circle, AlertTriangle, ChevronDown, ChevronUp, ShieldCheck, Plus } from 'lucide-react';
import { addonOptions, coverageOptions } from '../data/insuranceMockData.js';
import './ApplicationSummary.css';

// ─── Field status indicator ───────────────────────────────────────────────────
function FieldStatus({ value }) {
  if (value && String(value).trim()) {
    return (
      <span className="appsumm-field-status appsumm-field-status--complete" aria-label="Completed">
        <Check size={11} />
      </span>
    );
  }
  return (
    <span className="appsumm-field-status appsumm-field-status--required" aria-label="Required">
      <Circle size={10} />
    </span>
  );
}

// ─── Field row ────────────────────────────────────────────────────────────────
function FieldRow({ label, value, placeholder = 'Required' }) {
  return (
    <div className="appsumm-field-row">
      <span className="appsumm-field-label">{label}</span>
      <div className="appsumm-field-right">
        <span className={`appsumm-field-value${!value ? ' appsumm-field-value--empty' : ''}`}>
          {value || placeholder}
        </span>
        <FieldStatus value={value} />
      </div>
    </div>
  );
}

// ─── Main ApplicationSummary component ───────────────────────────────────────
export default function ApplicationSummary({
  applicationId,
  vehicle,
  coverage,
  estimatedPremium,
  currentStep,
}) {
  const [vehicleExpanded, setVehicleExpanded] = useState(true);
  const [coverageExpanded, setCoverageExpanded] = useState(true);

  const selectedCoverage = coverageOptions.find((c) => c.id === coverage.type);
  const selectedAddons = addonOptions.filter((a) => coverage.addons.includes(a.id));

  const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="appsumm" aria-label="Application summary">
      {/* Header */}
      <div className="appsumm-header">
        <div className="appsumm-header-top">
          <span className="appsumm-type-label">AUTO INSURANCE APPLICATION</span>
          <span className="appsumm-status-badge">Draft</span>
        </div>
        <div className="appsumm-id" aria-label={`Application ID: ${applicationId}`}>
          {applicationId || 'SYN-NEW-2026-00124'}
        </div>
      </div>

      {/* Vehicle Card */}
      <div className="appsumm-card">
        <button
          className="appsumm-card-header"
          onClick={() => setVehicleExpanded(!vehicleExpanded)}
          aria-expanded={vehicleExpanded}
          aria-controls="appsumm-vehicle-content"
        >
          <div className="appsumm-card-title-wrap">
            <div className="appsumm-card-icon" aria-hidden="true">
              <ShieldCheck size={13} />
            </div>
            <span className="appsumm-card-title">Vehicle Information</span>
          </div>
          {vehicleExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {vehicleExpanded && (
          <div className="appsumm-card-body" id="appsumm-vehicle-content">
            <FieldRow label="Make" value={vehicle.make} />
            <FieldRow label="Model" value={vehicle.model} />
            <FieldRow label="Year" value={vehicle.year} />
            <FieldRow label="Fuel Type" value={vehicle.fuelType} />
            <FieldRow label="Registration" value={vehicle.registrationNumber} />
            <FieldRow label="City" value={vehicle.city} />
            {vehicle.variant && <FieldRow label="Variant" value={vehicle.variant} />}
          </div>
        )}
      </div>

      {/* Coverage Card */}
      {currentStep >= 2 && (
        <div className="appsumm-card">
          <button
            className="appsumm-card-header"
            onClick={() => setCoverageExpanded(!coverageExpanded)}
            aria-expanded={coverageExpanded}
            aria-controls="appsumm-coverage-content"
          >
            <div className="appsumm-card-title-wrap">
              <div className="appsumm-card-icon" aria-hidden="true">
                <ShieldCheck size={13} />
              </div>
              <span className="appsumm-card-title">Coverage</span>
            </div>
            {coverageExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {coverageExpanded && (
            <div className="appsumm-card-body" id="appsumm-coverage-content">
              {coverage.type ? (
                <>
                  <div className="appsumm-coverage-type">
                    <Check size={13} className="appsumm-check" aria-hidden="true" />
                    {selectedCoverage?.label || coverage.type}
                  </div>
                  {selectedAddons.length > 0 && (
                    <div className="appsumm-addons">
                      <span className="appsumm-addons-label">Add-ons</span>
                      {selectedAddons.map((addon) => (
                        <div key={addon.id} className="appsumm-addon-item">
                          <Check size={11} className="appsumm-check" aria-hidden="true" />
                          {addon.label}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="appsumm-empty-field">
                  <Circle size={12} aria-hidden="true" />
                  Coverage not selected
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Premium estimate */}
      {estimatedPremium && (
        <div className="appsumm-premium">
          <div className="appsumm-premium-label">
            Estimated premium
            <span className="appsumm-premium-note">*</span>
          </div>
          <div className="appsumm-premium-amount">{formatINR(estimatedPremium)}</div>
          <div className="appsumm-premium-period">per year</div>
          <p className="appsumm-premium-disclaimer">
            * Estimate only. Final premium available after quote comparison.
          </p>
        </div>
      )}

      {/* Security notice */}
      <div className="appsumm-security">
        <ShieldCheck size={12} aria-hidden="true" />
        <span>Your information is securely processed.</span>
      </div>
    </div>
  );
}
