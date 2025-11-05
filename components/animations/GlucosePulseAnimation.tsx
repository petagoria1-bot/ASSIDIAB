import React from 'react';

const GlucosePulseAnimation: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g className="animate-pulse origin-center">
      <path d="M50 85 C 50 85, 20 65, 20 45 C 20 25, 35 20, 50 35 C 65 20, 80 25, 80 45 C 80 65, 50 85, 50 85 Z" fill="#40E0D0"/>
      <circle cx="50" cy="35" r="10" fill="white" fillOpacity="0.5"/>
    </g>
  </svg>
);

export default GlucosePulseAnimation;
