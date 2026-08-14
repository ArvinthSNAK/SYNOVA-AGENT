import React, { useState } from 'react';
import DashboardSidebar from './components/DashboardSidebar.jsx';
import DashboardHeader from './components/DashboardHeader.jsx';
import WelcomeSection from './components/WelcomeSection.jsx';
import InsuranceHero from './components/InsuranceHero.jsx';
import InsuranceActions from './components/InsuranceActions.jsx';
import NewInsuranceSection from './components/NewInsuranceSection.jsx';
import RenewalSection from './components/RenewalSection.jsx';
import CoverageOverview from './components/CoverageOverview.jsx';
import PolicyDetails from './components/PolicyDetails.jsx';
import ApplicationTimeline from './components/ApplicationTimeline.jsx';
import ClaimsSummary from './components/ClaimsSummary.jsx';
import DocumentsSummary from './components/DocumentsSummary.jsx';
import RecentActivity from './components/RecentActivity.jsx';
import EulerLauncher from './components/EulerLauncher.jsx';
import './Dashboard.css';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="dashboard-main">
        {/* Sticky header */}
        <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Scrollable content */}
        <main className="dashboard-content" id="main-content" tabIndex={-1}>
          {/* 1. Welcome section */}
          <WelcomeSection />

          {/* 2. Top Primary Actions & Quick Insurance CTAs immediately below Welcome */}
          <section className="dashboard-top-actions">
            <InsuranceActions />
          </section>

          {/* 2-column layout: left = main, right = sidebar */}
          <div className="dashboard-grid">
            {/* Main column */}
            <div className="dashboard-col-main">
              {/* 3. Active Insurance Hero centerpiece */}
              <InsuranceHero />

              {/* 4. Dedicated Get New Insurance Feature Block */}
              <NewInsuranceSection />

              {/* 5. Application Timeline */}
              <section className="dashboard-section">
                <ApplicationTimeline />
              </section>

              {/* 6. Coverage */}
              <section className="dashboard-section">
                <CoverageOverview />
              </section>

              {/* 7. Policy Details */}
              <section className="dashboard-section">
                <PolicyDetails />
              </section>
            </div>

            {/* Sidebar column */}
            <div className="dashboard-col-side">
              {/* Renewal Section */}
              <RenewalSection />

              {/* Claims */}
              <section className="dashboard-section">
                <ClaimsSummary />
              </section>

              {/* Documents */}
              <section className="dashboard-section">
                <DocumentsSummary />
              </section>

              {/* Recent Activity */}
              <section className="dashboard-section">
                <RecentActivity />
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Euler floating assistant */}
      <EulerLauncher />
    </div>
  );
}
