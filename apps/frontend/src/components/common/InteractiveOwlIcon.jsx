import React, { useEffect, useId, useRef } from 'react';

const EYES = [
  { x: 74, y: 103 },
  { x: 126, y: 103 },
];
const REACH = 7.5;

/**
 * Small interactive owl mark: pupils track the cursor anywhere on the page,
 * blinks idly, wanders when the pointer has been still a while, and hops
 * when clicked. Ported from a standalone HTML/canvas-free SVG+JS demo into
 * a self-contained React component (own rAF loop + listeners per instance).
 */
export default function InteractiveOwlIcon({ size = 28, className = '' }) {
  const rawId = useId().replace(/[:]/g, '');
  const svgRef = useRef(null);
  const tiltRef = useRef(null);
  const pupilRefs = useRef([]);
  const lidRefs = useRef([]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;

    const state = {
      cur: [{ x: 0, y: 0 }, { x: 0, y: 0 }],
      tgt: [{ x: 0, y: 0 }, { x: 0, y: 0 }],
      tiltC: { x: 0, y: 0 },
      tiltT: { x: 0, y: 0 },
      blink: 0,
      nextBlink: 1200 + Math.random() * 3000,
      queued: 0,
      hop: 0,
    };
    const pointer = { x: null, y: null, moved: 0 };

    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

    const handlePointerMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.moved = performance.now();
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    let alive = true;
    let last = 0;
    let rafId = 0;

    const frame = (now) => {
      if (!alive) return;
      const dt = Math.min(50, now - (last || now));
      last = now;
      const idle = pointer.x === null || now - pointer.moved > 3500;

      const rect = svg.getBoundingClientRect();
      const scale = rect.width / 200;

      for (let e = 0; e < 2; e++) {
        const ex = rect.left + EYES[e].x * scale;
        const ey = rect.top + EYES[e].y * scale;

        if (idle) {
          const ph = now / 2600 + e * 0.6;
          state.tgt[e].x = Math.cos(ph) * REACH * 0.45;
          state.tgt[e].y = Math.sin(ph * 0.7) * REACH * 0.3;
        } else {
          const dx = pointer.x - ex;
          const dy = pointer.y - ey;
          const d = Math.hypot(dx, dy) || 1;
          const pull = Math.min(1, d / (rect.width * 1.6 || 1));
          state.tgt[e].x = (dx / d) * REACH * pull;
          state.tgt[e].y = (dy / d) * REACH * pull * 0.85;
        }

        state.cur[e].x += (state.tgt[e].x - state.cur[e].x) * 0.16;
        state.cur[e].y += (state.tgt[e].y - state.cur[e].y) * 0.16;
        const pupil = pupilRefs.current[e];
        if (pupil) pupil.setAttribute('transform', `translate(${state.cur[e].x.toFixed(2)},${state.cur[e].y.toFixed(2)})`);
      }

      if (idle) {
        state.tiltT.x = 0;
        state.tiltT.y = 0;
      } else {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        state.tiltT.x = clamp((pointer.x - cx) / (rect.width || 1), -1, 1) * 3.5;
        state.tiltT.y = clamp((pointer.y - cy) / (rect.height || 1), -1, 1) * 2.2;
      }
      state.tiltC.x += (state.tiltT.x - state.tiltC.x) * 0.07;
      state.tiltC.y += (state.tiltT.y - state.tiltC.y) * 0.07;

      if (state.hop > 0.001) state.hop *= 0.9;
      else state.hop = 0;
      const hopY = -Math.sin(state.hop * Math.PI) * 7;
      if (tiltRef.current) {
        tiltRef.current.setAttribute('transform', `translate(${state.tiltC.x.toFixed(2)},${(state.tiltC.y + hopY).toFixed(2)})`);
      }

      state.nextBlink -= dt;
      if (state.nextBlink <= 0 && state.blink === 0) {
        state.blink = 0.001;
        state.nextBlink = 2200 + Math.random() * 4200;
        if (Math.random() < 0.25) state.queued = 1;
      }
      if (state.blink > 0) {
        state.blink += dt / 150;
        const lid = state.blink < 1 ? state.blink : Math.max(0, 2 - state.blink);
        const shut = clamp(lid, 0, 1) * 36;
        for (let l = 0; l < 2; l++) {
          const lidEl = lidRefs.current[l];
          if (lidEl) lidEl.setAttribute('transform', `translate(0,${shut.toFixed(1)})`);
        }
        if (state.blink >= 2) {
          state.blink = 0;
          if (state.queued > 0) {
            state.queued--;
            state.blink = 0.001;
          }
        }
      }

      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    const handleClick = () => {
      state.queued = 2;
      state.hop = 1;
    };
    svg.addEventListener('click', handleClick);

    return () => {
      alive = false;
      window.removeEventListener('pointermove', handlePointerMove);
      svg.removeEventListener('click', handleClick);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      style={{ display: 'block', overflow: 'visible', cursor: 'pointer', flexShrink: 0 }}
    >
      <defs>
        <clipPath id={`eL${rawId}`}>
          <circle cx="74" cy="103" r="16" />
        </clipPath>
        <clipPath id={`eR${rawId}`}>
          <circle cx="126" cy="103" r="16" />
        </clipPath>
      </defs>
      <g ref={tiltRef}>
        <path d="M152 70 L100 100 L100 162 L152 132 Z" fill="#5439C4" />
        <path d="M48 70 L100 100 L100 162 L48 132 Z" fill="#6B4EE6" />
        <path d="M100 40 L136 61 L158 27 L152 70 L100 100 L48 70 L42 27 L64 61 Z" fill="#8B72F0" />
        <g clipPath={`url(#eL${rawId})`}>
          <circle cx="74" cy="103" r="16" fill="#FFFFFF" />
          <circle ref={(el) => (pupilRefs.current[0] = el)} cx="74" cy="103" r="7" fill="#1E1B2E" />
          <rect ref={(el) => (lidRefs.current[0] = el)} x="54" y="51" width="42" height="36" fill="#6B4EE6" />
        </g>
        <g clipPath={`url(#eR${rawId})`}>
          <circle cx="126" cy="103" r="16" fill="#F5F2FF" />
          <circle ref={(el) => (pupilRefs.current[1] = el)} cx="126" cy="103" r="7" fill="#1E1B2E" />
          <rect ref={(el) => (lidRefs.current[1] = el)} x="106" y="51" width="42" height="36" fill="#5439C4" />
        </g>
        <path d="M91 112 L109 112 L100 133 Z" fill="#DED8ED" />
      </g>
    </svg>
  );
}
