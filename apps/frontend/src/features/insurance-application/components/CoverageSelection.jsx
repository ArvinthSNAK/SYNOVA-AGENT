import React from 'react';
import { Check, ChevronRight, Sparkles, Plus, Minus } from 'lucide-react';
import { coverageOptions, addonOptions } from '../data/insuranceMockData.js';
import './CoverageSelection.css';

// ─── CoverageCard ─────────────────────────────────────────────────────────────
function CoverageCard({ option, selected, onSelect }) {
  const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <button
      className={`coverage-card${selected ? ' coverage-card--selected' : ''}${option.isRecommended ? ' coverage-card--recommended' : ''}`}
      onClick={() => onSelect(option.id)}
      aria-pressed={selected}
      aria-label={`${option.label} coverage${option.isRecommended ? ' — Recommended' : ''}`}
      type="button"
    >
      {option.isRecommended && (
        <div className="coverage-card-badge">Recommended</div>
      )}
      <div className="coverage-card-top">
        <div className="coverage-card-check" aria-hidden="true">
          {selected ? <Check size={13} /> : null}
        </div>
        <div className="coverage-card-info">
          <div className="coverage-card-label">{option.label}</div>
          <div className="coverage-card-tagline">{option.tagline}</div>
        </div>
      </div>
      <p className="coverage-card-desc">{option.description}</p>
      <ul className="coverage-card-features" aria-label="Coverage features">
        {option.features.map((f) => (
          <li key={f} className="coverage-card-feature">
            <Check size={11} aria-hidden="true" />
            {f}
          </li>
        ))}
      </ul>
      <div className="coverage-card-premium">
        <span className="coverage-card-from">from</span>
        <span className="coverage-card-price">{formatINR(option.estimatedPremium)}</span>
        <span className="coverage-card-period">/year</span>
      </div>
    </button>
  );
}

// ─── AddonRow ─────────────────────────────────────────────────────────────────
function AddonRow({ addon, selected, onToggle, disabled }) {
  const formatINR = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className={`addon-row${selected ? ' addon-row--selected' : ''}${disabled ? ' addon-row--disabled' : ''}`}>
      <div className="addon-row-info">
        <div className="addon-row-header">
          <span className="addon-row-label">{addon.label}</span>
          {addon.eulerRecommended && (
            <span className="addon-euler-badge">
              <Sparkles size={10} aria-hidden="true" /> Euler recommends
            </span>
          )}
        </div>
        <p className="addon-row-desc">{addon.description}</p>
        <div className="addon-row-price">{formatINR(addon.price)}/year</div>
      </div>
      <button
        className={`addon-toggle${selected ? ' addon-toggle--active' : ''}`}
        onClick={() => !disabled && onToggle(addon.id)}
        aria-pressed={selected}
        aria-label={`${selected ? 'Remove' : 'Add'} ${addon.label}`}
        disabled={disabled}
        type="button"
      >
        {selected ? <Minus size={13} /> : <Plus size={13} />}
        <span>{selected ? 'Added' : 'Add'}</span>
      </button>
    </div>
  );
}

// ─── CoverageSelection ────────────────────────────────────────────────────────
export default function CoverageSelection({
  coverageType,
  selectedAddons,
  onSelectCoverage,
  onToggleAddon,
  onContinue,
  onBack,
  vehicle,
}) {
  const availableAddons = addonOptions.filter(
    (a) => !coverageType || a.availableFor.includes(coverageType)
  );

  const eulerRecommendedAddons = availableAddons.filter((a) => a.eulerRecommended);

  return (
    <div className="coverage-panel">
      {/* Section: Coverage type */}
      <div className="coverage-section">
        <h2 className="coverage-section-title">Choose your coverage</h2>
        <p className="coverage-section-sub">
          Select the protection that fits your vehicle and driving needs.
        </p>

        <div className="coverage-cards-grid" role="group" aria-label="Insurance coverage options">
          {coverageOptions.map((option) => (
            <CoverageCard
              key={option.id}
              option={option}
              selected={coverageType === option.id}
              onSelect={onSelectCoverage}
            />
          ))}
        </div>
      </div>

      {/* Euler recommendation */}
      {coverageType && eulerRecommendedAddons.length > 0 && (
        <div className="coverage-euler-rec" role="note" aria-label="Euler recommendation">
          <div className="coverage-euler-rec-header">
            <Sparkles size={13} aria-hidden="true" />
            <span>Euler recommends</span>
          </div>
          <p className="coverage-euler-rec-text">
            Based on your {vehicle?.year} {vehicle?.make} {vehicle?.model}, the following add-ons may be useful.
          </p>
          <div className="coverage-euler-rec-actions">
            {eulerRecommendedAddons.filter((a) => !selectedAddons.includes(a.id)).map((addon) => (
              <button
                key={addon.id}
                className="coverage-euler-add-btn"
                onClick={() => onToggleAddon(addon.id)}
                type="button"
                aria-label={`Add ${addon.label}`}
              >
                <Plus size={12} /> Add {addon.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section: Add-ons */}
      {coverageType && (
        <div className="coverage-section">
          <h3 className="coverage-section-title coverage-section-title--sm">Enhance your coverage</h3>
          <p className="coverage-section-sub">Optional add-ons to customize your policy.</p>

          <div className="addon-list" role="group" aria-label="Coverage add-ons">
            {availableAddons.map((addon) => (
              <AddonRow
                key={addon.id}
                addon={addon}
                selected={selectedAddons.includes(addon.id)}
                onToggle={onToggleAddon}
                disabled={!coverageType}
              />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="vi-actions">
        <button className="vi-btn vi-btn--secondary" onClick={onBack} type="button">
          ← Back
        </button>
        <button
          className="vi-btn vi-btn--primary"
          onClick={onContinue}
          disabled={!coverageType}
          type="button"
        >
          Review Application <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
