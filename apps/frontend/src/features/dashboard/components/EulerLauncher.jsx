import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import EulerChat from './EulerChat.jsx';
import './EulerLauncher.css';

export default function EulerLauncher() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      {/* Floating launcher button */}
      <div className="euler-launcher-wrap">
        <button
          className={`euler-fab${chatOpen ? ' euler-fab--active' : ''}`}
          onClick={() => setChatOpen(!chatOpen)}
          aria-label={chatOpen ? 'Close Euler assistant' : 'Open Euler insurance assistant'}
          aria-expanded={chatOpen}
          title="Euler — Insurance Assistant"
        >
          {chatOpen ? (
            <X size={20} aria-hidden="true" />
          ) : (
            <>
              <Sparkles size={18} aria-hidden="true" />
              <div className="euler-fab-text">
                <span className="euler-fab-name">Euler</span>
                <span className="euler-fab-subtitle">Insurance Assistant</span>
              </div>
            </>
          )}
        </button>
      </div>

      {/* Chat panel */}
      <EulerChat open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
