import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle, Clock, Circle } from 'lucide-react';
import UserNavbar from '../components/layout/UserNavbar.jsx';
import EulerLauncher from '../features/dashboard/components/EulerLauncher.jsx';
import { dashboardData } from '../features/dashboard/data/dashboardData.js';
import './ApplicationsPage.css';

const stepStatusIcons = {
  completed: CheckCircle,
  current: Clock,
  pending: Circle,
};

const STATUS_LABELS = {
  quotes_generated: 'Quotes Generated',
  submitted: 'Submitted',
  under_review: 'Under Review',
  completed: 'Completed',
};

export default function ApplicationsPage() {
  const { application } = dashboardData;
  const completedCount = application.steps.filter((s) => s.status === 'completed').length;
  const progressPct = Math.round((completedCount / application.steps.length) * 100);

  return (
    <div className="dashboard-layout mesh-ambient-bg">
      <UserNavbar />

      <main className="applications-content" id="main-content" tabIndex={-1}>
        <div className="applications-header">
          <div className="applications-icon-wrap" aria-hidden="true">
            <ClipboardList size={22} />
          </div>
          <div>
            <h1 className="applications-title">Application Tracking</h1>
            <p className="applications-subtitle">Follow your application from submission to a bound policy.</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="application-summary-card glass-card-interactive"
        >
          <div className="application-summary-top">
            <span className="application-summary-id mono">{application.id}</span>
            <span className="application-summary-status">
              {STATUS_LABELS[application.status] || application.status}
            </span>
          </div>
          <h2 className="application-summary-title">{application.title}</h2>
          <div className="application-progress-bar-track">
            <motion.div
              className="application-progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <span className="application-progress-label">
            {progressPct}% complete · Submitted {application.submittedDate}
          </span>
        </motion.div>

        <div className="application-timeline">
          {application.steps.map((step, idx) => {
            const Icon = stepStatusIcons[step.status] || Circle;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                className={`application-step application-step--${step.status}`}
              >
                <div className="application-step-icon-wrap">
                  <Icon size={16} />
                  {idx < application.steps.length - 1 && <span className="application-step-line" />}
                </div>
                <div className="application-step-text">
                  <span className="application-step-name">{step.label}</span>
                  {step.date && <span className="application-step-date">{step.date}</span>}
                </div>
                {step.status === 'current' && (
                  <span className="application-step-live-pill">In Progress</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </main>

      <EulerLauncher />
    </div>
  );
}
