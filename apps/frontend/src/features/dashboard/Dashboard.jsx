import React, { useState } from 'react';
import UserNavbar from '../../components/layout/UserNavbar.jsx';
import WelcomeSection from './components/WelcomeSection.jsx';
import InsuranceHero from './components/InsuranceHero.jsx';
import DashboardWorkspace from './components/DashboardWorkspace.jsx';
import EulerLauncher from './components/EulerLauncher.jsx';
import EulerChat from './components/EulerChat.jsx';
import './Dashboard.css';

export default function Dashboard() {
  const [eulerOpen, setEulerOpen] = useState(false);

  const handleOpenEulerWithPrompt = (promptText) => {
    setEulerOpen(true);
  };

  return (
    <div className="dashboard-layout mesh-ambient-bg">
      {/* Top Navbar with Overview, Wallet, Policies, Applications (No Sidebar) */}
      <UserNavbar />

      {/* Main content area */}
      <main className="dashboard-content" id="main-content" tabIndex={-1}>
        <div className="dashboard-container">
          {/* 1. Modern Bento Welcome & Quick Actions */}
          <WelcomeSection onOpenEuler={() => setEulerOpen(true)} />

          {/* 2. Interactive InsurTech Bento Grid */}
          <div className="dashboard-bento-grid">
            {/* Main Column: Active Insurance Command Center */}
            <div className="dashboard-bento-main">
              <InsuranceHero />
            </div>

            {/* Side Column: Multi-tab Application Tracker, Vault & Euler Capsule */}
            <div className="dashboard-bento-side">
              <DashboardWorkspace onOpenEuler={handleOpenEulerWithPrompt} />
            </div>
          </div>
        </div>
      </main>

      {/* Euler floating assistant */}
      <EulerLauncher onClick={() => setEulerOpen(!eulerOpen)} />
      <EulerChat open={eulerOpen} onClose={() => setEulerOpen(false)} />
    </div>
  );
}
