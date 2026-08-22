import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RefreshCcw,
  Wallet,
  Sparkles,
  CheckCircle2,
  FilePlus,
  Car,
} from 'lucide-react';
import { dashboardData, formatINR } from '../data/dashboardData.js';
import './WelcomeSection.css';

const { user, policy, vehicle } = dashboardData;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function WelcomeSection({ onOpenEuler }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="welcome-hero-banner glass-panel"
    >
      <div className="welcome-hero-main">
        {/* Top greeting row */}
        <div className="welcome-hero-greeting-row">
          <div className="welcome-user-info">
            <div className="welcome-avatar-pill">
              <span className="welcome-avatar-letter">{user.name.charAt(0)}</span>
              <span className="welcome-online-pulse" />
            </div>
            <div>
              <h1 className="welcome-hero-title">
                {getGreeting()}, <span className="welcome-title-accent">{user.name}</span>
              </h1>
              <p className="welcome-hero-subtitle">
                Unified auto insurance command center & AI policy manager.
              </p>
            </div>
          </div>

          <div className="welcome-hero-badges">
            <div className="welcome-vehicle-chip">
              <Car size={15} className="welcome-chip-icon" />
              <span>{vehicle.make} {vehicle.model}</span>
              <span className="welcome-reg-tag mono">{vehicle.registration}</span>
            </div>

            <div className="welcome-hero-status-pill">
              <CheckCircle2 size={15} className="welcome-hero-status-icon" aria-hidden="true" />
              <span>Coverage Active</span>
            </div>
          </div>
        </div>

        {/* Quick Action Bento Grid */}
        <div className="welcome-bento-actions">
          {/* Action 1: New Insurance */}
          <motion.button
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="welcome-bento-card welcome-bento-card--primary"
            onClick={() => navigate('/new-insurance')}
          >
            <div className="welcome-bento-icon-wrap welcome-bento-icon--primary">
              <FilePlus size={18} />
            </div>
            <div className="welcome-bento-info">
              <span className="welcome-bento-title">Get New Insurance</span>
            </div>
          </motion.button>

          {/* Action 2: Renew ICICI */}
          <motion.button
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="welcome-bento-card welcome-bento-card--accent"
            onClick={() => navigate('/renewal')}
          >
            <div className="welcome-bento-icon-wrap welcome-bento-icon--accent">
              <RefreshCcw size={18} />
            </div>
            <div className="welcome-bento-info">
              <span className="welcome-bento-title">Renew with ICICI</span>
            </div>
          </motion.button>

          {/* Action 3: Insurance Wallet */}
          <motion.button
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="welcome-bento-card welcome-bento-card--neutral"
            onClick={() => navigate('/wallet')}
          >
            <div className="welcome-bento-icon-wrap welcome-bento-icon--teal">
              <Wallet size={18} />
            </div>
            <div className="welcome-bento-info">
              <span className="welcome-bento-title">Vault</span>
            </div>
          </motion.button>

          {/* Action 4: Euler AI Assistant */}
          <motion.button
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="welcome-bento-card welcome-bento-card--ai"
            onClick={() => {
              if (onOpenEuler) onOpenEuler();
              else {
                const btn = document.querySelector('.euler-launcher-btn');
                if (btn) btn.click();
              }
            }}
          >
            <div className="welcome-bento-icon-wrap welcome-bento-icon--sparkle">
              <Sparkles size={18} />
            </div>
            <div className="welcome-bento-info">
              <span className="welcome-bento-title">Ask Euler Copilot</span>
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
