import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  FolderOpen,
  Shield,
  Activity,
  ChevronRight,
  CheckCircle,
  Clock,
  Circle,
  FileText,
  Download,
  Eye,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Zap,
  TrendingUp
} from 'lucide-react';
import { dashboardData } from '../data/dashboardData.js';
import './DashboardWorkspace.css';

const { application, documents, claims, activity } = dashboardData;

const stepStatusIcons = {
  completed: CheckCircle,
  current: Clock,
  pending: Circle,
};

export default function DashboardWorkspace({ onOpenEuler }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'documents' | 'claims' | 'activity'
  const [downloadedDocId, setDownloadedDocId] = useState(null);

  const handleDownloadDoc = (docId) => {
    setDownloadedDocId(docId);
    setTimeout(() => setDownloadedDocId(null), 2500);
  };

  const eulerPrompts = [
    { text: "What is my NCB discount value?", query: "Can you explain my 20% No Claim Bonus discount and savings?" },
    { text: "Compare ICICI vs ACKO quotes", query: "Can you compare my ICICI Lombard policy against ACKO?" },
    { text: "How do I add Zero Depreciation?", query: "Tell me more about Zero Depreciation add-on cover." },
  ];

  return (
    <div className="dashboard-workspace-container">
      {/* ─── Euler AI Interactive Insight Capsule ───────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="euler-insight-capsule glass-panel-dark"
      >
        <div className="euler-capsule-head">
          <div className="euler-capsule-avatar">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="euler-capsule-tag">✦ EULER AI COPILOT</div>
            <h4 className="euler-capsule-title">Active AI Policy Diagnostics</h4>
          </div>
        </div>

        <p className="euler-capsule-text">
          Your Creta policy has <strong style={{ color: '#5eead4' }}>96% coverage rating</strong>. Tap below to ask Euler anything about claims, add-ons, or quotes.
        </p>

        <div className="euler-capsule-prompts">
          {eulerPrompts.map((p, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="euler-capsule-chip"
              onClick={() => {
                if (onOpenEuler) onOpenEuler(p.query);
                else {
                  const btn = document.querySelector('.euler-launcher-btn');
                  if (btn) btn.click();
                }
              }}
            >
              <Zap size={12} className="euler-chip-zap" />
              <span>{p.text}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ─── Interactive Multi-Tab Workspace Card ───────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15 }}
        className="workspace-card glass-panel"
      >
        {/* Workspace Header & Segment Navigation */}
        <div className="workspace-header">
          <div className="workspace-nav-pills" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'applications'}
              className={`workspace-tab-btn ${activeTab === 'applications' ? 'workspace-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              <ClipboardList size={14} />
              <span>Application Tracker</span>
              <span className="workspace-tab-dot" />
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'documents'}
              className={`workspace-tab-btn ${activeTab === 'documents' ? 'workspace-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              <FolderOpen size={14} />
              <span>Vault ({documents.length})</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'claims'}
              className={`workspace-tab-btn ${activeTab === 'claims' ? 'workspace-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('claims')}
            >
              <Shield size={14} />
              <span>Claims</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'activity'}
              className={`workspace-tab-btn ${activeTab === 'activity' ? 'workspace-tab-btn--active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              <Activity size={14} />
              <span>Audit Log</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="workspace-content-body">
          <AnimatePresence mode="wait">
            {/* 1. Applications Tab */}
            {activeTab === 'applications' && (
              <motion.div
                key="apps"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="workspace-tab-content"
              >
                <div className="workspace-app-banner">
                  <div className="workspace-app-meta">
                    <span className="workspace-app-id mono">{application.id}</span>
                    <span className="workspace-app-title">{application.title}</span>
                    <span className="workspace-app-badge">Quotes Ready</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="workspace-app-action-btn"
                    onClick={() => navigate('/new-insurance/quotes')}
                  >
                    <span>Compare Quotes</span>
                    <ArrowRight size={13} />
                  </motion.button>
                </div>

                <div className="workspace-steps-list">
                  {application.steps.map((step, idx) => {
                    const Icon = stepStatusIcons[step.status] || Circle;
                    return (
                      <div key={step.id} className={`workspace-step workspace-step--${step.status}`}>
                        <div className="workspace-step-icon-wrap">
                          <Icon size={14} />
                          {idx < application.steps.length - 1 && <span className="workspace-step-line" />}
                        </div>
                        <div className="workspace-step-text">
                          <span className="workspace-step-name">{step.label}</span>
                          {step.date && <span className="workspace-step-time">{step.date}</span>}
                        </div>
                        {step.status === 'current' && (
                          <span className="workspace-step-live-pill">In Progress</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 2. Documents Tab */}
            {activeTab === 'documents' && (
              <motion.div
                key="docs"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="workspace-tab-content"
              >
                <div className="workspace-docs-grid">
                  {documents.map((doc) => (
                    <div key={doc.id} className="workspace-doc-item">
                      <div className="workspace-doc-icon">
                        <FileText size={18} />
                      </div>
                      <div className="workspace-doc-details">
                        <span className="workspace-doc-name">{doc.name}</span>
                        <div className="workspace-doc-meta">
                          <span>{doc.type}</span>
                          <span>·</span>
                          <span>{doc.size}</span>
                          <span>·</span>
                          <span>{doc.date}</span>
                        </div>
                      </div>
                      <div className="workspace-doc-actions">
                        <button
                          className="workspace-doc-btn"
                          onClick={() => handleDownloadDoc(doc.id)}
                          title="Download document"
                        >
                          {downloadedDocId === doc.id ? (
                            <Check size={14} style={{ color: 'var(--color-success)' }} />
                          ) : (
                            <Download size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 3. Claims Tab */}
            {activeTab === 'claims' && (
              <motion.div
                key="claims"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="workspace-tab-content"
              >
                <div className="workspace-claims-banner">
                  <div className="workspace-claims-badge">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h4 className="workspace-claims-title">Zero Claims Filed in 2026</h4>
                    <p className="workspace-claims-sub">
                      You are preserving your <strong>20% No Claim Bonus</strong>, boosting next year's renewal savings to <strong>25% NCB</strong>.
                    </p>
                  </div>
                </div>

                <div className="workspace-claims-actions">
                  <button
                    className="workspace-claim-cta"
                    onClick={() => alert("Initiating Quick Claim filing assistant with Euler...")}
                  >
                    <span>File a Fast Track Claim</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 4. Activity Audit Log Tab */}
            {activeTab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="workspace-tab-content"
              >
                <div className="workspace-activity-list">
                  {activity.map((act) => (
                    <div key={act.id} className="workspace-activity-row">
                      <div className="workspace-activity-bullet" />
                      <div className="workspace-activity-info">
                        <span className="workspace-activity-label">{act.label}</span>
                        <span className="workspace-activity-detail">{act.detail}</span>
                      </div>
                      <span className="workspace-activity-date">{act.dateLabel}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
