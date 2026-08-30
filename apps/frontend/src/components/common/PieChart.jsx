import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PieChart.css';

export function PieSlice() {
  return null; // Marker component for slice config
}

export function PieCenter({ defaultLabel = 'Total' }) {
  return null; // Marker component for center label config
}

export function PieTooltip() {
  return null; // Marker component for tooltip
}

export function PieChart({
  data = [],
  size = 100,
  innerRadius = 51,
  padAngle = 0,
  cornerRadius = 0,
  hoverOffset = 10,
  startAngle = -Math.PI / 2,
  endAngle = (3 * Math.PI) / 2,
  enterTransition = { type: 'tween', duration: 1.1, ease: [0.85, 0, 0.15, 1] },
  enterStaggerScale = 1.0,
  className = '',
  children,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false, item: null });

  // Extract center config from children
  const centerConfig = useMemo(() => {
    let defaultLabel = 'Total';
    React.Children.forEach(children, (child) => {
      if (child && child.type === PieCenter) {
        if (child.props.defaultLabel) defaultLabel = child.props.defaultLabel;
      }
    });
    return { defaultLabel };
  }, [children]);

  // Extract slice configs
  const sliceConfigs = useMemo(() => {
    const map = new Map();
    React.Children.forEach(children, (child) => {
      if (child && child.type === PieSlice && child.props.index !== undefined) {
        map.set(child.props.index, child.props);
      }
    });
    return map;
  }, [children]);

  // Total value calculation
  const totalValue = useMemo(() => {
    return data.reduce((sum, item) => sum + (typeof item === 'number' ? item : item.value || 0), 0);
  }, [data]);

  // SVG dimensions
  const viewBoxSize = 260;
  const center = viewBoxSize / 2;
  const outerR = size;
  const innerR = innerRadius;

  // Calculate slice geometry
  const slices = useMemo(() => {
    if (!data || data.length === 0 || totalValue === 0) return [];

    const totalAngleRange = endAngle - startAngle;
    let currentAngle = startAngle;

    return data.map((item, index) => {
      const val = typeof item === 'number' ? item : item.value || 0;
      const name = typeof item === 'object' ? item.name || item.label || `Slice ${index + 1}` : `Slice ${index + 1}`;
      const color = (typeof item === 'object' && item.color) || ['#0F6E6E', '#D06A4E', '#059669', '#2563EB', '#F59E0B', '#8B5CF6'][index % 6];
      const sliceAngle = (val / totalValue) * totalAngleRange;
      const a0 = currentAngle;
      const a1 = currentAngle + sliceAngle - padAngle;
      currentAngle += sliceAngle;

      const midAngle = (a0 + a1) / 2;

      // Coordinate helper
      const polarToCart = (angle, radius) => ({
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      });

      const p0 = polarToCart(a0, outerR);
      const p1 = polarToCart(a1, outerR);
      const p2 = polarToCart(a1, innerR);
      const p3 = polarToCart(a0, innerR);

      const largeArc = a1 - a0 > Math.PI ? 1 : 0;

      // Donut slice path
      const path = `
        M ${p0.x} ${p0.y}
        A ${outerR} ${outerR} 0 ${largeArc} 1 ${p1.x} ${p1.y}
        L ${p2.x} ${p2.y}
        A ${innerR} ${innerR} 0 ${largeArc} 0 ${p3.x} ${p3.y}
        Z
      `;

      // Hover translation vector
      const dx = Math.cos(midAngle) * hoverOffset;
      const dy = Math.sin(midAngle) * hoverOffset;

      return {
        index,
        name,
        value: val,
        percentage: ((val / totalValue) * 100).toFixed(1),
        color,
        path,
        dx,
        dy,
        midAngle,
        item,
      };
    });
  }, [data, totalValue, startAngle, endAngle, padAngle, outerR, innerR, hoverOffset, center]);

  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className={`bklit-pie-container ${className}`}>
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="bklit-pie-svg"
      >
        <g className="bklit-pie-group">
          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.index;
            const sliceConfig = sliceConfigs.get(slice.index) || {};
            const hoverEffect = sliceConfig.hoverEffect || 'translate';

            return (
              <motion.path
                key={slice.index}
                d={slice.path}
                fill={slice.color}
                initial={{ scale: enterStaggerScale, opacity: 0 }}
                animate={{
                  scale: isHovered && hoverEffect === 'scale' ? 1.04 : 1,
                  x: isHovered && hoverEffect === 'translate' ? slice.dx : 0,
                  y: isHovered && hoverEffect === 'translate' ? slice.dy : 0,
                  opacity: hoveredIndex !== null && !isHovered ? 0.75 : 1,
                }}
                transition={enterTransition}
                className="bklit-pie-slice"
                style={{
                  filter: isHovered ? `drop-shadow(0 4px 14px ${slice.color}66)` : 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  setHoveredIndex(slice.index);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltipPos({
                    x: e.clientX,
                    y: e.clientY,
                    visible: true,
                    item: slice,
                  });
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                  setTooltipPos((prev) => ({ ...prev, visible: false }));
                }}
              />
            );
          })}
        </g>

        {/* Donut Center Display */}
        {innerR > 0 && (
          <g className="bklit-pie-center-group" pointerEvents="none">
            <text
              x={center}
              y={center - 6}
              textAnchor="middle"
              className="bklit-pie-center-value"
            >
              {activeSlice ? `${activeSlice.percentage}%` : totalValue.toLocaleString()}
            </text>
            <text
              x={center}
              y={center + 14}
              textAnchor="middle"
              className="bklit-pie-center-label"
            >
              {activeSlice ? activeSlice.name : centerConfig.defaultLabel}
            </text>
          </g>
        )}
      </svg>

      {/* Floating Info Pill if hovered */}
      {activeSlice && (
        <div className="bklit-pie-hover-card">
          <span className="bklit-pie-hover-dot" style={{ background: activeSlice.color }} />
          <span className="bklit-pie-hover-name">{activeSlice.name}:</span>
          <span className="bklit-pie-hover-val mono">{activeSlice.value.toLocaleString()} ({activeSlice.percentage}%)</span>
        </div>
      )}
    </div>
  );
}

export default PieChart;
