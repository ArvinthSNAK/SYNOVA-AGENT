import React from 'react';
import {
  dashboardData,
  formatDate,
  formatINR,
  formatINRShort,
} from '../data/dashboardData.js';
import './PolicyDetails.css';

const { policy, vehicle } = dashboardData;

const fields = [
  { label: 'Policy Number', value: policy.id, mono: true },
  { label: 'Insurer', value: policy.insurer },
  { label: 'Policy Type', value: policy.typeShort },
  { label: 'Registration', value: vehicle.registration, mono: true },
  { label: 'Policy Start', value: formatDate(policy.startDate) },
  { label: 'Policy Expiry', value: formatDate(policy.expiryDate) },
  { label: 'Annual Premium', value: formatINR(policy.premium), highlight: true },
  { label: 'IDV (Insured Value)', value: formatINRShort(policy.idv) },
  { label: 'No Claim Bonus', value: `${policy.ncb}%` },
  { label: 'Compulsory Deductible', value: formatINR(policy.deductible) },
];

export default function PolicyDetails() {
  return (
    <section className="policy-details" aria-label="Policy details">
      <h3 className="policy-details-title">Policy Details</h3>

      <div className="policy-details-grid">
        {fields.map((field) => (
          <div key={field.label} className="policy-detail-field">
            <div className="policy-field-label">{field.label}</div>
            <div
              className={`policy-field-value${field.mono ? ' policy-field-mono' : ''}${field.highlight ? ' policy-field-highlight' : ''}`}
            >
              {field.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
