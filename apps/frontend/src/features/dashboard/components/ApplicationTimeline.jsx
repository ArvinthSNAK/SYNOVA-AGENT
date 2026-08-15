import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, Clock, ChevronRight } from 'lucide-react';
import { dashboardData } from '../data/dashboardData.js';
import './ApplicationTimeline.css';

const { application } = dashboardData;

const stepStatusIcons = {
  completed: CheckCircle,
  current: Clock,
  pending: Circle,
};

export default function ApplicationTimeline() {
  const navigate = useNavigate();

  return (
    <section className="application-timeline" aria-label="Application status">
      <div className="timeline-header">
        <div>
          <h3 className="timeline-title">Application Status</h3>
          <div className="timeline-app-id">
            {application.id} &middot; {application.title}
          </div>
        </div>
        <button
          className="timeline-view-btn"
          onClick={() => navigate('/applications')}
          aria-label="View all applications"
        >
          View all
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>

      {/* Steps */}
      <div className="timeline-steps" role="list">
        {application.steps.map((step, index) => {
          const Icon = stepStatusIcons[step.status] || Circle;
          const isLast = index === application.steps.length - 1;

          return (
            <div
              key={step.id}
              className={`timeline-step timeline-step--${step.status}`}
              role="listitem"
              aria-current={step.status === 'current' ? 'step' : undefined}
            >
              {/* Connector line */}
              {!isLast && (
                <div
                  className={`timeline-connector${step.status === 'completed' ? ' timeline-connector--done' : ''}`}
                  aria-hidden="true"
                />
              )}

              {/* Icon */}
              <div className="timeline-step-icon" aria-hidden="true">
                <Icon size={16} strokeWidth={2} />
              </div>

              {/* Content */}
              <div className="timeline-step-content">
                <div className="timeline-step-label">{step.label}</div>
                {step.date && (
                  <div className="timeline-step-date">{step.date}</div>
                )}
                {step.status === 'current' && (
                  <div className="timeline-step-current-badge">In progress</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
