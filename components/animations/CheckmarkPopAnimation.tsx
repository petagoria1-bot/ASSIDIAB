
import React from 'react';

const CheckmarkPopAnimation: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g style={{ animation: 'success-bounce 0.8s cubic-bezier(.25,.8,.25,1) forwards' }}>
      {/* Halo effect */}
      <circle 
        cx="50" 
        cy="50" 
        r="40" 
        fill="transparent" 
        stroke="#40E0D0" 
        strokeWidth="6" 
        style={{ animation: 'halo-pulse 0.8s cubic-bezier(.25,.8,.25,1) forwards' }}
      />
      
      {/* Circle background */}
      <circle cx="50" cy="50" r="35" fill="#00A86B" />

      {/* Checkmark path */}
      <path
        d="M35 50 L 45 60 L 65 40"
        fill="none"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="43"
        strokeDashoffset="43"
        style={{ animation: 'success-draw 0.5s cubic-bezier(.25,.8,.25,1) 0.1s forwards' }}
      />
    </g>
  </svg>
);

export default CheckmarkPopAnimation;
