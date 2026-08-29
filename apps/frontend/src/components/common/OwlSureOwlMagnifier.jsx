import React from 'react';

/**
 * OwlSure Owl with Magnifying Glass Brand Icon
 * Features the signature wise owl inspecting insurance policies through an intelligent magnifying lens.
 */
export default function OwlSureOwlMagnifier({ size = 24, color = 'currentColor', glassColor = '#38BDF8', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      {/* 1. Owl Head & Body Silouette with Wise Ear Tufts */}
      <path
        d="M6 10.5L8.5 4.5C10.5 5.8 13 6.5 16 6.5C19 6.5 21.5 5.8 23.5 4.5L26 10.5C27.8 14.5 27.8 19 26 23C24.2 27 20.2 29.5 16 29.5C11.8 29.5 7.8 27 6 23C4.2 19 4.2 14.5 6 10.5Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 2. Owl Eyebrow / Mask Arc */}
      <path
        d="M7 10C9.5 8 13.5 9 16 12C18.5 9 22.5 8 25 10"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* 3. Left Owl Eye */}
      <circle cx="11" cy="15.5" r="3.2" stroke={color} strokeWidth="1.8" />
      <circle cx="11" cy="15.5" r="1.5" fill={color} />

      {/* 4. Center Beak */}
      <path
        d="M16 15L14 19H18L16 15Z"
        fill={color}
        stroke={color}
        strokeWidth="0.6"
        strokeLinejoin="round"
      />

      {/* 5. Owl Wing Arcs */}
      <path
        d="M6.5 17C7.8 21 10 24.5 12.5 27"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M25.5 17C24.2 21 22 24.5 19.5 27"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* 6. Chest Plumage Chevrons */}
      <path
        d="M13.8 22.5C14.8 23.5 17.2 23.5 18.2 22.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14.5 25.5C15.2 26.2 16.8 26.2 17.5 25.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* 7. Perching Talons */}
      <path
        d="M12 29.5V31.5 M14 29.5V31.5 M18 29.5V31.5 M20 29.5V31.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* 8. INSPECTING MAGNIFYING GLASS Over Right Eye */}
      {/* Magnifier Glass Lens Circle */}
      <circle
        cx="21"
        cy="15.5"
        r="4.5"
        fill="rgba(56, 189, 248, 0.18)"
        stroke={glassColor}
        strokeWidth="2.2"
      />
      {/* Lens Glass Glint / Highlight */}
      <path
        d="M19 13C20 12.2 21.5 12.2 22.5 12.8"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Right Eye inside Magnifier (Magnified Pupil) */}
      <circle cx="21" cy="15.5" r="1.8" fill={color} />

      {/* Magnifier Handle (angled down towards talon) */}
      <path
        d="M24.2 18.7L28.5 23"
        stroke={glassColor}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M26.8 21.3L29.5 24"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
