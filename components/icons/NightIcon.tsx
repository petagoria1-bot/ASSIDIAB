import React from 'react';

interface IconProps {
  className?: string;
}

const NightIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M168 72a56 56 0 100 112 44 44 0 010-112" />
    <line x1="32" y1="208" x2="224" y2="208" />
    <path d="M80 88 v 16 M72 96 h 16" strokeWidth="8" />
    <path d="M112 120 v 16 M104 128 h 16" strokeWidth="8" />
    <path d="M64 136 v 16 M56 144 h 16" strokeWidth="8" />
  </svg>
);

export default NightIcon;
