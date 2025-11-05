
import React from 'react';

const HeartBeatAnimation: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g className="animate-breathe origin-center">
      <path d="M50 85 C 40 75, 20 60, 20 40 C 20 25, 35 20, 50 35 C 65 20, 80 25, 80 40 C 80 60, 60 75, 50 85 Z" fill="#FF7E67"/>
    </g>
  </svg>
);

export default HeartBeatAnimation;
