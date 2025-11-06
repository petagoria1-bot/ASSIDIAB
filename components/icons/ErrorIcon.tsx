import React from 'react';

const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <filter id="shadow-error" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.2"/>
      </filter>
    </defs>
    <g filter="url(#shadow-error)">
      <path d="M32 58C45.25 58 56 47.25 56 34C56 20.75 32 6 32 6C32 6 8 20.75 8 34C8 47.25 18.75 58 32 58Z" fill="#EF4444"/>
      <rect x="29" y="24" width="6" height="20" rx="3" fill="white"/>
      <rect x="22" y="31" width="20" height="6" rx="3" fill="white"/>
    </g>
  </svg>
);
export default ErrorIcon;
