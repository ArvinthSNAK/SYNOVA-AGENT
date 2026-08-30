import React from 'react';

export default function SynovaOwlLogo({ size = 40, showText = true, textStyle = {}, style = {} }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, ...style }}>
      {/* Official Synova Owl Mascot Logo (recolored to brand theme) */}
      <img
        src="/assets/synova-owl.svg"
        alt="Synova Owl Mascot Logo"
        width={size}
        height={size}
        style={{
          display: 'block',
          width: size,
          height: size,
          objectFit: 'contain',
          flexShrink: 0,
          filter: 'drop-shadow(0 2px 8px rgba(28, 28, 28, 0.12))',
        }}
      />
      {showText && (
        <span
          style={{
            fontFamily: 'var(--font-heading, "Inter", sans-serif)',
            fontSize: Math.round(size * 0.58),
            fontWeight: 900,
            letterSpacing: '-0.02em',
            color: 'var(--text-heading, #1C1C1C)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            ...textStyle,
          }}
        >
          SYNOVA
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ai-accent, #6E6285)' }}></span>
        </span>
      )}
    </div>
  );
}
