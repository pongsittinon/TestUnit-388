// Inline SVG icon component — ported from mris/ui.jsx
import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const paths: Record<string, React.ReactNode> = {
  map: <><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" /><path d="M9 4v16M15 6v16" /></>,
  layers: <><path d="M12 2l10 6-10 6L2 8z" /><path d="M2 14l10 6 10-6" /><path d="M2 10l10 6 10-6" /></>,
  home: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>,
  bar: <><path d="M3 21V10M9 21V4M15 21V13M21 21V8" /></>,
  table: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></>,
  upload: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></>,
  download: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3 3-5 7-5s7 2 7 5" /><circle cx="17" cy="9" r="3" /><path d="M22 19c0-2.5-2-4-5-4" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 113 3L7 19l-4 1 1-4z" /></>,
  trash: <><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14" /></>,
  x: <><path d="M18 6L6 18M6 6l12 12" /></>,
  check: <><path d="M20 6L9 17l-5-5" /></>,
  chevron_left: <><path d="M15 18l-6-6 6-6" /></>,
  chevron_right: <><path d="M9 18l6-6-6-6" /></>,
  chevron_down: <><path d="M6 9l6 6 6-6" /></>,
  chevron_up: <><path d="M18 15l-6-6-6 6" /></>,
  refresh: <><path d="M21 12a9 9 0 11-3-6.7L21 8" /><path d="M21 3v5h-5" /></>,
  leaf: <><path d="M11 20A7 7 0 014 13c0-7 7-11 16-11-2 7-3 14-9 18z" /><path d="M2 22l8-8" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  crop: <><path d="M6 2v14a2 2 0 002 2h14" /><path d="M2 6h14a2 2 0 012 2v14" /></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></>,
  file: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></>,
  sheet: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h8M8 9h2" /></>,
  alert: <><path d="M12 2L1 21h22z" /><path d="M12 9v5M12 18h.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v5h1" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3h0a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5h0a1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></>,
  bell: <><path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10 21a2 2 0 004 0" /></>,
  log: <><path d="M9 5H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2h-4" /><rect x="9" y="3" width="6" height="4" rx="1" /></>,
  flower: <><circle cx="12" cy="12" r="3" /><path d="M12 9V3M12 21v-6M9 12H3M21 12h-6M5 5l4 4M19 19l-4-4M5 19l4-4M19 5l-4 4" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
  crosshair: <><circle cx="12" cy="12" r="9" /><path d="M22 12h-6M8 12H2M12 2v6M12 22v-6" /></>,
  ruler: <><path d="M3 17l14-14 4 4L7 21z" /><path d="M7 8l2 2M11 4l2 2M9 14l2 2M13 10l2 2" /></>,
  move: <><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" /></>,
  save: <><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
  droplet: <><path d="M12 2s7 8 7 13a7 7 0 11-14 0c0-5 7-13 7-13z" /></>,
  list: <><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>,
  gauge: <><path d="M12 14l4-4" /><path d="M3.69 17A9 9 0 1118 18.36" /><circle cx="12" cy="14" r="1.5" /></>,
  shield: <><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z" /></>,
  logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>,
};

const Icon: React.FC<IconProps> = ({ name, size = 16, className = '', strokeWidth = 2 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name] || <circle cx="12" cy="12" r="9" />}
    </svg>
  );
};

export default Icon;
