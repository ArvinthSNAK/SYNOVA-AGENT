import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ShieldAlert, FileCheck2, ArrowRight } from 'lucide-react';
import './UpcomingActions.css';

const upcomingEvents = [
  {
    id: 'ev-1',
    title: 'Policy Renewal Due in 43 Days',
    subtitle: 'ICICI Lombard · Comprehensive Auto Insurance',
    due: '25 Sep 2026',
    type: 'warning',
    cta: 'Renew Now',
    route: '/renewal',
  },
  {
    id: 'ev-2',
    title: 'Vehicle Document Verification Ready',
    subtitle: 'Hyundai Creta · RC Extracted by Euler',
    due: 'Completed',
    type: 'success',
    cta: 'Review',
    route: '/new-insurance',
  },
  {
    id: 'ev-3',
    title: 'Annual Premium Due Date',
    subtitle: 'Preserve your 20% No Claim Bonus',
    due: '25 Sep 2026',
    type: 'neutral',
    cta: 'View Details',
    route: '/policies',
  },
];

export default function UpcomingActions() {
  const navigate = useNavigate();

  return (
    <div className="upcoming-section" role="region" aria-label="Upcoming Actions">
      <div className="upcoming-head">
        <div className="upcoming-head-left">
          <Clock size={16} className="upcoming-icon" aria-hidden="true" />
          <h3 className="upcoming-title">Upcoming</h3>
        </div>
        <span className="upcoming-badge">{upcomingEvents.length} actions</span>
      </div>

      <div className="upcoming-list">
        {upcomingEvents.map((ev) => (
          <div key={ev.id} className={`upcoming-card upcoming-card--${ev.type}`}>
            <div className="upcoming-card-content">
              <span className="upcoming-card-title">{ev.title}</span>
              <span className="upcoming-card-sub">{ev.subtitle}</span>
              <span className="upcoming-card-due">Due: {ev.due}</span>
            </div>
            <button
              className="upcoming-card-cta"
              onClick={() => navigate(ev.route)}
              aria-label={`${ev.cta} - ${ev.title}`}
            >
              <span>{ev.cta}</span>
              <ArrowRight size={12} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
