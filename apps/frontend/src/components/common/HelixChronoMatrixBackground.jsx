import React, { useCallback, useEffect, useRef } from 'react';

/**
 * Ambient animated 3D helix/fiber visualization used as a background layer
 * on the Voice Advisor page. Ported from a standalone Tailwind/TS canvas
 * widget into this project's plain JS + inline-style conventions (no
 * Tailwind/shadcn here) and retheme to the SYNOVA navy/lavender palette.
 * Pointer position is tracked on `window` (not the canvas) so the layer can
 * stay `pointer-events: none` and never block the chat UI above it.
 */
export default function HelixChronoMatrixBackground({ className = '' }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const pointerRef = useRef({ x: -2000, y: -2000, targetX: -2000, targetY: -2000, radius: 220 });
  const ringsRef = useRef([]);
  const particlesRef = useRef([]);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  const initTopology = useCallback((width, height) => {
    const rings = [];
    const ringCount = 28;
    const pointsPerRing = 120;

    for (let r = 0; r < ringCount; r++) {
      const progress = r / ringCount;
      const points = [];
      const baseRadius = Math.min(width, height) * 0.35 * (0.4 + progress * 0.6);
      const yOffset = (progress - 0.5) * (height * 0.45);

      for (let p = 0; p < pointsPerRing; p++) {
        points.push({ vy: 0, excitation: 0 });
      }

      rings.push({
        points,
        radius: baseRadius,
        yOffset,
        rotationSpeed: (r % 2 === 0 ? 1 : -1) * (0.002 + (r / ringCount) * 0.0025),
        angle: (r * Math.PI) / ringCount,
        harmonicOffset: r * 0.2,
      });
    }

    ringsRef.current = rings;

    const particles = [];
    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        ringIndex: Math.floor(Math.random() * ringCount),
        progress: Math.random(),
        speed: (Math.random() * 0.003 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
        size: Math.random() * 1.5 + 1.5,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return undefined;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rect = entry.contentRect;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        dimensionsRef.current = { width: rect.width, height: rect.height };
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        initTopology(rect.width, rect.height);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [initTopology]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return undefined;

    let animId = 0;
    let time = 0;
    let alive = true;

    const render = () => {
      if (!alive) return;
      time += 0.012;
      const { width, height } = dimensionsRef.current;
      const pointer = pointerRef.current;
      const rings = ringsRef.current;
      const particles = particlesRef.current;

      pointer.x += (pointer.targetX - pointer.x) * 0.1;
      pointer.y += (pointer.targetY - pointer.y) * 0.1;

      ctx.fillStyle = '#071a32';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      for (let rIdx = 0; rIdx < rings.length; rIdx++) {
        const ring = rings[rIdx];
        ring.angle += ring.rotationSpeed;

        const points = ring.points;
        const numPoints = points.length;

        ctx.beginPath();
        let firstProjX = 0;
        let firstProjY = 0;
        let avgExcitation = 0;

        for (let pIdx = 0; pIdx < numPoints; pIdx++) {
          const pt = points[pIdx];
          const theta = (pIdx / numPoints) * Math.PI * 2 + ring.angle;

          let x3D = Math.cos(theta) * ring.radius;
          const z3D = Math.sin(theta) * ring.radius;
          let y3D = ring.yOffset + Math.sin(theta * 2 + time * 2 + ring.harmonicOffset) * 45;

          const fov = 600;
          const cameraDist = 550;
          const scale = fov / (cameraDist + z3D);

          const projX = centerX + x3D * scale;
          const projY = centerY + (y3D + pt.vy) * scale;

          const dx = projX - pointer.x;
          const dy = projY - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < pointer.radius && dist > 0) {
            const ratio = 1 - dist / pointer.radius;
            const targetVy = Math.sin(theta + time) * ratio * 15;
            pt.vy += (targetVy - pt.vy) * 0.1;
            pt.excitation = Math.max(pt.excitation, ratio);
          } else {
            pt.vy *= 0.92;
          }

          pt.excitation *= 0.92;
          avgExcitation += pt.excitation;

          if (pIdx === 0) {
            firstProjX = projX;
            firstProjY = projY;
            ctx.moveTo(projX, projY);
          } else {
            ctx.lineTo(projX, projY);
          }
        }

        ctx.lineTo(firstProjX, firstProjY);

        avgExcitation /= numPoints;
        const depthAlpha = 0.15 + (rIdx / rings.length) * 0.45;
        const isExcited = avgExcitation > 0.05;

        if (isExcited) {
          ctx.strokeStyle = `rgba(222, 216, 237, ${Math.min(1, 0.4 + avgExcitation * 0.6)})`;
          ctx.lineWidth = 1.2 + avgExcitation * 1.5;
        } else {
          ctx.strokeStyle = `rgba(255, 255, 255, ${depthAlpha * 0.5})`;
          ctx.lineWidth = 0.75;
        }

        ctx.stroke();
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.progress = (p.progress + p.speed + 1) % 1;

        const ring = rings[p.ringIndex];
        if (!ring) continue;

        const numPoints = ring.points.length;
        const exactIndex = p.progress * numPoints;
        const pIdx1 = Math.floor(exactIndex) % numPoints;
        const pIdx2 = (pIdx1 + 1) % numPoints;
        const blend = exactIndex - Math.floor(exactIndex);

        const theta1 = (pIdx1 / numPoints) * Math.PI * 2 + ring.angle;
        const theta2 = (pIdx2 / numPoints) * Math.PI * 2 + ring.angle;

        const x1 = Math.cos(theta1) * ring.radius;
        const z1 = Math.sin(theta1) * ring.radius;
        const x2 = Math.cos(theta2) * ring.radius;
        const z2 = Math.sin(theta2) * ring.radius;

        const x3D = x1 + (x2 - x1) * blend;
        const z3D = z1 + (z2 - z1) * blend;
        const y3D = ring.yOffset;

        const fov = 600;
        const cameraDist = 550;
        const scale = fov / (cameraDist + z3D);

        const projX = centerX + x3D * scale;
        const projY = centerY + y3D * scale;

        const dx = projX - pointer.x;
        const dy = projY - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isNearHover = dist < pointer.radius;

        ctx.beginPath();
        ctx.arc(projX, projY, p.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = isNearHover ? '#DED8ED' : '#04101f';
        ctx.fill();

        ctx.lineWidth = 0.5;
        ctx.strokeStyle = 'rgba(222, 216, 237, 0.35)';
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current.targetX = e.clientX - rect.left;
      pointerRef.current.targetY = e.clientY - rect.top;
    };
    const handlePointerLeave = () => {
      pointerRef.current.targetX = -2000;
      pointerRef.current.targetY = -2000;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave, { passive: true });

    animId = requestAnimationFrame(render);
    return () => {
      alive = false;
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div ref={containerRef} className={`helix-matrix-bg ${className}`.trim()}>
      <canvas ref={canvasRef} className="helix-matrix-canvas" />
    </div>
  );
}
