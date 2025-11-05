
import React from 'react';

const InsulinPenAnimation: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="rotate(45 50 50)">
      <rect x="35" y="10" width="30" height="80" rx="8" fill="#F1F5F9"/>
      <rect x="40" y="25" width="20" height="30" rx="4" fill="#A7F3D0"/>
      <path d="M35 18 L 65 18 L 60 10 L 40 10 Z" fill="#64748B"/>
      
      {/* Glowing Tip */}
      <circle cx="50" cy="10" r="8" fill="#40E0D0" className="animate-glow origin-center"/>
      <circle cx="50" cy="10" r="4" fill="white"/>
    </g>
  </svg>
);

export default InsulinPenAnimation;
