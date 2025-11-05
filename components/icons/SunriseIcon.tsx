import React from 'react';

interface IconProps {
  className?: string;
}

const SunriseIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M32 192 L 224 192" />
    <path d="M80 192 A 48 48 0 0 1 176 192" />
    <line x1="128" y1="144" x2="128" y2="120" />
    <line x1="96.5" y1="163.5" x2="84" y2="151" />
    <line x1="159.5" y1="163.5" x2="172" y2="151" />
  </svg>
);

export default SunriseIcon;
