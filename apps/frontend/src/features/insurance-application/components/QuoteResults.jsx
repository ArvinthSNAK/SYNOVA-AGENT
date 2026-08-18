import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Star, ArrowLeft, CheckCircle } from 'lucide-react';
import UserNavbar from '../../../components/layout/UserNavbar.jsx';

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
  const results = location.state?.results || [];

  const sortedResults = [...results].sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0));

  return (
    <div className="ins-layout mesh-ambient-bg">
      {/* Top Glass Navbar with Overview, Wallet, Policies, Applications */}
      <UserNavbar />

      <div className="ins-main">
        <div className="ins-page-header" style={{ padding: '20px 0 10px' }}>
          <div className="ins-page-header-inner">
            <Link to="/new-insurance" className="qr-back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 13, color: 'var(--color-primary)' }}>
              <ArrowLeft size={14} /> Back to Application
            </Link>
            <h1 className="ins-page-title">Compare live insurance quotes</h1>
            <p className="ins-page-sub">
              Euler retrieved quotes from multiple IRDAI-licensed carriers in real time. Select your preferred coverage.
            </p>
          </div>
        </div>

        <div className="qr-content" style={{ marginTop: 20 }}>
          {sortedResults.length === 0 ? (
            <div className="qr-empty">
              <ShieldCheck size={48} strokeWidth={1} />
              <h3>No quotes available</h3>
              <p>Please return to the application and submit your details to fetch real-time carrier quotes.</p>
              <Link to="/new-insurance" className="qr-retry-btn">
                Start New Application
              </Link>
            </div>
          ) : (
            <div className="qr-grid">
              {sortedResults.map((q) => (
                <QuoteCard
                  key={q.quoteId}
                  quote={q}
                  isRecommended={q.isRecommended}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
