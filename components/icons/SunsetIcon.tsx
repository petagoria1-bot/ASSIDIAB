import React from 'react';

interface IconProps {
  className?: string;
}

const SunsetIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M32 192 L 224 192" />
    <path d="M80 192 A 48 48 0 0 0 176 192" />
    <path d="M192 136a24 24 0 00-24-24 16 16 0 00-16-16" strokeWidth="10"/>
  </svg>
);

export default SunsetIcon;
