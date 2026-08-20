import React from 'react';
import { Search } from 'lucide-react';

export default function WalletSearch({ value, onChange }) {
  return (
    <div className="wallet-search">
      <Search size={16} className="wallet-search-icon" aria-hidden="true" />
      <input
        type="search"
        className="wallet-search-input"
        placeholder="Search by provider, policy number, or vehicle..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search policies"
      />
    </div>
  );
}
