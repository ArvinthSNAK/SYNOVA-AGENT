import React from 'react';

/**
 * Formal Corporate AI Copilot Emblem for Ask Euler
 * Sleek, professional geometric AI intelligence icon.
 */
export default function FormalEulerAiLogo({ size = 20, color = 'currentColor', glowColor = '#38BDF8', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      {/* Central AI Radiant Sparkle Star */}
      <path
        d="M12 2L14.2 8.8L21 11L14.2 13.2L12 20L9.8 13.2L3 11L9.8 8.8L12 2Z"
        fill="url(#eulerAiGrad)"
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Top-right Micro Sparkle */}
      <path
        d="M18.5 3.5L19.5 6L22 7L19.5 8L18.5 10.5L17.5 8L15 7L17.5 6L18.5 3.5Z"
        fill={glowColor}
      />

      {/* Bottom-left Micro Sparkle */}
      <path
        d="M5.5 14.5L6.2 16.5L8.2 17.2L6.2 17.9L5.5 19.9L4.8 17.9L2.8 17.2L4.8 16.5L5.5 14.5Z"
        fill={glowColor}
      />

      {/* Gradients */}
      <defs>
        <linearGradient id="eulerAiGrad" x1="3" y1="2" x2="21" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
