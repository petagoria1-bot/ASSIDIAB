
import React from 'react';

interface IconProps {
  className?: string;
}

const EmergencyIcon: React.FC<IconProps> = ({ className }) => (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <filter id="shadow-emergency" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="3"/>
        <feGaussianBlur stdDeviation="4"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.8 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
      </filter>
      <linearGradient id="gloss-emergency" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="white" stopOpacity="0.4"/>
        <stop offset="100%" stopColor="white" stopOpacity="0"/>
      </linearGradient>
    </defs>
    <g filter="url(#shadow-emergency)">
        <path d="M32 6C18.7452 6 8 13.3726 8 26.5C8 35.5317 29.2155 54.717 31.1392 56.5928C31.6243 57.068 32.3757 57.068 32.8608 56.5928C34.7845 54.717 56 35.5317 56 26.5C56 13.3726 45.2548 6 32 6Z" fill="#EF4444"/>
        <path d="M32 6C18.7452 6 8 13.3726 8 26.5C8 35.5317 29.2155 54.717 31.1392 56.5928C31.6243 57.068 32.3757 57.068 32.8608 56.5928C34.7845 54.717 56 35.5317 56 26.5C56 13.3726 45.2548 6 32 6Z" fill="url(#gloss-emergency)"/>
        <rect x="29" y="19" width="6" height="18" rx="3" fill="white"/>
        <rect x="23" y="25" width="18" height="6" rx="3" fill="white"/>
    </g>
  </svg>
);

export default EmergencyIcon;