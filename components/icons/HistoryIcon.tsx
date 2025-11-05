import React from 'react';

interface IconProps {
  className?: string;
}

const HistoryIcon: React.FC<IconProps> = ({ className }) => (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <filter id="shadow-history" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="3"/>
        <feGaussianBlur stdDeviation="4"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
      </filter>
    </defs>
    <g filter="url(#shadow-history)">
        <path d="M32 8V56" stroke="#40E0D0" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="32" cy="18" r="6" fill="#A7F3D0" stroke="white" strokeWidth="2"/>
        <circle cx="32" cy="34" r="6" fill="#FCD34D" stroke="white" strokeWidth="2"/>
        <circle cx="32" cy="50" r="6" fill="#FF7E67" stroke="white" strokeWidth="2"/>
        <rect x="8" y="14" width="16" height="8" rx="4" fill="#F9FAFB"/>
        <rect x="40" y="30" width="16" height="8" rx="4" fill="#F9FAFB"/>
        <rect x="8" y="46" width="16" height="8" rx="4" fill="#F9FAFB"/>
    </g>
  </svg>
);

export default HistoryIcon;
