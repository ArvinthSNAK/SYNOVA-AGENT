import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container" style={{ textAlign: 'center', paddingTop: 60, paddingBottom: 60 }}>
      {/* Hero Header */}
      <div style={{ maxWidth: 800, margin: '0 auto 50px' }}>
        <span className="badge badge-active" style={{ marginBottom: 16 }}>
          ⚡ Powered by Dynamic Non-Hardcoded Rules & Playwright Automation
        </span>
        <h1 style={{ fontSize: 44, color: '#F9FAFB', marginBottom: 16, lineHeight: 1.2 }}>
          Autonomous AI Insurance Aggregation & Comparison Platform
        </h1>
        <p style={{ fontSize: 18, color: '#9CA3AF', lineHeight: 1.6 }}>
          Select an insurance flow to begin. Our automated Playwright agents will autonomously visit 4 mock insurer portals (ICICI Lombard, Acko, TATA AIG, HDFC Ergo), retrieve live quotes, and rank policies using dynamic weighted criteria.
        </p>
      </div>

      {/* Choice Cards Grid */}
      <div className="grid-2" style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Choice 1: New Insurance */}
        <div 
          className="glass-card" 
          onClick={() => navigate('/new-insurance')}
          style={{ 
            textAlign: 'left', 
            cursor: 'pointer', 
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #6366F1, #8B5CF6)'
          }}></div>
          
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            marginBottom: 20
          }}>🚗</div>

          <h2 style={{ fontSize: 24, color: '#F9FAFB', marginBottom: 10 }}>New Insurance</h2>
          <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 20, minHeight: 60 }}>
            Configure vehicle details, registration year, IDV, and add-ons from scratch. Watch Playwright bots auto-fill forms live across 4 insurer sites.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6366F1', fontWeight: 600, fontSize: 15 }}>
            <span>Start New Application</span>
            <span>→</span>
          </div>
        </div>

        {/* Choice 2: Renew Insurance */}
        <div 
          className="glass-card" 
          onClick={() => navigate('/renew-insurance')}
          style={{ 
            textAlign: 'left', 
            cursor: 'pointer', 
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(217, 70, 239, 0.3)'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #8B5CF6, #D946EF)'
          }}></div>

          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(217, 70, 239, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            marginBottom: 20
          }}>📄</div>

          <h2 style={{ fontSize: 24, color: '#F9FAFB', marginBottom: 10 }}>Renew Insurance</h2>
          <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 20, minHeight: 60 }}>
            Upload your previous insurance policy PDF. Our PDF extraction engine parses policy number, IDV, and NCB to pre-fill the multi-insurer comparison workflow.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#D946EF', fontWeight: 600, fontSize: 15 }}>
            <span>Upload Policy PDF & Renew</span>
            <span>→</span>
          </div>
        </div>
      </div>

      {/* Insurer Replicas Grid Preview */}
      <div style={{ marginTop: 60, maxWidth: 960, margin: '60px auto 0' }}>
        <h3 style={{ fontSize: 16, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>
          Supported Mock Insurer Portals
        </h3>
        <div className="grid-4">
          <div className="glass-card" style={{ padding: 16, borderLeft: '4px solid #F58220' }}>
            <div style={{ fontWeight: 700, color: '#F9FAFB', fontSize: 15 }}>ICICI Lombard</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>Port 8001 • Comprehensive</div>
          </div>
          <div className="glass-card" style={{ padding: 16, borderLeft: '4px solid #673AB7' }}>
            <div style={{ fontWeight: 700, color: '#F9FAFB', fontSize: 15 }}>Acko Drive</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>Port 8002 • Direct D2C</div>
          </div>
          <div className="glass-card" style={{ padding: 16, borderLeft: '4px solid #002664' }}>
            <div style={{ fontWeight: 700, color: '#F9FAFB', fontSize: 15 }}>TATA AIG</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>Port 8003 • Auto Secure</div>
          </div>
          <div className="glass-card" style={{ padding: 16, borderLeft: '4px solid #E31837' }}>
            <div style={{ fontWeight: 700, color: '#F9FAFB', fontSize: 15 }}>HDFC ERGO</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>Port 8004 • Motor Shield</div>
          </div>
        </div>
      </div>
    </div>
  );
}
