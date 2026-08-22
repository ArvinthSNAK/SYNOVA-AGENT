import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Motorbike } from 'lucide-react';
import './StepperRider.css';

/**
 * Floating rider that travels along a horizontal step-progress line,
 * always centered over whichever step circle is currently active.
 * `containerRef` is the relatively-positioned stepper nav; `numberRefs`
 * is the ref array of every step circle (read post-commit, inside this
 * component's own effect, so the target node is guaranteed to exist —
 * including on first mount, when the parent hasn't re-rendered yet).
 */
export default function StepperRider({ containerRef, numberRefs, activeIndex }) {
  const [left, setLeft] = useState(null);
  const shouldReduceMotion = useReducedMotion();

  const measure = useCallback(() => {
    const activeNode = numberRefs.current[activeIndex];
    if (!containerRef.current || !activeNode) return;
    const containerBox = containerRef.current.getBoundingClientRect();
    const targetBox = activeNode.getBoundingClientRect();
    setLeft(targetBox.left - containerBox.left + targetBox.width / 2);
  }, [containerRef, numberRefs, activeIndex]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  if (left == null) return null;

  return (
    <motion.div
      className="stepper-rider"
      initial={false}
      animate={{ left }}
      transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 18, mass: 0.6 }}
      aria-hidden="true"
    >
      <motion.div
        className="stepper-rider-badge"
        animate={shouldReduceMotion ? {} : { y: [0, -3, 0] }}
        transition={shouldReduceMotion ? {} : { duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Motorbike size={14} strokeWidth={2.3} />
      </motion.div>
    </motion.div>
  );
}
