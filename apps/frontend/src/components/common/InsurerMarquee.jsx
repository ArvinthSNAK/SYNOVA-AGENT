import React from 'react';
import { useNavigate } from 'react-router-dom';
import InsurerLogoBadge from './InsurerLogoBadge';

const INSURERS_ROW1 = [
  {
    id: 'icici',
    name: 'ICICI Lombard',
    tagline: 'General Insurance',
    metric: '98.8% Settlement',
    badge: 'Official Portal',
    type: 'Motor • Health',
    website: 'https://www.icicilombard.com/',
  },
  {
    id: 'tata',
    name: 'TATA AIG',
    tagline: 'With You Always',
    metric: '99.1% Settlement',
    badge: 'Official Portal',
    type: 'Auto • Travel',
    website: 'https://www.tataaig.com/',
  },
  {
    id: 'hdfc',
    name: 'HDFC ERGO',
    tagline: 'General Insurance',
    metric: '99.4% Settlement',
    badge: 'Official Portal',
    type: 'Comprehensive',
    website: 'https://www.hdfcergo.com/',
  },
  {
    id: 'acko',
    name: 'ACKO Drive',
    tagline: 'Tech-First Insurance',
    metric: 'Zero Paperwork',
    badge: 'Official Portal',
    type: 'Direct Auto',
    website: 'https://www.acko.com/',
  },
  {
    id: 'bajaj',
    name: 'Bajaj Allianz',
    tagline: 'General Insurance',
    metric: '98.5% Settlement',
    badge: 'Official Portal',
    type: 'Motor • Health',
    website: 'https://www.bajajallianz.com/',
  },
  {
    id: 'digit',
    name: 'Go Digit',
    tagline: 'General Insurance',
    metric: '2-Min Video Claims',
    badge: 'Official Portal',
    type: 'Zero Dep',
    website: 'https://www.godigit.com/',
  },
];

const INSURERS_ROW2 = [
  {
    id: 'sbi',
    name: 'SBI General',
    tagline: 'Suraksha Aur Bharosa',
    metric: 'PAN-India Garages',
    badge: 'Official Portal',
    type: 'Motor • Fire',
    website: 'https://www.sbigeneral.in/',
  },
  {
    id: 'star',
    name: 'Star Health',
    tagline: 'Allied Insurance',
    metric: '14,000+ Hospitals',
    badge: 'Official Portal',
    type: 'Family Floater',
    website: 'https://www.starhealth.in/',
  },
  {
    id: 'care',
    name: 'Care Health',
    tagline: 'Enterprise Health Cover',
    metric: '95.2% Claim Ratio',
    badge: 'Official Portal',
    type: 'Critical Shield',
    website: 'https://www.careinsurance.com/',
  },
  {
    id: 'reliance',
    name: 'Reliance General',
    tagline: 'Tech-Assisted Claims',
    metric: '10,000+ Garages',
    badge: 'Official Portal',
    type: 'Motor Shield',
    website: 'https://www.reliancegeneral.co.in/',
  },
  {
    id: 'sompo',
    name: 'Universal Sompo',
    tagline: 'General Insurance',
    metric: 'Instant Approval',
    badge: 'Official Portal',
    type: 'Commercial Auto',
    website: 'https://www.universalsompo.com/',
  },
  {
    id: 'generali',
    name: 'Future Generali',
    tagline: 'Total Care Insurance',
    metric: 'Smart Assist 24x7',
    badge: 'Official Portal',
    type: 'Motor • Property',
    website: 'https://general.futuregenerali.in/',
  },
];

export default function InsurerMarquee() {
  const handleInsurerClick = (insurer) => {
    if (insurer.website) {
      window.open(insurer.website, '_blank', 'noopener,noreferrer');
    }
  };

  const track1 = [...INSURERS_ROW1, ...INSURERS_ROW1, ...INSURERS_ROW1];
  const track2 = [...INSURERS_ROW2, ...INSURERS_ROW2, ...INSURERS_ROW2];

  return (
    <div style={{ width: '100%', overflow: 'hidden', padding: '40px 0 20px', background: 'transparent' }}>
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: 24, padding: '0 20px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#FFFFFF',
            border: '1px solid rgba(28, 28, 28, 0.16)',
            padding: '5px 16px',
            borderRadius: 9999,
            marginBottom: 10,
            boxShadow: '0 2px 8px rgba(28, 28, 28, 0.04)',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-emerald)' }}></span>
          <span style={{ color: 'var(--blue-primary)', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Live Insurer Network & Gateway Aggregators
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13.5, maxWidth: 600, margin: '0 auto' }}>
          Real-time API quotes aggregated across India's top general & health insurance providers.
        </p>
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
              {/* Authentic Brand Logo */}
              <InsurerLogoBadge insurerName={item.name} size={44} rounded={12} />

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
              {/* Authentic Brand Logo */}
              <InsurerLogoBadge insurerName={item.name} size={44} rounded={12} />

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
