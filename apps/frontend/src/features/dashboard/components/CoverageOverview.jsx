import React from 'react';
import { Check, X } from 'lucide-react';
import { dashboardData } from '../data/dashboardData.js';
import './CoverageOverview.css';

const { coverage, addons } = dashboardData;

export default function CoverageOverview() {
  return (
    <section className="coverage-overview" aria-label="Coverage overview">
      <h3 className="coverage-title">Your Coverage</h3>

      <div className="coverage-group">
        <div className="coverage-group-label">Base Coverage</div>
        <div className="coverage-items">
          {coverage.map((item) => (
            <div
              key={item.id}
              className={`coverage-item${item.included ? ' coverage-item--included' : ' coverage-item--excluded'}`}
            >
              <span className="coverage-item-icon" aria-hidden="true">
                {item.included ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
              </span>
              <span className="coverage-item-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="coverage-divider" />

      <div className="coverage-group">
        <div className="coverage-group-label">Add-ons</div>
        <div className="coverage-items">
          {addons.map((item) => (
            <div
              key={item.id}
              className={`coverage-item coverage-item--addon${item.included ? ' coverage-item--included' : ' coverage-item--excluded'}`}
            >
              <span className="coverage-item-icon" aria-hidden="true">
                {item.included ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
              </span>
              <span className="coverage-item-label">{item.label}</span>
              {!item.included && <span className="coverage-item-badge">Not included</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
