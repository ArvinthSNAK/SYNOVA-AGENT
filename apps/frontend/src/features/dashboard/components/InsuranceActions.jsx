import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, RefreshCcw, Eye, Download } from 'lucide-react';
import './InsuranceActions.css';

export default function InsuranceActions() {
  const navigate = useNavigate();

  return (
    <div className="insurance-actions">
      <div className="actions-heading">What would you like to do?</div>
      <div className="actions-grid">
        <button
          className="action-card action-card--primary"
          onClick={() => navigate('/new-insurance')}
          aria-label="Get a new insurance policy"
        >
          <div className="action-card-icon">
            <Sparkles size={20} aria-hidden="true" />
          </div>
          <div className="action-card-content">
            <div className="action-card-title">Get New Insurance</div>
            <div className="action-card-desc">Start a new policy with Euler</div>
          </div>
        </button>

        <button
          className="action-card action-card--accent"
          onClick={() => navigate('/renewal')}
          aria-label="Renew your existing policy"
        >
          <div className="action-card-icon">
            <RefreshCcw size={20} aria-hidden="true" />
          </div>
          <div className="action-card-content">
            <div className="action-card-title">Renew Policy</div>
            <div className="action-card-desc">Renew without re-entering details</div>
          </div>
        </button>

        <button
          className="action-card action-card--ghost"
          onClick={() => navigate('/policies')}
          aria-label="View full policy details"
        >
          <div className="action-card-icon">
            <Eye size={20} aria-hidden="true" />
          </div>
          <div className="action-card-content">
            <div className="action-card-title">View Policy</div>
            <div className="action-card-desc">Full details and schedule</div>
          </div>
        </button>

        <button
          className="action-card action-card--ghost"
          onClick={() => navigate('/documents')}
          aria-label="Download your policy document"
        >
          <div className="action-card-icon">
            <Download size={20} aria-hidden="true" />
          </div>
          <div className="action-card-content">
            <div className="action-card-title">Download Policy</div>
            <div className="action-card-desc">PDF certificate & receipt</div>
          </div>
        </button>
      </div>
    </div>
  );
}
