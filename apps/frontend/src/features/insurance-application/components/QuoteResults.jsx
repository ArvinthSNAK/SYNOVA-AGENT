import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Star, ArrowLeft, CheckCircle } from 'lucide-react';
import DashboardSidebar from '../../dashboard/components/DashboardSidebar.jsx';
import { useState } from 'react';

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount);
}

function QuoteCard({ quote, isRecommended }) {
  return (
    <div className={`qr-card${isRecommended ? ' qr-card--recommended' : ''}`}>
      {isRecommended && (
        <div className="qr-card-best-badge">
          <Star size={11} /> Best Match
        </div>
      )}
      <div className="qr-card-header">
        <div className="qr-card-provider">{quote.providerName}</div>
        <div className="qr-card-coverage">{quote.coverageType}</div>
      </div>
      <div className="qr-card-premium-row">
        <div>
          <div className="qr-card-premium">{formatINR(quote.premium)}</div>
          <div className="qr-card-period">per year</div>
        </div>
        <div className="qr-card-idv">
          <div className="qr-card-idv-label">IDV</div>
          <div className="qr-card-idv-value">{formatINR(quote.idv)}</div>
        </div>
      </div>
      {quote.addons.length > 0 && (
        <div className="qr-card-addons">
          {quote.addons.map((a) => (
            <span key={a} className="qr-card-addon-tag">{a}</span>
          ))}
        </div>
      )}
      <ul className="qr-card-benefits">
        {quote.benefits.map((b) => (
          <li key={b} className="qr-card-benefit">
            <CheckCircle size={12} />
            {b}
          </li>
        ))}
      </ul>
      <button className="qr-select-btn" type="button" aria-label={`Select ${quote.providerName} quote`}>
        Select This Quote
      </button>
    </div>
  );
}

export default function QuoteResults() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const results = location.state?.results || [];

  const sortedResults = [...results].sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0));

  return (
    <div className="ins-layout">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="ins-main">
        <header className="ins-topbar">
          <div className="ins-topbar-left">
            <Link to="/new-insurance" className="qr-back-link">
              <ArrowLeft size={16} /> New Insurance
            </Link>
          </div>
          <div className="ins-topbar-center">
            <span className="qr-topbar-title">Quote Comparison</span>
          </div>
          <div className="ins-topbar-right" />
        </header>

        <div className="ins-page-header">
          <div className="ins-page-header-inner">
            <h1 className="ins-page-title">Compare your quotes</h1>
            <p className="ins-page-sub">
              {results.length > 0
                ? `We found ${results.length} quotes for your vehicle. The best match is highlighted.`
                : 'Quote results will appear here once comparison is complete.'}
            </p>
          </div>
        </div>

        <div className="qr-workspace">
          {results.length === 0 ? (
            <div className="ins-quotes-placeholder">
              <ShieldCheck size={40} color="var(--color-primary)" />
              <h2>Quote results will appear here</h2>
              <p>This page receives quote data from the Playwright comparison engine.</p>
              <Link to="/new-insurance" className="vi-btn vi-btn--primary" style={{ textDecoration: 'none' }}>
                ← Start Application
              </Link>
            </div>
          ) : (
            <div className="qr-cards-grid">
              {sortedResults.map((quote) => (
                <QuoteCard
                  key={quote.providerId}
                  quote={quote}
                  isRecommended={quote.isRecommended}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
