import React from 'react';
import { useNavigate } from 'react-router-dom';

const INSURERS_ROW1 = [
  {
    name: 'ICICI Lombard',
    tagline: 'General Insurance',
    abbr: 'ICICI',
    gradient: 'linear-gradient(135deg, #E65100 0%, #C62828 100%)',
    metric: '98.8% Settlement',
    badge: 'API Connected',
    type: 'Motor • Health',
  },
  {
    name: 'TATA AIG',
    tagline: 'With You Always',
    abbr: 'TATA',
    gradient: 'linear-gradient(135deg, #005088 0%, #0077C8 100%)',
    metric: '99.1% Settlement',
    badge: 'API Connected',
    type: 'Auto • Travel',
  },
  {
    name: 'HDFC ERGO',
    tagline: 'General Insurance',
    abbr: 'HDFC',
    gradient: 'linear-gradient(135deg, #D32F2F 0%, #0B1F3A 100%)',
    metric: '99.4% Settlement',
    badge: 'API Connected',
    type: 'Comprehensive',
  },
  {
    name: 'ACKO Drive',
    tagline: 'Tech-First Insurance',
    abbr: 'ACKO',
    gradient: 'linear-gradient(135deg, #5B5FEF 0%, #3B82F6 100%)',
    metric: 'Zero Paperwork',
    badge: 'Live Gateway',
    type: 'Direct Auto',
  },
  {
    name: 'Bajaj Allianz',
    tagline: 'General Insurance',
    abbr: 'BAJAJ',
    gradient: 'linear-gradient(135deg, #005696 0%, #0088D4 100%)',
    metric: '98.5% Settlement',
    badge: 'Instant Cashless',
    type: 'Motor • Health',
  },
  {
    name: 'Go Digit',
    tagline: 'General Insurance',
    abbr: 'DIGIT',
    gradient: 'linear-gradient(135deg, #FF9800 0%, #E65100 100%)',
    metric: '2-Min Video Claims',
    badge: 'Digital Native',
    type: 'Zero Dep',
  },
];

const INSURERS_ROW2 = [
  {
    name: 'SBI General',
    tagline: 'Suraksha Aur Bharosa',
    abbr: 'SBI',
    gradient: 'linear-gradient(135deg, #0A4C86 0%, #1565C0 100%)',
    metric: 'PAN-India Garages',
    badge: 'Network Leader',
    type: 'Motor • Fire',
  },
  {
    name: 'Star Health',
    tagline: 'Allied Insurance',
    abbr: 'STAR',
    gradient: 'linear-gradient(135deg, #005C8A 0%, #00897B 100%)',
    metric: '14,000+ Hospitals',
    badge: 'Health Specialist',
    type: 'Family Floater',
  },
  {
    name: 'Care Health',
    tagline: 'Enterprise Health Cover',
    abbr: 'CARE',
    gradient: 'linear-gradient(135deg, #E64A19 0%, #F57C00 100%)',
    metric: '95.2% Claim Ratio',
    badge: 'Cashless Everywhere',
    type: 'Critical Shield',
  },
  {
    name: 'Reliance General',
    tagline: 'Tech-Assisted Claims',
    abbr: 'R-GEN',
    gradient: 'linear-gradient(135deg, #B71C1C 0%, #0D47A1 100%)',
    metric: '10,000+ Garages',
    badge: 'Active Scraper',
    type: 'Motor Shield',
  },
  {
    name: 'Universal Sompo',
    tagline: 'General Insurance',
    abbr: 'SOMPO',
    gradient: 'linear-gradient(135deg, #2E7D32 0%, #00695C 100%)',
    metric: 'Instant Inspection',
    badge: 'Integrated',
    type: 'Commercial & PV',
  },
  {
    name: 'New India Assurance',
    tagline: 'Govt. Backed Leader',
    abbr: 'NIA',
    gradient: 'linear-gradient(135deg, #0D47A1 0%, #311B92 100%)',
    metric: 'Largest Market Share',
    badge: 'Public Sector',
    type: 'All Risk Cover',
  },
];

export default function InsurerMarquee() {
  const navigate = useNavigate();

  const handleInsurerClick = (insurer) => {
    navigate('/new-insurance');
  };

  // Duplicate arrays to create seamless infinite looping tracks
  const track1 = [...INSURERS_ROW1, ...INSURERS_ROW1, ...INSURERS_ROW1];
  const track2 = [...INSURERS_ROW2, ...INSURERS_ROW2, ...INSURERS_ROW2];

  return (
    <div style={{ marginTop: 24, marginBottom: 48, width: '100%', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            background: 'rgba(11, 31, 58, 0.04)',
            padding: '6px 16px',
            borderRadius: 9999,
            border: '1px solid rgba(11, 31, 58, 0.08)',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-emerald)' }}></span>
          Live Insurer Network & Gateway Aggregators
        </div>
      </div>

      {/* Row 1: Leftward Infinite Scroll */}
      <div className="marquee-wrapper">
        <div className="marquee-track">
          {track1.map((item, idx) => (
            <div
              key={`row1-${idx}`}
              className="insurer-card"
              onClick={() => handleInsurerClick(item)}
              title={`Compare ${item.name} quotes on Synova`}
            >
              {/* Brand Logo Avatar */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: item.gradient,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: '-0.02em',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                  flexShrink: 0,
                }}
              >
                {item.abbr}
              </div>

              {/* Insurer Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary-navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </span>
                  <span className="badge badge-ai" style={{ fontSize: 9.5, padding: '1px 6px' }}>
                    {item.badge}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {item.type}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--status-emerald)', whiteSpace: 'nowrap' }}>
                    {item.metric}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Rightward / Reverse Infinite Scroll */}
      <div className="marquee-wrapper" style={{ marginTop: 6 }}>
        <div className="marquee-track-reverse">
          {track2.map((item, idx) => (
            <div
              key={`row2-${idx}`}
              className="insurer-card"
              onClick={() => handleInsurerClick(item)}
              title={`Compare ${item.name} quotes on Synova`}
            >
              {/* Brand Logo Avatar */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: item.gradient,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: '-0.02em',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                  flexShrink: 0,
                }}
              >
                {item.abbr}
              </div>

              {/* Insurer Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary-navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </span>
                  <span className="badge badge-blue" style={{ fontSize: 9.5, padding: '1px 6px' }}>
                    {item.badge}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {item.type}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-primary)', whiteSpace: 'nowrap' }}>
                    {item.metric}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
