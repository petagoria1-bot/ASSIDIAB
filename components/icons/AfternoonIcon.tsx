import React from 'react';

interface IconProps {
  className?: string;
}

const AfternoonIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="176" cy="80" r="32" />
    <line x1="148.5" y1="101.5" x2="130" y2="120" />
    <line x1="128" y1="80" x2="112" y2="80" />
    <line x1="148.5" y1="58.5" x2="130" y2="40" />
    <line x1="176" y1="48" x2="176" y2="32" />
  </svg>
);

export default AfternoonIcon;
