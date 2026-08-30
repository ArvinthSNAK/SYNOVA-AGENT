import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RingChart.css';

export function Ring() {
  return null; // Marker component for Ring config
}

export function RingCenter({ defaultLabel = 'Channels' }) {
  return null; // Marker component for center label config
}

export function RingChart({
  data = [],
  size = 100,
  animationDuration = 1100,
  animationEasing = 'cubic-bezier(0.85, 0, 0.15, 1)',
  strokeWidth = 12,
  ringGap = 6,
  baseInnerRadius = 60,
  className = '',
  children,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Extract center config
  const centerConfig = useMemo(() => {
    let defaultLabel = 'Channels';
    React.Children.forEach(children, (child) => {
      if (child && child.type === RingCenter && child.props.defaultLabel) {
        defaultLabel = child.props.defaultLabel;
      }
    });
    return { defaultLabel };
  }, [children]);

  // Overall SVG dimensions
  const maxRadius = baseInnerRadius + data.length * (strokeWidth + ringGap) + 20;
  const viewBoxSize = maxRadius * 2;
  const center = maxRadius;

  const activeItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className={`bklit-ring-container ${className}`}>
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="bklit-ring-svg"
      >
        <g className="bklit-ring-group">
          {data.map((item, index) => {
            const radius = baseInnerRadius + index * (strokeWidth + ringGap);
            const circumference = 2 * Math.PI * radius;
            const maxVal = item.max || 100;
            const pct = Math.min(Math.max((item.value || 0) / maxVal, 0), 1);
            const strokeDashoffset = circumference * (1 - pct);
            const color = item.color || ['#0F6E6E', '#2563EB', '#D06A4E', '#059669', '#F59E0B'][index % 5];
            const isHovered = hoveredIndex === index;

            return (
              <g
                key={index}
                className="bklit-single-ring-group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Background Track Ring */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={color}
                  strokeOpacity={0.14}
                  strokeWidth={strokeWidth}
                />

                {/* Animated Progress Ring */}
                <motion.circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{
                    strokeDashoffset,
                    strokeWidth: isHovered ? strokeWidth + 2 : strokeWidth,
                  }}
                  transition={{
                    duration: animationDuration / 1000,
                    ease: [0.85, 0, 0.15, 1],
                  }}
                  transform={`rotate(-90 ${center} ${center})`}
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 8px ${color}88)` : 'none',
                    transition: 'filter 0.2s ease',
                  }}
                />
              </g>
            );
          })}
        </g>

        {/* Dynamic Center Label / Stats */}
        <g className="bklit-ring-center-group" pointerEvents="none">
          <text
            x={center}
            y={center - 6}
            textAnchor="middle"
            className="bklit-ring-center-val"
          >
            {activeItem ? `${activeItem.value}%` : `${data.length}`}
          </text>
          <text
            x={center}
            y={center + 14}
            textAnchor="middle"
            className="bklit-ring-center-label"
          >
            {activeItem ? activeItem.name : centerConfig.defaultLabel}
          </text>
        </g>
      </svg>

      {/* Ring Legend & Telemetry Chips */}
      <div className="bklit-ring-legend-grid">
        {data.map((item, index) => {
          const isHovered = hoveredIndex === index;
          const color = item.color || ['#0F6E6E', '#2563EB', '#D06A4E', '#059669', '#F59E0B'][index % 5];
          return (
            <div
              key={item.name || index}
              className={`bklit-ring-legend-card ${isHovered ? 'bklit-ring-legend-card--active' : ''}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="bklit-ring-legend-left">
                <span className="bklit-ring-dot" style={{ background: color }} />
                <div>
                  <div className="bklit-ring-legend-name">{item.name}</div>
                  <div className="bklit-ring-legend-sub">{item.sub || `${item.value}% Active SLA`}</div>
                </div>
              </div>
              <span className="bklit-ring-legend-val mono" style={{ color }}>{item.value}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RingChart;
