import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import AppRoutes from './routes/AppRoutes';
import AiAssistantModal from './components/common/AiAssistantModal';
import ScrollToTop from './components/common/ScrollToTop';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      <ScrollToTop />
      <Navbar />
      
      <main style={{ flex: 1 }}>
        <AppRoutes />
      </main>

      {/* Global Floating AI Copilot */}
      <AiAssistantModal />

      {/* Premium Minimal Dark Footer */}
      <footer
        style={{
          background: 'var(--primary-navy)',
          color: '#FFFFFF',
          padding: '64px 0 32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          marginTop: 64,
        }}
      >
        <div className="page-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: 48,
              paddingBottom: 48,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Brand column */}
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: '#FFFFFF',
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                SYNOVA
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ai-accent)' }}></span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-on-dark-muted)', lineHeight: 1.6, maxWidth: 320 }}>
                Intelligent autonomous insurance aggregator. Analyzing policy coverage, comparing top providers, and automating renewals with AI precision.
              </p>
            </div>

            {/* Column 1: Product */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF', marginBottom: 16 }}>
                Product
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--text-on-dark-muted)' }}>
                <li><Link to="/new-insurance" style={{ color: 'inherit' }}>Instant Quotations</Link></li>
                <li><Link to="/renew-insurance" style={{ color: 'inherit' }}>OCR Renewal Engine</Link></li>
                <li><Link to="/insurance-vault" style={{ color: 'inherit' }}>Digital Policy Vault</Link></li>
                <li><Link to="/insurance-vault" style={{ color: 'inherit' }}>FNOL Claims Filing</Link></li>
              </ul>
            </div>

            {/* Column 2: Company */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF', marginBottom: 16 }}>
                Company
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--text-on-dark-muted)' }}>
                <li><a href="/#about" style={{ color: 'inherit' }}>About Synova</a></li>
                <li><a href="/#how-it-works" style={{ color: 'inherit' }}>How It Works</a></li>
                <li><a href="#careers" style={{ color: 'inherit' }}>Careers</a></li>
                <li><a href="#contact" style={{ color: 'inherit' }}>Contact & Support</a></li>
              </ul>
            </div>

            {/* Column 3: Resources & Compliance */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFFF', marginBottom: 16 }}>
                Resources
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--text-on-dark-muted)' }}>
                <li><a href="#help" style={{ color: 'inherit' }}>Help Center</a></li>
                <li><a href="#privacy" style={{ color: 'inherit' }}>Privacy Policy</a></li>
                <li><a href="#terms" style={{ color: 'inherit' }}>Terms of Service</a></li>
                <li><a href="#security" style={{ color: 'inherit' }}>Data Security</a></li>
              </ul>
            </div>
          </div>

          <div
            style={{
              paddingTop: 28,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 13,
              color: 'var(--text-on-dark-muted)',
            }}
          >
            <div>© 2026 Synova AI Technologies. All rights reserved.</div>
            <div style={{ display: 'flex', gap: 20 }}>
              <span>256-bit SSL Encryption</span>
              <span>•</span>
              <span>Autonomous AI Aggregation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
