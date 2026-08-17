import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, RefreshCcw, Wallet, ArrowRight, CheckCircle2 } from 'lucide-react';
import { dashboardData, formatINR } from '../data/dashboardData.js';
import './WelcomeSection.css';

const { user, policy } = dashboardData;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function WelcomeSection() {
  const navigate = useNavigate();

  return (
    <div className="welcome-hero-banner">
      <div className="welcome-hero-main">
        <div className="welcome-hero-greeting-row">
          <div>
            <h1 className="welcome-hero-title">
              {getGreeting()}, {user.name}
            </h1>
            <p className="welcome-hero-subtitle">
              Here’s your insurance overview across all registered vehicles.
            </p>
          </div>
          <div className="welcome-hero-status-pill">
            <CheckCircle2 size={16} className="welcome-hero-status-icon" aria-hidden="true" />
            <span>Your insurance is up to date</span>
          </div>
        </div>

        {/* Insurance at a Glance KPI band */}
        <div className="welcome-glance-grid">
          <div className="welcome-glance-card">
            <div className="welcome-glance-val">2</div>
            <div className="welcome-glance-lbl">Active Policies</div>
          </div>

          <div className="welcome-glance-card welcome-glance-card--highlight">
            <div className="welcome-glance-val">1</div>
            <div className="welcome-glance-lbl">Renewal in 43 Days</div>
          </div>

          <div className="welcome-glance-card">
            <div className="welcome-glance-val mono">{formatINR(policy.premium)}</div>
            <div className="welcome-glance-lbl">Annual Premium</div>
          </div>

          <div className="welcome-glance-card">
            <div className="welcome-glance-val">0</div>
            <div className="welcome-glance-lbl">Claims this Year</div>
          </div>
        </div>
      </div>

      {/* Contextual Action Strip */}
      <div className="welcome-hero-actions">
        <button
          className="welcome-action-cta welcome-action-cta--accent"
          onClick={() => navigate('/renewal')}
        >
          <RefreshCcw size={16} aria-hidden="true" />
          <span>Renew ICICI Lombard</span>
          <ArrowRight size={14} aria-hidden="true" />
        </button>

        <button
          className="welcome-action-cta welcome-action-cta--secondary"
          onClick={() => navigate('/wallet')}
        >
          <Wallet size={16} aria-hidden="true" />
          <span>View Wallet (3 Policies)</span>
        </button>
      </div>
    </div>
  );
}
