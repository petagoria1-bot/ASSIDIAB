import React from 'react';

interface IconProps {
  className?: string;
}

const GoldenHourIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="32" y1="192" x2="224" y2="192" />
    <circle cx="128" cy="160" r="32" />
    <line x1="48" y1="176" x2="48" y2="208" />
    <line x1="208" y1="176" x2="208" y2="208" />
  </svg>
);

export default GoldenHourIcon;
