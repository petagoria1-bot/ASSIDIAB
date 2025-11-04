
import React from 'react';

interface IconProps {
  className?: string;
}

const LightbulbIcon: React.FC<IconProps> = ({ className }) => (
  <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <filter id="shadow-bulb" x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#40E0D0" floodOpacity="0.7"/>
      </filter>
      <radialGradient id="glow-bulb" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(32 26) rotate(90) scale(18)">
        <stop stopColor="white"/>
        <stop offset="1" stopColor="#FCD34D"/>
      </radialGradient>
    </defs>
    <g>
      <path d="M32 42C38.6274 42 44 36.6274 44 30C44 23.3726 38.6274 18 32 18C25.3726 18 20 23.3726 20 30C20 36.6274 25.3726 42 32 42Z" fill="url(#glow-bulb)" filter="url(#shadow-bulb)"/>
      <path d="M26 42H38V48C38 49.1046 37.1046 50 36 50H28C26.8954 50 26 49.1046 26 48V42Z" fill="#E5E7EB"/>
      <rect x="28" y="50" width="8" height="3" rx="1.5" fill="#E5E7EB"/>
    </g>
  </svg>
);

export default LightbulbIcon;
