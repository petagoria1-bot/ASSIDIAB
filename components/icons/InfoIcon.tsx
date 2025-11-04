import React from 'react';

interface IconProps {
  className?: string;
}

const InfoIcon: React.FC<IconProps> = ({ className }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="info-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--tw-color-info-dark, #2563EB)" />
        <stop offset="100%" stopColor="var(--tw-color-info, #3B82F6)" />
      </linearGradient>
      <filter id="info-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#3B82F6" floodOpacity="0.3"/>
      </filter>
    </defs>
    <g filter="url(#info-shadow)">
      <circle cx="12" cy="12" r="10" fill="url(#info-gradient)" />
      <path fillRule="evenodd" clipRule="evenodd" d="M12 17C12.5523 17 13 16.5523 13 16V12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12V16C11 16.5523 11.4477 17 12 17Z" fill="white"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 9C12.5523 9 13 8.55228 13 8C13 7.44772 12.5523 7 12 7C11.4477 7 11 7.44772 11 8C11 8.55228 11.4477 9 12 9Z" fill="white"/>
    </g>
  </svg>
);

export default InfoIcon;