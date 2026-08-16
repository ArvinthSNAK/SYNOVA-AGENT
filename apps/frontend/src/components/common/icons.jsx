const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const UsersIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M17 20v-1.6a3.4 3.4 0 0 0-3.4-3.4H6.4A3.4 3.4 0 0 0 3 18.4V20" />
    <circle cx="9.7" cy="7.4" r="3.4" />
    <path d="M16 4.2a3.4 3.4 0 0 1 0 6.6" />
    <path d="M21 20v-1.6a3.4 3.4 0 0 0-2.3-3.2" />
  </svg>
);

export const BuildingIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="4" y="3" width="11" height="18" rx="1.2" />
    <rect x="15" y="9" width="6" height="12" rx="1.2" />
    <path d="M7.5 7h1M7.5 10.5h1M7.5 14h1M11 7h1M11 10.5h1M11 14h1M17.5 12.5h1M17.5 16h1" />
  </svg>
);

export const FileTextIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z" />
    <path d="M14 3.5V7a1 1 0 0 0 1 1h3.4" />
    <path d="M8.5 12.5h7M8.5 15.5h7M8.5 9.5h3" />
  </svg>
);

export const CheckCircleIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 12.3l2.3 2.3 4.7-5" />
  </svg>
);

export const ClockIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3.2 2" />
  </svg>
);

export const XCircleIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.3 9.3l5.4 5.4M14.7 9.3l-5.4 5.4" />
  </svg>
);

export const SearchIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.3-4.3" />
  </svg>
);

export const BellIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 10.5a6 6 0 0 1 12 0c0 3 1 4.5 1.5 5.3a.9.9 0 0 1-.8 1.4H5.3a.9.9 0 0 1-.8-1.4C5 15 6 13.5 6 10.5Z" />
    <path d="M10 19.8a2 2 0 0 0 4 0" />
  </svg>
);

export const ChevronRightIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M9 5.5l6.5 6.5-6.5 6.5" />
  </svg>
);

export const ArrowRightIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4.5 12h15M13.5 5.5L20 12l-6.5 6.5" />
  </svg>
);

export const UploadIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 15.5V4M8 8l4-4 4 4" />
    <path d="M5 15.5v3A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-3" />
  </svg>
);

export const LayersIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3.5l8 4.3-8 4.3-8-4.3 8-4.3Z" />
    <path d="M4 12.2l8 4.3 8-4.3M4 16.4l8 4.1 8-4.1" />
  </svg>
);

export const SparkleIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 4l1.6 4.8L18.5 10 13.6 11.7 12 16.5l-1.6-4.8L5.5 10l4.9-1.2L12 4Z" />
    <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
  </svg>
);

export const ShieldIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3.5l7 2.6v5.4c0 4.6-3 7.7-7 9-4-1.3-7-4.4-7-9V6.1l7-2.6Z" />
    <path d="M9 12l2.2 2.2L15.5 9.7" />
  </svg>
);

export const GridIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
  </svg>
);

export const SettingsIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 13.5a7.4 7.4 0 0 0 0-3l1.9-1.4-2-3.4-2.2.7a7.4 7.4 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.4a7.4 7.4 0 0 0-2.6 1.5l-2.2-.7-2 3.4L4.6 10.5a7.4 7.4 0 0 0 0 3l-1.9 1.4 2 3.4 2.2-.7a7.4 7.4 0 0 0 2.6 1.5l.5 2.4h4l.5-2.4a7.4 7.4 0 0 0 2.6-1.5l2.2.7 2-3.4-1.9-1.4Z" />
  </svg>
);

export const LogOutIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M9 20H5.5A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4H9" />
    <path d="M16 15.5l4-3.5-4-3.5M20 12H9" />
  </svg>
);

export const MenuIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 6.5h16M4 12h16M4 17.5h16" />
  </svg>
);

export const CameraIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.1l1-1.6A1.5 1.5 0 0 1 9.9 4.6h4.2a1.5 1.5 0 0 1 1.3.8l1 1.6h2.1A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" />
    <circle cx="12" cy="13" r="3.3" />
  </svg>
);

export const GoogleIcon = (p) => (
  <svg width="18" height="18" viewBox="0 0 48 48" {...p}>
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5Z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.9 29.6 5 24 5c-7.6 0-14.1 4.3-17.7 10.7Z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.5 0 10.4-1.9 14.1-5.4l-6.5-5.5c-2 1.4-4.7 2.4-7.6 2.4-5.2 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.8 39.6 16.4 44 24 44Z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.5 5.5C41.6 35.8 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5Z"
    />
  </svg>
);
