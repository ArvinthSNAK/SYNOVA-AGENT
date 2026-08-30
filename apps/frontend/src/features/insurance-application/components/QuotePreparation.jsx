import React, { useEffect } from 'react';
import { Check, Circle, AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './QuotePreparation.css';

// Steps that appear in the quote preparation screen
const PREPARATION_STEPS = [
  { id: 'verified', label: 'Application verified' },
  { id: 'confirmed', label: 'Vehicle information confirmed' },
  { id: 'comparing', label: 'Comparing insurance providers' },
  { id: 'evaluating', label: 'Evaluating coverage options' },
  { id: 'preparing', label: 'Preparing recommendations' },
];

function ProviderStatus({ provider }) {
  const statusLabel = {
    queued: 'Waiting...',
    processing: 'Processing...',
    completed: 'Quote ready',
    error: 'Unavailable',
    waiting: 'Waiting...',
    idle: 'Waiting...',
  };

  const statusClass = {
    completed: 'qp-provider-status--done',
    processing: 'qp-provider-status--active',
    error: 'qp-provider-status--error',
  }[provider.status] || '';

  return (
    <div className="qp-provider-row">
      <div className="qp-provider-info">
        <div className="qp-provider-dot" style={{ background: provider.logoColor }} aria-hidden="true" />
        <span className="qp-provider-name">{provider.name}</span>
      </div>
      <div className={`qp-provider-status ${statusClass}`}>
        {provider.status === 'processing' && (
          <div className="qp-mini-spinner" aria-hidden="true" />
        )}
        {provider.status === 'completed' && (
          <Check size={12} aria-hidden="true" />
        )}
        {provider.status === 'error' && (
          <AlertCircle size={12} aria-hidden="true" />
        )}
        <span>{statusLabel[provider.status] || 'Waiting...'}</span>
      </div>
    </div>
  );
}

export default function QuotePreparation({ quoteState, onRetry }) {
  const navigate = useNavigate();
  const { status, providers, results } = quoteState;

  // When quotes are complete, redirect after a short delay
  useEffect(() => {
    if (status === 'completed' && results.length > 0) {
      const timer = setTimeout(() => {
        navigate('/new-insurance/quotes', {
          state: { results, applicationId: quoteState.applicationId },
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, results, navigate]);

  // Determine which preparation steps are visually active
  const getStepStatus = (stepId) => {
    if (status === 'error') return 'idle';
    const completedProviders = providers.filter((p) => p.status === 'completed').length;
    const stepMap = {
      verified: status !== 'idle',
      confirmed: status !== 'idle',
      comparing: status === 'comparing' || status === 'completed',
      evaluating: completedProviders >= 1 || status === 'completed',
      preparing: status === 'completed',
    };
    return stepMap[stepId] ? 'done' : 'pending';
  };

  if (status === 'error') {
    return (
      <div className="qp-panel">
        <div className="qp-error-state" role="alert">
          <AlertCircle size={24} />
          <h3>We couldn't complete the comparison.</h3>
          <p>Your application is saved. Please try again.</p>
          <button className="vi-btn vi-btn--primary" onClick={onRetry} type="button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="qp-panel">
      <div className="qp-header">
        <h2 className="qp-title">
          {status === 'completed' ? 'Quotes ready!' : 'Finding the right coverage for you'}
        </h2>
        <p className="qp-sub">
          {status === 'completed'
            ? 'Redirecting you to your quote comparison...'
            : 'Comparing available insurance options. This usually takes about 30 seconds.'}
        </p>
      </div>

      {/* Preparation steps */}
      <div className="qp-steps" aria-label="Preparation progress">
        {PREPARATION_STEPS.map((step) => {
          const stepStatus = getStepStatus(step.id);
          return (
            <div key={step.id} className={`qp-step qp-step--${stepStatus}`}>
              <div className="qp-step-icon" aria-hidden="true">
                {stepStatus === 'done' ? (
                  <Check size={11} />
                ) : (
                  <Circle size={8} />
                )}
              </div>
              <span className="qp-step-label">{step.label}</span>
              {step.id === 'comparing' && stepStatus === 'done' && status !== 'completed' && (
                <div className="qp-step-spinner" aria-label="In progress" />
              )}
            </div>
          );
        })}
      </div>

      {/* Provider statuses */}
      {providers.length > 0 && (
        <div className="qp-providers">
          <div className="qp-providers-label">Provider Status</div>
          {providers.map((provider) => (
            <ProviderStatus key={provider.id} provider={provider} />
          ))}
        </div>
      )}

      {/* Completion redirect */}
      {status === 'completed' && (
        <div className="qp-complete-banner" role="status" aria-live="polite">
          <Check size={16} />
          <span>Quotes ready — redirecting...</span>
          <button
            className="vi-btn vi-btn--primary"
            onClick={() => navigate('/new-insurance/quotes', { state: { results } })}
            type="button"
          >
            View Quotes <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
