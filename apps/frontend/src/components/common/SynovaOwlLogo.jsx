import React from 'react';

export default function SynovaOwlLogo({ size = 40, showText = true, textStyle = {}, style = {} }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, ...style }}>
      {/* Official Synova Owl Mascot Logo */}
      <img
        src="/assets/synova-mascot-transparent.png"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = '/assets/synova-mascot-owl.png';
        }}
        alt="Synova Owl Mascot Logo"
        width={size}
        height={size}
        style={{
          display: 'block',
          width: size,
          height: size,
          objectFit: 'contain',
          flexShrink: 0,
          filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.12))',
        }}
      />
      {showText && (
        <span
          style={{
            fontFamily: 'var(--font-heading, "Inter", sans-serif)',
            fontSize: Math.round(size * 0.58),
            fontWeight: 900,
            letterSpacing: '-0.02em',
            color: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            ...textStyle,
          }}
        >
          SYNOVA
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563EB' }}></span>
        </span>
      )}
    </div>
  );
}
