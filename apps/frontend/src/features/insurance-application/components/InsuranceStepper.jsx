import React from 'react';
import { Check } from 'lucide-react';
import './InsuranceStepper.css';

const STEPS = [
  { num: '01', label: 'Vehicle' },
  { num: '02', label: 'Review' },
  { num: '03', label: 'Compare Quotes' },
];

export default function InsuranceStepper({ currentStep, onStepClick }) {
  return (
    <>
      {/* Desktop: horizontal stepper */}
      <nav className="ins-stepper" aria-label="Application progress">
        {STEPS.map((step, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isComplete = stepNum < currentStep;
          const isClickable = stepNum < currentStep; // can go back

          let cls = 'ins-stepper-step';
          if (isActive) cls += ' ins-stepper-step--active';
          if (isComplete) cls += ' ins-stepper-step--complete';

          return (
            <React.Fragment key={stepNum}>
              <div className={cls}>
                <button
                  className="ins-stepper-step-inner"
                  onClick={() => isClickable && onStepClick?.(stepNum)}
                  disabled={!isClickable && !isActive}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`Step ${stepNum}: ${step.label}${isComplete ? ' (completed)' : isActive ? ' (current)' : ' (upcoming)'}`}
                >
                  <div className="ins-stepper-number" aria-hidden="true">
                    {isComplete ? <Check size={13} strokeWidth={2.5} /> : step.num}
                  </div>
                  <div className="ins-stepper-label-wrap">
                    <span className="ins-stepper-step-num">Step {stepNum}</span>
                    <span className="ins-stepper-step-label">{step.label}</span>
                  </div>
                </button>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`ins-stepper-connector${isComplete ? ' ins-stepper-connector--complete' : ''}`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Mobile: compact progress indicator */}
      <div className="ins-stepper-mobile" aria-label="Application progress">
        <div className="ins-stepper-mobile-progress">
          {STEPS.map((_, index) => {
            const stepNum = index + 1;
            let cls = 'ins-stepper-mobile-dot';
            if (stepNum === currentStep) cls += ' ins-stepper-mobile-dot--active';
            if (stepNum < currentStep) cls += ' ins-stepper-mobile-dot--complete';
            return <div key={stepNum} className={cls} />;
          })}
        </div>
        <span className="ins-stepper-mobile-label">
          Step {currentStep} of {STEPS.length} — <strong>{STEPS[currentStep - 1]?.label}</strong>
        </span>
      </div>
    </>
  );
}
