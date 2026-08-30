import React from 'react';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'expiring-soon', label: 'Expiring Soon' },
  { key: 'expired', label: 'Expired' },
  { key: 'third-party', label: 'Third Party' },
  { key: 'synova', label: 'Synova' },
];

export default function WalletFilters({ active, onChange }) {
  return (
    <div className="wallet-filters" role="tablist" aria-label="Policy filters">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          className={`wallet-filter-pill${active === f.key ? ' wallet-filter-pill--active' : ''}`}
          role="tab"
          aria-selected={active === f.key}
          onClick={() => onChange(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
