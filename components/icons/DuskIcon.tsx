import React from 'react';

interface IconProps {
  className?: string;
}

const DuskIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M32 192 L 224 192" />
    <path d="M184 192 a 24 24 0 0 0 40 0" />
    <path d="M80 88 v 16 M72 96 h 16" strokeWidth="8" />
    <path d="M120 120 v 16 M112 128 h 16" strokeWidth="8" />
  </svg>
);

export default DuskIcon;
