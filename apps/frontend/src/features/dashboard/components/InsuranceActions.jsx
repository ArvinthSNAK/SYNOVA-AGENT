import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, RefreshCcw, Wallet, FileText } from 'lucide-react';
import './InsuranceActions.css';

export default function InsuranceActions() {
  const navigate = useNavigate();

  return (
    <div className="quick-actions-bar" role="region" aria-label="Quick Actions">
      <div className="quick-actions-grid">
        {/* 1. New Insurance */}
        <button
          className="quick-action-card quick-action-card--primary"
          onClick={() => navigate('/new-insurance')}
          aria-label="Get New Insurance with AI Copilot"
        >
          <div className="quick-action-icon-box">
            <Sparkles size={20} aria-hidden="true" />
          </div>
          <div className="quick-action-text">
            <span className="quick-action-title">Get New Insurance</span>
            <span className="quick-action-desc">Instant quotes across 5 carriers</span>
          </div>
        </button>

        {/* 2. Renew Insurance */}
        <button
          className="quick-action-card quick-action-card--accent"
          onClick={() => navigate('/renewal')}
          aria-label="Renew Insurance policy"
        >
          <div className="quick-action-icon-box">
            <RefreshCcw size={20} aria-hidden="true" />
          </div>
          <div className="quick-action-text">
            <span className="quick-action-title">Renew Insurance</span>
            <span className="quick-action-desc">1-click renewal with preserved NCB</span>
          </div>
        </button>

        {/* 3. My Wallet */}
        <button
          className="quick-action-card"
          onClick={() => navigate('/wallet')}
          aria-label="View Insurance Wallet"
        >
          <div className="quick-action-icon-box quick-action-icon-box--teal">
            <Wallet size={20} aria-hidden="true" />
          </div>
          <div className="quick-action-text">
            <span className="quick-action-title">Insurance Wallet</span>
            <span className="quick-action-desc">3 active & external policies</span>
          </div>
        </button>

        {/* 4. Claims & Policy Docs */}
        <button
          className="quick-action-card"
          onClick={() => navigate('/policies')}
          aria-label="View Policies & Claims"
        >
          <div className="quick-action-icon-box quick-action-icon-box--blue">
            <FileText size={20} aria-hidden="true" />
          </div>
          <div className="quick-action-text">
            <span className="quick-action-title">Policies & Claims</span>
            <span className="quick-action-desc">View coverage schedules & tax docs</span>
          </div>
        </button>
      </div>
    </div>
  );
}
