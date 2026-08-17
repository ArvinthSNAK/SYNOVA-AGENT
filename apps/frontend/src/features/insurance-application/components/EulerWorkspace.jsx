import React, { useRef, useEffect } from 'react';
import { Sparkles, Check, FileText, Keyboard, Mic, RefreshCw } from 'lucide-react';
import EulerInput from './EulerInput.jsx';

// ─── Individual message renderer ──────────────────────────────────────────────
function EulerMessage({ msg, onQuickAction }) {
  const renderText = (content) => {
    if (!content) return null;
    return content.split('\n').map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      // Bold: **text**
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
        </p>
      );
    });
  };

  if (msg.type === 'typing') {
    return (
      <div className="euler-msg euler-msg--euler">
        <div className="euler-msg-avatar" aria-hidden="true">
          <Sparkles size={11} />
        </div>
        <div className="euler-typing-dots" aria-label="Euler is thinking">
          <span /><span /><span />
        </div>
      </div>
    );
  }

  if (msg.type === 'quickactions') {
    return (
      <div className="euler-msg euler-msg--euler">
        <div className="euler-msg-avatar" aria-hidden="true">
          <Sparkles size={11} />
        </div>
        <div className="euler-msg-content">
          <div className="euler-msg-bubble">{renderText(msg.content)}</div>
          <div className="euler-quick-btns" role="group" aria-label="Quick action options">
            <button
              className="euler-quick-btn"
              onClick={() => onQuickAction('euler')}
              aria-label="Tell Euler about my car"
            >
              <Mic size={13} aria-hidden="true" />
              Tell Euler about my car
            </button>
            <button
              className="euler-quick-btn"
              onClick={() => onQuickAction('upload')}
              aria-label="Upload vehicle document"
            >
              <FileText size={13} aria-hidden="true" />
              Upload vehicle document
            </button>
            <button
              className="euler-quick-btn"
              onClick={() => onQuickAction('manual')}
              aria-label="Enter vehicle manually"
            >
              <Keyboard size={13} aria-hidden="true" />
              Enter vehicle manually
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (msg.type === 'extraction') {
    return (
      <div className="euler-msg euler-msg--euler">
        <div className="euler-msg-avatar" aria-hidden="true">
          <Sparkles size={11} />
        </div>
        <div className="euler-msg-content">
          <div className="euler-msg-bubble euler-msg-bubble--extraction">
            <div className="euler-extraction-title">
              <Check size={14} className="euler-extraction-check" aria-hidden="true" />
              Vehicle information found
            </div>
            <div className="euler-extraction-fields">
              {msg.data && Object.entries({
                Make: msg.data.make,
                Model: msg.data.model,
                Year: msg.data.year,
                Fuel: msg.data.fuelType,
                'Registration city': msg.data.city,
              }).map(([label, value]) => value ? (
                <div key={label} className="euler-extraction-field">
                  <Check size={11} className="euler-field-check" aria-hidden="true" />
                  <span className="euler-field-label">{label}</span>
                  <span className="euler-field-value">{value}</span>
                </div>
              ) : null)}
            </div>
            <p className="euler-extraction-note">
              Review the details on the left and edit if needed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default text message
  const isUser = msg.role === 'user';
  return (
    <div className={`euler-msg euler-msg--${isUser ? 'user' : 'euler'}`}>
      {!isUser && (
        <div className="euler-msg-avatar" aria-hidden="true">
          <Sparkles size={11} />
        </div>
      )}
      <div className="euler-msg-content">
        <div className="euler-msg-bubble">{renderText(msg.content)}</div>
      </div>
    </div>
  );
}

// ─── Euler Workspace (main panel) ────────────────────────────────────────────
export default function EulerWorkspace({
  conversation,
  inputMode,
  extractionStatus,
  documentExtractionStatus,
  onQuickAction,
  onSendMessage,
  onDocumentUpload,
  currentStep,
}) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const isDocProcessing = documentExtractionStatus === 'uploading' || documentExtractionStatus === 'processing';

  return (
    <div className="euler-workspace" aria-label="Euler Insurance Assistant">
      {/* Panel header */}
      <div className="euler-workspace-header">
        <div className="euler-workspace-brand">
          <div className="euler-workspace-logo" aria-hidden="true">
            <Sparkles size={14} />
          </div>
          <div>
            <div className="euler-workspace-name">
              <span className="euler-mark">✦</span> Euler
            </div>
            <div className="euler-workspace-subtitle">Your Insurance Assistant</div>
          </div>
        </div>
        <div className="euler-workspace-status" aria-label="Euler is online">
          <span className="euler-status-dot" aria-hidden="true" />
          Online
        </div>
      </div>

      {/* Conversation area */}
      <div
        className="euler-conversation"
        role="log"
        aria-live="polite"
        aria-label="Conversation with Euler"
      >
        {conversation.map((msg) => (
          <EulerMessage
            key={msg.id}
            msg={msg}
            onQuickAction={onQuickAction}
          />
        ))}

        {extractionStatus === 'processing' && (
          <div className="euler-processing-banner" aria-live="polite">
            <div className="euler-processing-dots">
              <span /><span /><span />
            </div>
            <span>Euler is extracting your vehicle information...</span>
          </div>
        )}

        {isDocProcessing && (
          <div className="euler-processing-banner" aria-live="polite">
            <RefreshCw size={14} className="euler-spin" />
            <span>
              {documentExtractionStatus === 'uploading'
                ? 'Uploading document to Euler OCR pipeline...'
                : 'Extracting vehicle details from document...'}
            </span>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Context note above input for manual/upload modes */}
      {(inputMode === 'manual' || inputMode === 'upload') && (
        <div className="euler-context-note">
          <Sparkles size={12} aria-hidden="true" />
          <span>
            {inputMode === 'manual'
              ? 'Fill in your vehicle details in the form on the left.'
              : 'Upload your vehicle document on the left or click + below.'}
          </span>
        </div>
      )}

      {/* Chat input with + document upload button */}
      <EulerInput
        onSend={onSendMessage}
        onDocumentUpload={onDocumentUpload}
        disabled={extractionStatus === 'processing' || isDocProcessing}
        placeholder={
          inputMode === 'euler'
            ? 'Tell Euler about your vehicle...'
            : 'Ask Euler or attach a document...'
        }
      />
    </div>
  );
}
