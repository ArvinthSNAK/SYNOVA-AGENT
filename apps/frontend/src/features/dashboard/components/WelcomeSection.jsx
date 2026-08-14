import React from 'react';
import { dashboardData, getDaysUntilExpiry } from '../data/dashboardData.js';
import './WelcomeSection.css';

const { user, policy } = dashboardData;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function WelcomeSection() {
  const daysRemaining = getDaysUntilExpiry(policy.expiryDate);
  const isActive = policy.status === 'active';

  return (
    <div className="welcome-section">
      <div className="welcome-text">
        <h2 className="welcome-greeting">
          {getGreeting()}, {user.name}
        </h2>
        <p className="welcome-message">
          Your auto insurance is active and your vehicle is protected.
        </p>
      </div>
      <div className={`welcome-status ${isActive ? 'welcome-status--active' : 'welcome-status--inactive'}`}>
        <span className="welcome-status-dot" aria-hidden="true" />
        <span>{isActive ? 'Policy active' : 'Policy inactive'}</span>
      </div>
    </div>
  );
}
