import React from 'react';

interface IconProps {
  className?: string;
}

const MorningIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M32 208 C 80 144, 160 224, 224 160" />
    <circle cx="80" cy="112" r="32" />
    <line x1="80" y1="80" x2="80" y2="64" />
    <line x1="112" y1="112" x2="128" y2="112" />
    <line x1="102.6" y1="89.4" x2="114" y2="78" />
  </svg>
);

export default MorningIcon;
