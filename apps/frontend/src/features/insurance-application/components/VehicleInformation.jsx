import React, { useState } from 'react';
import { Check, Edit2, AlertTriangle, ChevronRight, X } from 'lucide-react';
import {
  vehicleMakes, fuelTypes, ownershipTypes, indianCities,
} from '../data/insuranceMockData.js';
import { validateVehicleForm } from '../utils/validation.js';
import VehicleDocumentUpload from './VehicleDocumentUpload.jsx';
import './VehicleInformation.css';

// ─── Field status ─────────────────────────────────────────────────────────────
function FieldStatus({ value, error }) {
  if (error) {
    return <span className="vi-field-status vi-field-status--error" aria-label="Error"><AlertTriangle size={12} /></span>;
  }
  if (value && String(value).trim()) {
    return <span className="vi-field-status vi-field-status--complete" aria-label="Complete"><Check size={12} /></span>;
  }
  return <span className="vi-field-status vi-field-status--empty" aria-label="Required" />;
}

// ─── Form input ───────────────────────────────────────────────────────────────
function FormField({ id, label, required, error, children }) {
  return (
    <div className="vi-field">
      <label htmlFor={id} className="vi-field-label">
        {label}
        {required && <span className="vi-field-required" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <span className="vi-field-error" role="alert">{error}</span>
      )}
    </div>
  );
}

