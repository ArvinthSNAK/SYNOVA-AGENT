import React from 'react';
import { FileText, ArrowRight, RotateCcw } from 'lucide-react';

export default function ResumeDraft({ onResume, onDiscard }) {
  return (
    <div className="resume-draft-banner" role="alert" aria-label="Unfinished application found">
      <div className="resume-draft-icon" aria-hidden="true">
        <FileText size={16} />
      </div>
      <div className="resume-draft-text">
        <strong>Resume your application?</strong>
        <span>You have an unfinished auto insurance application.</span>
      </div>
      <div className="resume-draft-actions">
        <button className="resume-draft-btn resume-draft-btn--secondary" onClick={onDiscard} type="button">
          <RotateCcw size={12} /> Start Over
        </button>
        <button className="resume-draft-btn resume-draft-btn--primary" onClick={onResume} type="button">
          Continue <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
