import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Home, ChevronRight, Menu, ChevronDown, ChevronUp,
  Upload, FileText, CheckCircle, AlertCircle, Circle,
  Sparkles, ArrowRight, ArrowLeft, Check, X, Info,
  RefreshCw, ExternalLink, Shield, Star, Loader
} from 'lucide-react';

import UserNavbar from '../../../components/layout/UserNavbar.jsx';
import StepperRider from '../../../components/common/StepperRider.jsx';
import useRenewalApplication from '../hooks/useRenewalApplication.js';
import {
  renewalAddonOptions,
  extractionStages,
  renewalProviders,
  formatINR, formatDate, getPolicyStatus,
} from '../data/renewalMockData.js';
import { vehicleMakes, fuelTypes, indianCities } from '../../insurance-application/data/insuranceMockData.js';
import './RenewalPage.css';

// ─── Euler Panel ──────────────────────────────────────────────────────────────
function EulerPanel({ conversation, onSendMessage }) {
  const endRef = useRef(null);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSend = () => {
    const txt = input.trim();
    if (!txt) return;
    onSendMessage(txt);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessage = (msg) => {
    if (msg.type === 'typing') {
      return (
        <div className="rnw-euler-msg" key={msg.id}>
          <div className="rnw-euler-avatar"><Sparkles size={10} /></div>
          <div className="rnw-euler-typing"><span /><span /><span /></div>
        </div>
      );
    }

    if (msg.type === 'renewal-actions') {
      return (
        <div className="rnw-euler-msg" key={msg.id}>
          <div className="rnw-euler-avatar"><Sparkles size={10} /></div>
          <div>
            <div className="rnw-euler-actions">
              <button className="rnw-euler-action-btn"><CheckCircle size={12} /> Review details</button>
              <button className="rnw-euler-action-btn"><ArrowRight size={12} /> Continue</button>
            </div>
          </div>
        </div>
      );
    }

    const isUser = msg.role === 'user';
    const renderText = (content) =>
      content.split('\n').map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i}>
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
          </p>
        );
      });

    return (
      <div className={`rnw-euler-msg${isUser ? ' rnw-euler-msg--user' : ''}`} key={msg.id}>
        {!isUser && <div className="rnw-euler-avatar"><Sparkles size={10} /></div>}
        <div className="rnw-euler-bubble">{renderText(msg.content)}</div>
      </div>
    );
  };

  return (
    <div className="rnw-euler-panel">
      <div className="rnw-euler-header">
        <div className="rnw-euler-brand">
          <div className="rnw-euler-logo"><Sparkles size={13} /></div>
          <div>
            <div className="rnw-euler-name">✦ Euler</div>
            <div className="rnw-euler-subtitle">Renewal Assistant</div>
          </div>
        </div>
        <div className="rnw-euler-status">
          <span className="rnw-euler-dot" />Online
        </div>
      </div>

      <div className="rnw-euler-conv" role="log" aria-live="polite">
        {conversation.map(renderMessage)}
        <div ref={endRef} />
      </div>

      <div className="rnw-euler-input-wrap">
        <textarea
          ref={inputRef}
          className="rnw-euler-input"
          placeholder="Ask Euler about your renewal..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className="rnw-euler-send-btn"
          onClick={handleSend}
          disabled={!input.trim()}
          aria-label="Send message"
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Stepper ─────────────────────────────────────────────────────────────────
const STEPS = ['Upload Policy', 'Verify Details', 'Coverage', 'Compare Quotes'];

function RenewalStepper({ currentStep, onStepClick }) {
  const navRef = useRef(null);
  const numRefs = useRef([]);

  return (
    <nav className="rnw-stepper" aria-label="Renewal steps" ref={navRef}>
      {STEPS.map((label, i) => {
        const step = i + 1;
        const isDone = step < currentStep;
        const isActive = step === currentStep;
        return (
          <div className="rnw-step" key={step}>
            {i > 0 && (
              <div className={`rnw-step-sep${isDone ? ' rnw-step-sep--done' : ''}`} />
            )}
            <div
              className={`rnw-step-inner rnw-step${isDone ? ' rnw-step--done' : ''}${isActive ? ' rnw-step--active' : ''}`}
              onClick={() => isDone && onStepClick(step)}
              role="button"
              tabIndex={isDone ? 0 : -1}
              aria-current={isActive ? 'step' : undefined}
            >
              <div className="rnw-step-num" ref={(el) => (numRefs.current[i] = el)}>
                {isDone ? <Check size={11} /> : step}
              </div>
              <span className="rnw-step-label">{label}</span>
            </div>
          </div>
        );
      })}
      <StepperRider
        containerRef={navRef}
        numberRefs={numRefs}
        activeIndex={currentStep - 1}
      />
    </nav>
  );
}

// ─── Current Policy Card ──────────────────────────────────────────────────────
function CurrentPolicyCard({ policy, onRenew }) {
  if (!policy) return null;
  const { status, daysRemaining, label } = getPolicyStatus(policy.expiryDate);
  return (
    <div className="rnw-current-card">
      <div className="rnw-current-card-header">
        <span className="rnw-current-card-label">Your Current Policy</span>
        <span className={`rnw-policy-status rnw-policy-status--${status === 'active' ? 'active' : status === 'expiring-soon' ? 'expiring' : 'expired'}`}>
          <span className="rnw-policy-status-dot" />
          {status === 'active' ? 'Active' : status === 'expiring-soon' ? 'Expiring Soon' : 'Expired'}
        </span>
      </div>
      <div className="rnw-current-card-body">
        <div>
          <div className="rnw-current-card-provider">{policy.provider}</div>
          <div className="rnw-current-card-type">{policy.policyType} Auto Insurance</div>
        </div>
        <div className="rnw-current-card-meta">
          <div className="rnw-current-card-meta-item">
            <span className="rnw-current-card-meta-label">Policy</span>
            <span className="rnw-current-card-meta-value">{policy.policyNumber}</span>
          </div>
          <div className="rnw-current-card-meta-item">
            <span className="rnw-current-card-meta-label">Vehicle</span>
            <span className="rnw-current-card-meta-value" style={{ fontFamily: 'inherit', letterSpacing: 'normal' }}>
              {policy.vehicle?.make} {policy.vehicle?.model}
            </span>
          </div>
          <div className="rnw-current-card-meta-item">
            <span className="rnw-current-card-meta-label">Expiry</span>
            <span className="rnw-current-card-meta-value" style={{ fontFamily: 'inherit', letterSpacing: 'normal' }}>
              {formatDate(policy.expiryDate)}
            </span>
          </div>
        </div>
      </div>
      <div className="rnw-current-card-footer">
        <span className="rnw-current-card-days">
          <span style={{ marginRight: 6, color: status === 'active' ? 'var(--color-success)' : status === 'expiring-soon' ? 'var(--color-warning)' : 'var(--color-error)' }}>●</span>
          {label}
        </span>
        <button className="rnw-renew-this-btn" onClick={onRenew}>
          Renew this policy <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 1 — Upload Policy ───────────────────────────────────────────────────
function UploadStep({ uploadState, policyDocument, onUpload, onRetry, onManual, onContinue }) {
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const valid = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!valid.includes(file.type)) {
      alert('Please upload a PDF, JPG, or PNG file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10 MB.');
      return;
    }
    onUpload(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const { status, progress, completedStages, currentStage } = uploadState;

  // Error state
  if (status === 'error') {
    return (
      <div className="rnw-upload-error">
        <div className="rnw-upload-error-icon"><AlertCircle size={24} /></div>
        <div className="rnw-upload-error-title">We couldn't read this policy</div>
        <div className="rnw-upload-error-msg">
          {uploadState.errorMessage || 'Your document is still available. Try again or enter your details manually.'}
        </div>
        <div className="rnw-upload-error-actions">
          <button className="rnw-next-btn" onClick={onRetry}><RefreshCw size={14} /> Try Again</button>
          <button className="rnw-next-btn" style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }} onClick={onManual}>Enter Manually</button>
        </div>
      </div>
    );
  }

  // Uploading / Processing / Extracting states
  if (status === 'uploading' || status === 'processing' || status === 'extracting') {
    const statusText = {
      uploading: 'Uploading policy...',
      processing: 'Reading your policy...',
      extracting: 'Finding vehicle and policy details...',
    }[status];
    const statusSub = {
      uploading: 'Please wait while we upload your file.',
      processing: 'Detecting policy type and content.',
      extracting: 'Extracting policy, vehicle, and coverage details.',
    }[status];

    return (
      <div className="rnw-upload-progress">
        {policyDocument && (
          <div className="rnw-upload-progress-file">
            <FileText size={18} color="var(--color-primary)" />
            <span className="rnw-upload-progress-name">{policyDocument.name}</span>
            <span className="rnw-upload-progress-size">{(policyDocument.size / 1024).toFixed(0)} KB</span>
          </div>
        )}
        {status === 'uploading' && (
          <>
            <div className="rnw-progress-bar-wrap">
              <div className="rnw-progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <div className="rnw-progress-pct">{progress}%</div>
          </>
        )}
        <div className="rnw-upload-status-text" style={{ marginTop: 14 }}>{statusText}</div>
        <div className="rnw-upload-status-sub">{statusSub}</div>

        {(status === 'processing' || status === 'extracting') && (
          <div className="rnw-extraction-stages">
            {extractionStages.map((stage) => {
              const isDone = completedStages?.includes(stage.id);
              const isActive = currentStage === stage.id && !isDone;
              return (
                <div
                  key={stage.id}
                  className={`rnw-extraction-stage${isDone ? ' rnw-extraction-stage--done' : ''}${isActive ? ' rnw-extraction-stage--active' : ''}`}
                >
                  <div className="rnw-extraction-stage-icon">
                    {isDone
                      ? <CheckCircle size={14} color="var(--color-success)" />
                      : isActive
                        ? <div className="rnw-extraction-stage-spinner" />
                        : <Circle size={14} color="var(--color-border)" />
                    }
                  </div>
                  {stage.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Completed state
  if (status === 'completed') {
    return (
      <div style={{ textAlign: 'center', padding: '28px 24px' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--color-success-tint)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <CheckCircle size={26} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>Policy information extracted</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20 }}>
          We've extracted your policy, vehicle, and coverage details. Please review them in the next step.
        </div>
        {policyDocument && (
          <div className="rnw-upload-progress-file" style={{ marginBottom: 20 }}>
            <FileText size={18} color="var(--color-success)" />
            <span className="rnw-upload-progress-name">{policyDocument.name}</span>
            <CheckCircle size={15} color="var(--color-success)" />
          </div>
        )}
        <div className="rnw-extraction-stages">
          {extractionStages.map((stage) => (
            <div key={stage.id} className="rnw-extraction-stage rnw-extraction-stage--done">
              <div className="rnw-extraction-stage-icon"><CheckCircle size={14} color="var(--color-success)" /></div>
              {stage.label}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="rnw-next-btn" onClick={onContinue}>
            Review Extracted Details <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // Idle — main upload dropzone
  return (
    <>
      <div
        className={`rnw-upload-zone${dragging ? ' rnw-upload-zone--dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload policy document"
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="rnw-upload-hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <div className="rnw-upload-icon"><Upload size={22} /></div>
        {dragging
          ? <div className="rnw-upload-title">Drop your policy here</div>
          : (
            <>
              <div className="rnw-upload-title">Drag and drop your policy here</div>
              <div className="rnw-upload-sub">
                Upload your existing policy PDF or image.<br />
                We'll extract everything automatically.
              </div>
              <button className="rnw-upload-btn" type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                <Upload size={15} /> Browse Files
              </button>
              <div className="rnw-upload-formats">Supported: PDF · JPG · PNG · Max 10 MB</div>
            </>
          )}
      </div>
      <div className="rnw-upload-manual-link">
        <button className="rnw-upload-manual-btn" onClick={onManual}>
          Enter details manually instead
        </button>
      </div>
    </>
  );
}

// ─── Confidence badge ─────────────────────────────────────────────────────────
function ConfidenceBadge({ level }) {
  if (!level) return null;
  const map = {
    high: { icon: <Check size={9} />, label: 'High confidence', cls: 'high' },
    medium: { icon: <AlertCircle size={9} />, label: 'Please verify', cls: 'medium' },
    low: { icon: <AlertCircle size={9} />, label: 'Please verify', cls: 'low' },
  };
  const { icon, label, cls } = map[level] || {};
  return (
    <span className={`rnw-field-confidence rnw-field-confidence--${cls}`}>
      {icon} {label}
    </span>
  );
}

// ─── Collapsible verify section ───────────────────────────────────────────────
function VerifySection({ title, icon, count, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rnw-verify-section">
      <div className="rnw-verify-section-header" onClick={() => setOpen(!open)}>
        <div className="rnw-verify-section-title">
          {icon} {title}
          {count != null && <span className="rnw-verify-section-count">{count} fields</span>}
        </div>
        <span className={`rnw-verify-section-toggle${open ? ' rnw-verify-section-toggle--open' : ''}`}>
          <ChevronDown size={16} />
        </span>
      </div>
      {open && <div className="rnw-verify-fields">{children}</div>}
    </div>
  );
}

// ─── Single editable field ────────────────────────────────────────────────────
function Field({ label, value, onChange, confidence, mono, type = 'text', options, placeholder }) {
  if (options) {
    return (
      <div className="rnw-field">
        <div className="rnw-field-label-wrap">
          <span className="rnw-field-label">{label}</span>
          <ConfidenceBadge level={confidence} />
        </div>
        <select className="rnw-field-select" value={value} onChange={(e) => onChange(e.target.value)}>
          {!value && <option value="">Select…</option>}
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  return (
    <div className="rnw-field">
      <div className="rnw-field-label-wrap">
        <span className="rnw-field-label">{label}</span>
        <ConfidenceBadge level={confidence} />
      </div>
      <input
        className={`rnw-field-input${mono ? ' rnw-field-input--mono' : ''}`}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
      />
    </div>
  );
}

// ─── Step 2 — Verify Extracted Details ───────────────────────────────────────
function VerifyStep({ policy, vehicle, customer, confidence, inputMode, onUpdatePolicy, onUpdateVehicle, onUpdateCustomer, onContinue, onBack }) {
  const isManual = inputMode === 'manual';
  return (
    <>
      {isManual && (
        <div className="rnw-manual-banner">
          <Info size={14} />
          Manual entry mode — fill in your policy details below.
        </div>
      )}

      <VerifySection title="Policy Information" icon={<FileText size={14} />} count={9}>
        <Field label="Insurance Provider" value={policy.provider} onChange={(v) => onUpdatePolicy('provider', v)} confidence={confidence.provider} />
        <Field label="Policy Number" value={policy.policyNumber} onChange={(v) => onUpdatePolicy('policyNumber', v)} confidence={confidence.policyNumber} mono />
        <Field label="Policy Type" value={policy.policyType} onChange={(v) => onUpdatePolicy('policyType', v)} confidence={confidence.policyType} options={['Comprehensive', 'Third-Party']} />
        <Field label="Start Date" value={policy.startDate} onChange={(v) => onUpdatePolicy('startDate', v)} type="date" confidence={confidence.startDate} />
        <Field label="Expiry Date" value={policy.expiryDate} onChange={(v) => onUpdatePolicy('expiryDate', v)} type="date" confidence={confidence.expiryDate} />
        <Field label="Previous Premium (₹)" value={policy.previousPremium} onChange={(v) => onUpdatePolicy('previousPremium', v)} confidence={confidence.previousPremium} type="number" />
        <Field label="IDV (₹)" value={policy.idv} onChange={(v) => onUpdatePolicy('idv', v)} confidence={confidence.idv} type="number" />
        <Field label="NCB" value={policy.ncb} onChange={(v) => onUpdatePolicy('ncb', v)} confidence={confidence.ncb} options={['0%', '20%', '25%', '35%', '45%', '50%']} />
        <Field label="Deductible (₹)" value={policy.deductible} onChange={(v) => onUpdatePolicy('deductible', v)} confidence={confidence.deductible} type="number" />
      </VerifySection>

      <VerifySection title="Vehicle Information" icon={<Shield size={14} />} count={7}>
        <Field label="Registration No." value={vehicle.registrationNumber} onChange={(v) => onUpdateVehicle('registrationNumber', v)} confidence={confidence.registrationNumber} mono />
        <Field label="Make" value={vehicle.make} onChange={(v) => onUpdateVehicle('make', v)} confidence={confidence.make} options={vehicleMakes} />
        <Field label="Model" value={vehicle.model} onChange={(v) => onUpdateVehicle('model', v)} confidence={confidence.model} />
        <Field label="Variant" value={vehicle.variant} onChange={(v) => onUpdateVehicle('variant', v)} confidence={confidence.variant} />
        <Field label="Manufacturing Year" value={vehicle.year} onChange={(v) => onUpdateVehicle('year', v)} confidence={confidence.year} type="number" />
        <Field label="Fuel Type" value={vehicle.fuelType} onChange={(v) => onUpdateVehicle('fuelType', v)} confidence={confidence.fuelType} options={fuelTypes} />
        <Field label="Registration City" value={vehicle.city} onChange={(v) => onUpdateVehicle('city', v)} confidence={confidence.city} options={indianCities} />
      </VerifySection>

      <VerifySection title="Customer Information" icon={<CheckCircle size={14} />} count={4} defaultOpen={false}>
        <Field label="Full Name" value={customer.name} onChange={(v) => onUpdateCustomer('name', v)} confidence={confidence.name} />
        <Field label="Mobile" value={customer.mobile} onChange={(v) => onUpdateCustomer('mobile', v)} confidence={confidence.mobile} />
        <Field label="Email" value={customer.email} onChange={(v) => onUpdateCustomer('email', v)} type="email" confidence={confidence.email} />
        <Field label="Address" value={customer.address} onChange={(v) => onUpdateCustomer('address', v)} />
      </VerifySection>

      <div className="rnw-action-bar">
        <button className="rnw-back-btn" onClick={onBack}><ArrowLeft size={14} /> Back</button>
        <button className="rnw-next-btn" onClick={onContinue}>
          Continue to Coverage <ArrowRight size={14} />
        </button>
      </div>
    </>
  );
}

// ─── Step 3 — Coverage ────────────────────────────────────────────────────────
function CoverageStep({ coverage, currentPolicy, estimatedPremium, onSetType, onToggleAddon, onContinue, onBack }) {
  const prevPremium = currentPolicy?.previousPremium || 17900;
  const diff = estimatedPremium - prevPremium;

  return (
    <>
      <div className="rnw-section-title">Review your renewal coverage</div>
      <div className="rnw-section-sub">Keep your existing protection or make changes before comparing renewal quotes.</div>

      <div className="rnw-coverage-types">
        {['comprehensive', 'third-party'].map((type) => (
          <div
            key={type}
            className={`rnw-coverage-card${coverage.type === type ? ' rnw-coverage-card--selected' : ''}`}
            onClick={() => onSetType(type)}
            role="radio"
            aria-checked={coverage.type === type}
          >
            <div className="rnw-coverage-card-check">
              {coverage.type === type && <Check size={11} />}
            </div>
            <div className="rnw-coverage-card-name">
              {type === 'comprehensive' ? 'Comprehensive' : 'Third-Party'}
            </div>
            <div className="rnw-coverage-card-desc">
              {type === 'comprehensive'
                ? 'Own damage + third-party + theft + natural disasters.'
                : 'Third-party liability only. Mandatory minimum coverage.'}
            </div>
          </div>
        ))}
      </div>

      <div className="rnw-addons-title">Add-ons</div>
      <div className="rnw-addons-list">
        {renewalAddonOptions.map((addon) => {
          const active = coverage.addons.includes(addon.id);
          return (
            <div key={addon.id} className={`rnw-addon-card${active ? ' rnw-addon-card--active' : ''}`}>
              <div className="rnw-addon-card-info">
                <div className="rnw-addon-card-name">
                  {addon.label}
                  {addon.currentlyIncluded && <span className="rnw-addon-tag rnw-addon-tag--included">Currently included</span>}
                  {addon.eulerRecommended && !addon.currentlyIncluded && <span className="rnw-addon-tag rnw-addon-tag--euler">✦ Euler suggests</span>}
                </div>
                <div className="rnw-addon-card-desc">{addon.description}</div>
                <div className="rnw-addon-card-why">{addon.whyItMatters}</div>
              </div>
              <div className="rnw-addon-card-right">
                <div className="rnw-addon-card-price">+{formatINR(addon.price)}/yr</div>
                <button
                  className={`rnw-addon-toggle-btn${active ? ' rnw-addon-toggle-btn--remove' : ' rnw-addon-toggle-btn--add'}`}
                  onClick={() => onToggleAddon(addon.id)}
                >
                  {active ? 'Remove' : 'Add'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {coverage.ncb && (
        <div className="rnw-ncb-card">
          <div className="rnw-ncb-title"><Info size={13} /> No Claim Bonus (NCB)</div>
          <div className="rnw-ncb-row">
            <div className="rnw-ncb-item">
              <span className="rnw-ncb-label">Current NCB</span>
              <span className="rnw-ncb-value">{coverage.ncb}</span>
            </div>
            <div className="rnw-ncb-item">
              <span className="rnw-ncb-label">Renewal NCB</span>
              <span className="rnw-ncb-value">{coverage.ncb}</span>
            </div>
          </div>
          <div className="rnw-ncb-note">NCB may depend on your claim history and insurer rules. Final NCB will be confirmed during quote comparison.</div>
        </div>
      )}

      <div className="rnw-premium-bar">
        <div>
          <div className="rnw-premium-bar-label">Estimated Renewal Premium</div>
          <div className="rnw-premium-bar-amount">{formatINR(estimatedPremium)}/yr</div>
          <div className="rnw-premium-bar-prev">Previous: {formatINR(prevPremium)}/yr</div>
        </div>
        <div>
          <div className={diff > 0 ? 'rnw-premium-bar-diff-pos' : 'rnw-premium-bar-diff-neg'}>
            {diff > 0 ? '+' : ''}{formatINR(diff)}
          </div>
          <div className="rnw-premium-bar-note">Estimated only. Final pricing set during quote comparison.</div>
        </div>
      </div>

      <div className="rnw-action-bar">
        <button className="rnw-back-btn" onClick={onBack}><ArrowLeft size={14} /> Back</button>
        <button className="rnw-next-btn" onClick={onContinue}>Review Application <ArrowRight size={14} /></button>
      </div>
    </>
  );
}

// ─── Step 4 — Review & Quotes ─────────────────────────────────────────────────
function ReviewStep({ state, estimatedPremium, currentPolicy, onConfirmChange, onSubmit, onBack, onEditStep, quoteState, onSelectQuote, onRetryQuotes }) {
  const [openDrawer, setOpenDrawer] = useState(null);
  const prevPremium = currentPolicy?.previousPremium || 17900;
  const { status, providers, results, selectedProviderId } = quoteState;

  if (selectedProviderId) {
    const selected = results.find((r) => r.providerId === selectedProviderId);
    return (
      <div className="rnw-selected-card">
        <div className="rnw-selected-label">Your renewal selection</div>
        <div className="rnw-selected-provider">{selected?.providerName}</div>
        <div className="rnw-selected-premium">{formatINR(selected?.premium)}/year</div>
        <div className="rnw-selected-meta">
          <div className="rnw-selected-meta-item">
            <span className="rnw-selected-meta-label">Coverage</span>
            <span className="rnw-selected-meta-value">{selected?.coverageType}</span>
          </div>
          <div className="rnw-selected-meta-item">
            <span className="rnw-selected-meta-label">IDV</span>
            <span className="rnw-selected-meta-value">{formatINR(selected?.idv)}</span>
          </div>
          <div className="rnw-selected-meta-item">
            <span className="rnw-selected-meta-label">NCB</span>
            <span className="rnw-selected-meta-value">{selected?.ncb}</span>
          </div>
        </div>
        <div className="rnw-selected-actions">
          <button className="rnw-next-btn rnw-next-btn--accent">Continue to Purchase <ArrowRight size={14} /></button>
          <button className="rnw-back-btn" onClick={() => onSelectQuote(null)}>Compare Again</button>
        </div>
      </div>
    );
  }

  if (status === 'comparing' || status === 'processing') {
    const checkItems = [
      { label: 'Policy details confirmed', done: true },
      { label: 'Vehicle details confirmed', done: true },
      { label: 'Coverage selected', done: true },
      { label: 'Checking insurance providers', done: false, active: true },
      { label: 'Evaluating renewal premiums', done: false },
      { label: 'Comparing benefits', done: false },
    ];
    return (
      <div className="rnw-quoting-panel">
        <div className="rnw-quoting-title">Comparing renewal options</div>
        <div className="rnw-quoting-sub">This usually takes about 30 seconds.</div>
        <div className="rnw-quoting-checklist">
          {checkItems.map((item, i) => (
            <div key={i} className={`rnw-quoting-check-item${item.done ? ' rnw-quoting-check-item--done' : ''}${item.active ? ' rnw-quoting-check-item--active' : ' rnw-quoting-check-item--pending'}`}>
              {item.done ? <CheckCircle size={14} color="var(--color-success)" /> : item.active ? <div className="rnw-extraction-stage-spinner" /> : <Circle size={14} color="var(--color-border)" />}
              {item.label}
            </div>
          ))}
        </div>
        <div className="rnw-quoting-providers">
          {(providers.length ? providers : renewalProviders).map((p) => (
            <div key={p.id} className={`rnw-provider-status${p.status === 'processing' ? ' rnw-provider-status--processing' : ''}${p.status === 'completed' ? ' rnw-provider-status--completed' : ''}`}>
              <div className="rnw-provider-logo" style={{ background: p.logoColor }}>{p.id.slice(0, 2).toUpperCase()}</div>
              <span className="rnw-provider-name">{p.name}</span>
              <span className={`rnw-provider-state${p.status === 'processing' ? ' rnw-provider-state--processing' : ''}${p.status === 'completed' ? ' rnw-provider-state--completed' : ''}`}>
                {p.status === 'completed' ? 'Done' : p.status === 'processing' ? 'Processing…' : 'Waiting'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === 'completed' && results.length > 0) {
    const drawer = results.find((r) => r.providerId === openDrawer);
    return (
      <>
        <div className="rnw-section-title" style={{ marginBottom: 16 }}>Renewal Quotes</div>
        <div className="rnw-quote-cards">
          {results.map((q) => {
            const diff = q.premium - q.previousPremium;
            return (
              <div key={q.providerId} className={`rnw-quote-card${q.isRecommended ? ' rnw-quote-card--recommended' : ''}`}>
                {q.isRecommended && <div className="rnw-quote-best-badge"><Star size={9} /> Best Value</div>}
                <div className="rnw-quote-card-header">
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div className="rnw-quote-provider-logo" style={{ background: q.logoColor }}>
                      {q.providerId.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="rnw-quote-provider-name">{q.providerName}</div>
                      <div className="rnw-quote-provider-type">{q.coverageType}</div>
                    </div>
                  </div>
                  <div className="rnw-quote-premium">
                    <div className="rnw-quote-premium-amount">{formatINR(q.premium)}</div>
                    <div className="rnw-quote-premium-period">/year</div>
                    <div className="rnw-quote-prev-premium">
                      Prev: {formatINR(q.previousPremium)} &nbsp;
                      <span className={diff > 0 ? 'rnw-quote-diff-pos' : 'rnw-quote-diff-neg'}>
                        {diff > 0 ? '+' : ''}{formatINR(diff)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rnw-quote-meta">
                  <div className="rnw-quote-meta-item">
                    <span className="rnw-quote-meta-label">IDV</span>
                    <span className="rnw-quote-meta-value">{formatINR(q.idv)}</span>
                  </div>
                  <div className="rnw-quote-meta-item">
                    <span className="rnw-quote-meta-label">Deductible</span>
                    <span className="rnw-quote-meta-value">{formatINR(q.deductible)}</span>
                  </div>
                  <div className="rnw-quote-meta-item">
                    <span className="rnw-quote-meta-label">NCB</span>
                    <span className="rnw-quote-meta-value">{q.ncb}</span>
                  </div>
                </div>
                <div className="rnw-quote-addons">
                  {q.addons.map((id) => {
                    const a = renewalAddonOptions.find((x) => x.id === id);
                    return <span key={id} className="rnw-quote-addon-tag">{a?.label || id}</span>;
                  })}
                </div>
                <div className="rnw-quote-benefits">
                  {q.benefits.map((b) => (
                    <span key={b} className="rnw-quote-benefit"><Check size={10} color="var(--color-success)" /> {b}</span>
                  ))}
                </div>
                <div className="rnw-quote-card-actions">
                  <button className="rnw-quote-detail-btn" onClick={() => setOpenDrawer(q.providerId)}>View Details</button>
                  <button className="rnw-quote-select-btn" onClick={() => onSelectQuote(q.providerId)}>Select Policy</button>
                </div>
              </div>
            );
          })}
        </div>

        {drawer && (
          <>
            <div className="rnw-drawer-overlay" onClick={() => setOpenDrawer(null)} />
            <div className="rnw-drawer" role="dialog" aria-modal="true" aria-label={`${drawer.providerName} quote details`}>
              <div className="rnw-drawer-header">
                <div className="rnw-drawer-title">{drawer.providerName}</div>
                <button className="rnw-drawer-close-btn" onClick={() => setOpenDrawer(null)} aria-label="Close"><X size={16} /></button>
              </div>
              <div className="rnw-drawer-body">
                <div className="rnw-drawer-section">
                  <div className="rnw-drawer-section-title">Premium</div>
                  <div className="rnw-drawer-row"><span className="rnw-drawer-row-label">Renewal Premium</span><span className="rnw-drawer-row-value">{formatINR(drawer.premium)}/yr</span></div>
                  <div className="rnw-drawer-row"><span className="rnw-drawer-row-label">Previous Premium</span><span className="rnw-drawer-row-value">{formatINR(drawer.previousPremium)}/yr</span></div>
                  <div className="rnw-drawer-row"><span className="rnw-drawer-row-label">Difference</span>
                    <span className="rnw-drawer-row-value" style={{ color: drawer.premiumDiff > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
                      {drawer.premiumDiff > 0 ? '+' : ''}{formatINR(drawer.premiumDiff)}
                    </span>
                  </div>
                </div>
                <div className="rnw-drawer-section">
                  <div className="rnw-drawer-section-title">Coverage</div>
                  <div className="rnw-drawer-row"><span className="rnw-drawer-row-label">Type</span><span className="rnw-drawer-row-value">{drawer.coverageType}</span></div>
                  <div className="rnw-drawer-row"><span className="rnw-drawer-row-label">IDV</span><span className="rnw-drawer-row-value">{formatINR(drawer.idv)}</span></div>
                  <div className="rnw-drawer-row"><span className="rnw-drawer-row-label">Deductible</span><span className="rnw-drawer-row-value">{formatINR(drawer.deductible)}</span></div>
                  <div className="rnw-drawer-row"><span className="rnw-drawer-row-label">NCB</span><span className="rnw-drawer-row-value">{drawer.ncb}</span></div>
                </div>
                <div className="rnw-drawer-section">
                  <div className="rnw-drawer-section-title">Add-ons</div>
                  {drawer.addons.map((id) => {
                    const a = renewalAddonOptions.find((x) => x.id === id);
                    return (
                      <div key={id} className="rnw-drawer-row">
                        <span className="rnw-drawer-row-label">{a?.label || id}</span>
                        <Check size={14} color="var(--color-success)" />
                      </div>
                    );
                  })}
                </div>
                <div className="rnw-drawer-section">
                  <div className="rnw-drawer-section-title">Benefits</div>
                  {drawer.benefits.map((b) => (
                    <div key={b} className="rnw-drawer-row">
                      <span className="rnw-drawer-row-label">{b}</span>
                      <Check size={14} color="var(--color-success)" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rnw-drawer-footer">
                <button className="rnw-back-btn" onClick={() => setOpenDrawer(null)}>Close</button>
                <button className="rnw-drawer-select-btn" onClick={() => { onSelectQuote(drawer.providerId); setOpenDrawer(null); }}>
                  Select this Policy
                </button>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  if (status === 'error') {
    return (
      <div className="rnw-upload-error">
        <div className="rnw-upload-error-icon"><AlertCircle size={24} /></div>
        <div className="rnw-upload-error-title">Couldn't complete comparison</div>
        <div className="rnw-upload-error-msg">Your renewal information is saved. Please try again.</div>
        <div className="rnw-upload-error-actions">
          <button className="rnw-next-btn" onClick={onRetryQuotes}><RefreshCw size={14} /> Try Again</button>
        </div>
      </div>
    );
  }

  // Default: review form before quoting
  return (
    <>
      <div className="rnw-section-title">Review renewal application</div>
      <div className="rnw-section-sub">Please confirm everything looks correct before comparing quotes.</div>

      {/* Coverage comparison */}
      <div className="rnw-review-section">
        <div className="rnw-review-section-hdr">
          <div className="rnw-review-section-title"><Shield size={14} /> Coverage Comparison</div>
          <button className="rnw-review-section-edit" onClick={() => onEditStep(3)}>Edit</button>
        </div>
        <div className="rnw-review-section-body">
          <table className="rnw-compare-table">
            <thead>
              <tr><th>Item</th><th>Current</th><th>Renewal</th></tr>
            </thead>
            <tbody>
              <tr><td>{state.coverage.type === 'comprehensive' ? 'Comprehensive' : 'Third-Party'}</td><td className="rnw-compare-check"><Check size={13} /></td><td className="rnw-compare-check"><Check size={13} /></td></tr>
              {state.coverage.addons.map((id) => {
                const a = renewalAddonOptions.find((x) => x.id === id);
                const wasInCurrent = state.currentPolicy?.addons?.includes(id);
                return (
                  <tr key={id}>
                    <td>{a?.label || id}</td>
                    <td>{wasInCurrent ? <span className="rnw-compare-check"><Check size={13} /></span> : <span className="rnw-compare-empty">—</span>}</td>
                    <td className="rnw-compare-check"><Check size={13} /></td>
                  </tr>
                );
              })}
              <tr>
                <td>IDV</td>
                <td>{state.currentPolicy?.idv ? formatINR(state.currentPolicy.idv) : '—'}</td>
                <td>{state.coverage.idv ? formatINR(Number(state.coverage.idv)) : '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Policy summary */}
      <div className="rnw-review-section">
        <div className="rnw-review-section-hdr">
          <div className="rnw-review-section-title"><FileText size={14} /> Policy Details</div>
          <button className="rnw-review-section-edit" onClick={() => onEditStep(2)}>Edit</button>
        </div>
        <div className="rnw-review-section-body">
          <div className="rnw-review-grid">
            <div className="rnw-review-field"><span className="rnw-review-field-label">Provider</span><span className="rnw-review-field-value">{state.policy.provider || '—'}</span></div>
            <div className="rnw-review-field"><span className="rnw-review-field-label">Policy No.</span><span className="rnw-review-field-value rnw-review-field-value--mono">{state.policy.policyNumber || '—'}</span></div>
            <div className="rnw-review-field"><span className="rnw-review-field-label">Expiry</span><span className="rnw-review-field-value">{formatDate(state.policy.expiryDate) || '—'}</span></div>
            <div className="rnw-review-field"><span className="rnw-review-field-label">NCB</span><span className="rnw-review-field-value">{state.policy.ncb || '—'}</span></div>
          </div>
        </div>
      </div>

      {/* Vehicle summary */}
      <div className="rnw-review-section">
        <div className="rnw-review-section-hdr">
          <div className="rnw-review-section-title"><Shield size={14} /> Vehicle Details</div>
          <button className="rnw-review-section-edit" onClick={() => onEditStep(2)}>Edit</button>
        </div>
        <div className="rnw-review-section-body">
          <div className="rnw-review-grid">
            <div className="rnw-review-field"><span className="rnw-review-field-label">Registration</span><span className="rnw-review-field-value rnw-review-field-value--mono">{state.vehicle.registrationNumber || '—'}</span></div>
            <div className="rnw-review-field"><span className="rnw-review-field-label">Vehicle</span><span className="rnw-review-field-value">{state.vehicle.make} {state.vehicle.model}</span></div>
            <div className="rnw-review-field"><span className="rnw-review-field-label">Year</span><span className="rnw-review-field-value">{state.vehicle.year || '—'}</span></div>
            <div className="rnw-review-field"><span className="rnw-review-field-label">Fuel</span><span className="rnw-review-field-value">{state.vehicle.fuelType || '—'}</span></div>
          </div>
        </div>
      </div>

      {/* Confirmation */}
      <div className="rnw-confirm-box">
        <div className="rnw-confirm-checkbox-row">
          <input
            id="rnw-confirm"
            type="checkbox"
            className="rnw-confirm-checkbox"
            checked={state.userConfirmed}
            onChange={(e) => onConfirmChange(e.target.checked)}
          />
          <label htmlFor="rnw-confirm" className="rnw-confirm-checkbox-label">
            I confirm that the information provided is accurate and I authorize Synova to use these details for renewal quote comparison.
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="rnw-next-btn rnw-next-btn--accent"
            disabled={!state.userConfirmed}
            onClick={onSubmit}
          >
            Compare Renewal Quotes <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="rnw-action-bar">
        <button className="rnw-back-btn" onClick={onBack}><ArrowLeft size={14} /> Back</button>
        <span style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>Save & Continue Later</span>
      </div>
    </>
  );
}

// ─── Main RenewalPage ────────────────────────────────────────────────────────
export default function RenewalPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const app = useRenewalApplication();
  const { state, draftAvailable, estimatedPremium } = app;
  const { currentPolicy } = state;

  const policyStatus = currentPolicy ? getPolicyStatus(currentPolicy.expiryDate) : null;
  const showExpiryBanner = policyStatus && (policyStatus.status === 'expiring-soon' || policyStatus.status === 'expired');
  const showEuler = state.currentStep <= 3;

  const handleStartRenewal = () => {
    // Jump to step 1 ready to upload
    app.goToStep(1);
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <>
            <div className="rnw-section-title">Upload your existing policy</div>
            <div className="rnw-section-sub">
              We'll extract your policy, vehicle, and coverage details so you don't have to enter them again.
            </div>
            <CurrentPolicyCard policy={currentPolicy} onRenew={handleStartRenewal} />
            {state.inputMode === 'manual'
              ? (
                <VerifyStep
                  policy={state.policy}
                  vehicle={state.vehicle}
                  customer={state.customer}
                  confidence={{}}
                  inputMode="manual"
                  onUpdatePolicy={app.updatePolicy}
                  onUpdateVehicle={app.updateVehicle}
                  onUpdateCustomer={app.updateCustomer}
                  onContinue={app.nextStep}
                  onBack={() => app.setInputMode(null)}
                />
              )
              : (
                <UploadStep
                  uploadState={state.upload}
                  policyDocument={state.policyDocument}
                  onUpload={app.handlePolicyUpload}
                  onRetry={app.retryUpload}
                  onManual={() => app.setInputMode('manual')}
                  onContinue={app.nextStep}
                />
              )
            }
          </>
        );
      case 2:
        return (
          <>
            <div className="rnw-section-title">Review your policy details</div>
            <div className="rnw-section-sub">
              We've extracted the following information. Please verify before continuing.
            </div>
            <VerifyStep
              policy={state.policy}
              vehicle={state.vehicle}
              customer={state.customer}
              confidence={state.extractionConfidence}
              inputMode={state.inputMode}
              onUpdatePolicy={app.updatePolicy}
              onUpdateVehicle={app.updateVehicle}
              onUpdateCustomer={app.updateCustomer}
              onContinue={app.nextStep}
              onBack={app.prevStep}
            />
          </>
        );
      case 3:
        return (
          <CoverageStep
            coverage={state.coverage}
            currentPolicy={currentPolicy}
            estimatedPremium={estimatedPremium}
            onSetType={app.setCoverageType}
            onToggleAddon={app.toggleAddon}
            onContinue={app.nextStep}
            onBack={app.prevStep}
          />
        );
      case 4:
        return (
          <ReviewStep
            state={state}
            estimatedPremium={estimatedPremium}
            currentPolicy={currentPolicy}
            onConfirmChange={app.setUserConfirmed}
            onSubmit={app.submitForQuotes}
            onBack={app.prevStep}
            onEditStep={app.goToStep}
            quoteState={state.quote}
            onSelectQuote={app.selectQuote}
            onRetryQuotes={app.retryQuotes}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="rnw-layout mesh-ambient-bg">
      {/* Top Glass Navbar with Overview, Wallet, Policies, Applications */}
      <UserNavbar />

      <div className="rnw-main">
        {/* Unified Page Header with Embedded RenewalStepper */}
        <div className="rnw-page-header">
          <div className="rnw-page-header-inner">
            <div className="rnw-page-header-text">
              <h1 className="rnw-page-title">Renew your auto insurance</h1>
              <p className="rnw-page-sub">
                Upload your existing policy and we'll prepare your renewal application automatically.
              </p>
            </div>
            <div className="rnw-page-header-stepper">
              <RenewalStepper currentStep={state.currentStep} onStepClick={app.goToStep} />
            </div>
          </div>
        </div>

        {/* Expiry warning banner */}
        {showExpiryBanner && (
          <div className={`rnw-expiry-banner${policyStatus.status === 'expired' ? ' rnw-expiry-banner--error' : ' rnw-expiry-banner--warning'}`}>
            <AlertCircle size={18} />
            <div className="rnw-expiry-banner-text">
              {policyStatus.status === 'expired'
                ? <><strong>Your policy has expired.</strong> You may still be able to obtain coverage, but additional steps may be required.</>
                : <><strong>Your policy expires in {policyStatus.daysRemaining} days.</strong> Renew now to avoid last-minute paperwork.</>
              }
            </div>
            <button className="rnw-expiry-banner-btn" onClick={handleStartRenewal}>Start Renewal</button>
          </div>
        )}

        {/* Draft recovery */}
        {draftAvailable && (
          <div className="rnw-draft-wrap">
            <div className="rnw-draft-banner">
              <div className="rnw-draft-icon"><FileText size={16} /></div>
              <div className="rnw-draft-text">
                <strong>Resume your renewal?</strong>
                <span>Your renewal application is almost complete.</span>
              </div>
              <div className="rnw-draft-actions">
                <button className="rnw-draft-btn rnw-draft-btn--primary" onClick={app.resumeDraft}>Resume</button>
                <button className="rnw-draft-btn rnw-draft-btn--secondary" onClick={app.discardDraft}>Start Over</button>
              </div>
            </div>
          </div>
        )}

        {/* Workspace */}
        <div className={`rnw-workspace${!showEuler ? ' rnw-workspace--full' : ''}`}>
          {/* Left: main content */}
          <div className="rnw-left-col">
            {renderStep()}
          </div>

          {/* Right: Euler (steps 1-3 only) */}
          {showEuler && (
            <div className="rnw-euler-col">
              <EulerPanel
                conversation={state.eulerConversation}
                onSendMessage={app.sendEulerMessage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

