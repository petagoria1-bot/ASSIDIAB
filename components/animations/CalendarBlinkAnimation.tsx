
import React from 'react';

const CalendarBlinkAnimation: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g>
      <rect x="10" y="20" width="80" height="70" rx="12" fill="#F9FAFB"/>
      <rect x="10" y="20" width="80" height="20" rx="12" fill="#E5E7EB"/>
      <rect x="25" y="10" width="10" height="20" rx="5" fill="#B0E0E6"/>
      <rect x="65" y="10" width="10" height="20" rx="5" fill="#B0E0E6"/>

      {/* Static dates */}
      <circle cx="30" cy="55" r="7" fill="#E5E7EB"/>
      <circle cx="50" cy="55" r="7" fill="#E5E7EB"/>
      <circle cx="30" cy="75" r="7" fill="#E5E7EB"/>
      <circle cx="50" cy="75" r="7" fill="#E5E7EB"/>
      <circle cx="70" cy="75" r="7" fill="#E5E7EB"/>

      {/* Blinking date */}
      <circle cx="70" cy="55" r="7" fill="#FF7E67" className="animate-blink"/>
    </g>
  </svg>
);

export default CalendarBlinkAnimation;
