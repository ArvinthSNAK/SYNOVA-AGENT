import React from 'react';
import { Shield, AlertTriangle, TrendingUp, IndianRupee } from 'lucide-react';
import './WalletSummary.css';

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function WalletSummary({ summary }) {
  const cards = [
    { label: 'Total Policies', value: summary.totalPolicies, icon: Shield, color: 'primary' },
    { label: 'Active Policies', value: summary.activePolicies, icon: TrendingUp, color: 'success' },
    { label: 'Expiring Soon', value: summary.expiringSoon, icon: AlertTriangle, color: 'warning' },
    { label: 'Total Annual Premium', value: formatINR(summary.totalAnnualPremium), icon: IndianRupee, color: 'accent' },
  ];

  return (
    <div className="wallet-summary" role="region" aria-label="Portfolio summary">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className={`wallet-summary-card wallet-summary-card--${card.color}`}>
            <div className="wallet-summary-icon" aria-hidden="true">
              <Icon size={18} />
            </div>
            <div className="wallet-summary-info">
              <span className="wallet-summary-label">{card.label}</span>
              <span className="wallet-summary-value">{card.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
