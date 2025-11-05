
import React from 'react';

const BreakfastSteamAnimation: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g>
      <path d="M25 75C25 75 35 65 50 65C65 65 75 75 75 75" stroke="#008A68" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M20 65C20 65 35 55 50 55C65 55 80 65 80 65" stroke="#10B981" strokeWidth="8" strokeLinecap="round" fill="none"/>
      
      {/* Steam */}
      <path d="M40 50 Q 45 40 40 30" stroke="#A7F3D0" strokeWidth="4" strokeLinecap="round" fill="none" className="animate-steam-1"/>
      <path d="M50 52 Q 55 42 50 32" stroke="#A7F3D0" strokeWidth="4" strokeLinecap="round" fill="none" className="animate-steam-2"/>
      <path d="M60 50 Q 55 40 60 30" stroke="#A7F3D0" strokeWidth="4" strokeLinecap="round" fill="none" className="animate-steam-1" style={{animationDelay: '0.2s'}}/>
    </g>
  </svg>
);

export default BreakfastSteamAnimation;