// ─── VehicleInformation ───────────────────────────────────────────────────────
export default function VehicleInformation({
  vehicle,
  onUpdateVehicle,
  onSetVehicle,
  inputMode,
  extractionData,
  documentExtraction,
  onDocumentUpload,
  onContinue,
  vehicleComplete,
}) {
  const [touched, setTouched] = useState({});
  const [editMode, setEditMode] = useState(false);

  const validation = validateVehicleForm(vehicle);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const fieldError = (field) => {
    return touched[field] ? validation.errors[field] : '';
  };

  const handleContinue = () => {
    // Mark all required fields as touched
    setTouched({
      registrationNumber: true,
      make: true,
      model: true,
      year: true,
      fuelType: true,
      city: true,
    });
    if (vehicleComplete) {
      onContinue();
    }
  };

  // ─── Extraction review mode ───────────────────────────────────────────────
  if (inputMode === 'euler' && extractionData && !editMode) {
    return (
      <div className="vi-panel">
        <div className="vi-section-header">
          <h2 className="vi-section-title">Vehicle Information</h2>
          <button className="vi-edit-btn" onClick={() => setEditMode(true)} aria-label="Edit vehicle details">
            <Edit2 size={13} /> Edit
          </button>
        </div>

        <div className="vi-extraction-review">
          <p className="vi-extraction-review-note">
            Euler extracted the following from your description. Review and edit if needed.
          </p>

          <div className="vi-extraction-fields">
            {[
              ['Make', 'make'],
              ['Model', 'model'],
              ['Year', 'year'],
              ['Fuel Type', 'fuelType'],
              ['City', 'city'],
              ['Registration No.', 'registrationNumber'],
              ['Variant', 'variant'],
            ].map(([label, key]) => (
              <div key={key} className="vi-extraction-row">
                <span className="vi-extraction-label">{label}</span>
                <div className="vi-extraction-value-wrap">
                  {vehicle[key] ? (
                    <>
                      <Check size={12} className="vi-check" aria-hidden="true" />
                      <span className="vi-extraction-value">{vehicle[key]}</span>
                    </>
                  ) : (
                    <span className="vi-extraction-missing">Not provided</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="vi-actions">
          <button
            className="vi-btn vi-btn--secondary"
            onClick={() => setEditMode(true)}
          >
            <Edit2 size={13} /> Edit Details
          </button>
          <button
            className="vi-btn vi-btn--primary"
            onClick={handleContinue}
            disabled={!vehicleComplete}
          >
            Continue to Coverage <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // ─── Upload mode ──────────────────────────────────────────────────────────
  if (inputMode === 'upload' && !editMode) {
    return (
      <div className="vi-panel">
        <div className="vi-section-header">
          <h2 className="vi-section-title">Vehicle Information</h2>
        </div>

        <VehicleDocumentUpload
          onUpload={onDocumentUpload}
          extractionStatus={documentExtraction.status}
          extractedData={documentExtraction.data}
          vehicle={vehicle}
          onEditManually={() => setEditMode(true)}
          onContinue={handleContinue}
          vehicleComplete={vehicleComplete}
        />
      </div>
    );
  }

  // ─── Manual form ──────────────────────────────────────────────────────────
  return (
    <div className="vi-panel">
      <div className="vi-section-header">
        <h2 className="vi-section-title">Vehicle Information</h2>
        {extractionData && (
          <button className="vi-back-btn" onClick={() => setEditMode(false)}>
            <X size={13} /> Cancel
          </button>
        )}
      </div>

      <form
        className="vi-form"
        onSubmit={(e) => { e.preventDefault(); handleContinue(); }}
        noValidate
      >
        {/* Section: Vehicle Basics */}
        <div className="vi-form-section">
          <h3 className="vi-form-section-title">Vehicle Basics</h3>
          <div className="vi-form-grid">
            <FormField id="vi-make" label="Vehicle Make" required error={fieldError('make')}>
              <div className="vi-select-wrap">
                <select
                  id="vi-make"
                  className={`vi-select${fieldError('make') ? ' vi-input--error' : ''}`}
                  value={vehicle.make}
                  onChange={(e) => onUpdateVehicle('make', e.target.value)}
                  onBlur={() => handleBlur('make')}
                  aria-required="true"
                  aria-describedby={fieldError('make') ? 'vi-make-error' : undefined}
                >
                  <option value="">Select make</option>
                  {vehicleMakes.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </FormField>

            <FormField id="vi-model" label="Vehicle Model" required error={fieldError('model')}>
              <input
                id="vi-model"
                type="text"
                className={`vi-input${fieldError('model') ? ' vi-input--error' : ''}`}
                placeholder="e.g., Creta, Swift, Nexon"
                value={vehicle.model}
                onChange={(e) => onUpdateVehicle('model', e.target.value)}
                onBlur={() => handleBlur('model')}
                aria-required="true"
              />
            </FormField>

            <FormField id="vi-year" label="Manufacturing Year" required error={fieldError('year')}>
              <input
                id="vi-year"
                type="number"
                className={`vi-input${fieldError('year') ? ' vi-input--error' : ''}`}
                placeholder="e.g., 2023"
                value={vehicle.year}
                onChange={(e) => onUpdateVehicle('year', e.target.value)}
                onBlur={() => handleBlur('year')}
                min="1990"
                max={new Date().getFullYear() + 1}
                aria-required="true"
              />
            </FormField>

            <FormField id="vi-fuel" label="Fuel Type" required error={fieldError('fuelType')}>
              <div className="vi-select-wrap">
                <select
                  id="vi-fuel"
                  className={`vi-select${fieldError('fuelType') ? ' vi-input--error' : ''}`}
                  value={vehicle.fuelType}
                  onChange={(e) => onUpdateVehicle('fuelType', e.target.value)}
                  onBlur={() => handleBlur('fuelType')}
                  aria-required="true"
                >
                  <option value="">Select fuel type</option>
                  {fuelTypes.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </FormField>
          </div>
        </div>

        {/* Section: Registration */}
        <div className="vi-form-section">
          <h3 className="vi-form-section-title">Registration Details</h3>
          <div className="vi-form-grid">
            <FormField id="vi-reg" label="Registration Number" required error={fieldError('registrationNumber')}>
              <input
                id="vi-reg"
                type="text"
                className={`vi-input${fieldError('registrationNumber') ? ' vi-input--error' : ''}`}
                placeholder="e.g., KA-01-XX-0000"
                value={vehicle.registrationNumber}
                onChange={(e) => onUpdateVehicle('registrationNumber', e.target.value.toUpperCase())}
                onBlur={() => handleBlur('registrationNumber')}
                aria-required="true"
                maxLength={13}
              />
            </FormField>

            <FormField id="vi-city" label="Registration City" required error={fieldError('city')}>
              <div className="vi-select-wrap">
                <select
                  id="vi-city"
                  className={`vi-select${fieldError('city') ? ' vi-input--error' : ''}`}
                  value={vehicle.city}
                  onChange={(e) => onUpdateVehicle('city', e.target.value)}
                  onBlur={() => handleBlur('city')}
                  aria-required="true"
                >
                  <option value="">Select city</option>
                  {indianCities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </FormField>
          </div>
        </div>

        {/* Section: Additional */}
        <div className="vi-form-section">
          <h3 className="vi-form-section-title">Additional Details <span className="vi-optional-tag">Optional</span></h3>
          <div className="vi-form-grid">
            <FormField id="vi-variant" label="Variant">
              <input
                id="vi-variant"
                type="text"
                className="vi-input"
                placeholder="e.g., SX(O) Turbo"
                value={vehicle.variant}
                onChange={(e) => onUpdateVehicle('variant', e.target.value)}
              />
            </FormField>

            <FormField id="vi-ownership" label="Ownership Type">
              <div className="vi-select-wrap">
                <select
                  id="vi-ownership"
                  className="vi-select"
                  value={vehicle.ownershipType}
                  onChange={(e) => onUpdateVehicle('ownershipType', e.target.value)}
                >
                  {ownershipTypes.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </FormField>
          </div>
        </div>

        <div className="vi-actions">
          <button
            type="submit"
            className="vi-btn vi-btn--primary"
            disabled={!vehicleComplete && Object.keys(touched).length > 0}
          >
            Continue to Coverage <ChevronRight size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
