import React, { useEffect, useState, memo } from 'react';
import { Shield, Car, HeartPulse, Plane, Home, Users } from 'lucide-react';

/**
 * Brand-themed orbiting badge: a central shield with insurance-category
 * icons circling it on two rings. Ported from a standalone Tailwind/TS
 * "orbiting-skills" widget into this project's plain JS + inline-style
 * conventions (no Tailwind/shadcn in this codebase), recolored to the
 * SYNOVA black/lavender palette.
 */

const orbitConfig = [
  // Inner ring
  { id: 'motor', orbitRadius: 78, size: 40, speed: 0.55, phaseShift: 0, icon: Car, label: 'Motor' },
  { id: 'health', orbitRadius: 78, size: 40, speed: 0.55, phaseShift: (2 * Math.PI) / 3, icon: HeartPulse, label: 'Health' },
  { id: 'travel', orbitRadius: 78, size: 40, speed: 0.55, phaseShift: (4 * Math.PI) / 3, icon: Plane, label: 'Travel' },
  // Outer ring
  { id: 'home', orbitRadius: 128, size: 44, speed: -0.35, phaseShift: 0, icon: Home, label: 'Home' },
  { id: 'life', orbitRadius: 128, size: 44, speed: -0.35, phaseShift: Math.PI, icon: Users, label: 'Life' },
];

const OrbitBadge = memo(function OrbitBadge({ config, angle }) {
  const [hovered, setHovered] = useState(false);
  const { orbitRadius, size, icon: Icon, label } = config;

  const x = Math.cos(angle) * orbitRadius;
  const y = Math.sin(angle) * orbitRadius;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: size,
        height: size,
        transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
        zIndex: hovered ? 5 : 2,
        transition: 'z-index 0s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(222, 216, 237, 0.28)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#DED8ED',
          cursor: 'pointer',
          transform: hovered ? 'scale(1.18)' : 'scale(1)',
          boxShadow: hovered ? '0 0 24px rgba(222, 216, 237, 0.45)' : 'none',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        }}
      >
        <Icon size={Math.round(size * 0.46)} strokeWidth={2} />
        {hovered && (
          <div
            style={{
              position: 'absolute',
              bottom: -26,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '3px 9px',
              background: 'rgba(17, 17, 17, 0.95)',
              borderRadius: 6,
              fontSize: 10.5,
              fontWeight: 700,
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
});

const OrbitRing = memo(function OrbitRing({ radius }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: radius * 2,
        height: radius * 2,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        pointerEvents: 'none',
      }}
    />
  );
});

export default function OrbitingCoverageBadge({ size = 300, showCenter = true }) {
  const [time, setTime] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    let rafId;
    let lastTime = performance.now();

    const tick = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      setTime((prev) => prev + delta);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [paused]);

  return (
    <div
      style={{ position: 'relative', width: size, height: size }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <OrbitRing radius={78} />
      <OrbitRing radius={128} />

      {/* Faint ambient glow dots (matches reference screenshot) */}
      <span
        style={{
          position: 'absolute', top: '18%', left: '50%', width: 6, height: 6,
          borderRadius: '50%', background: '#DED8ED', boxShadow: '0 0 10px rgba(222, 216, 237, 0.6)',
        }}
      />
      <span
        style={{
          position: 'absolute', top: '58%', left: '14%', width: 5, height: 5,
          borderRadius: '50%', background: 'rgba(255, 255, 255, 0.7)', boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
        }}
      />

      {/* Central shield badge */}
      {showCenter && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #5B5171 0%, #3D3550 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 40px rgba(222, 216, 237, 0.18), 0 12px 30px rgba(0, 0, 0, 0.4)',
            zIndex: 3,
          }}
        >
          <Shield size={34} color="#FFFFFF" strokeWidth={1.8} />
        </div>
      )}

      {orbitConfig.map((config) => {
        const angle = time * config.speed + config.phaseShift;
        return <OrbitBadge key={config.id} config={config} angle={angle} />;
      })}
    </div>
  );
}
