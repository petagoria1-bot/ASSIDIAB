import React from 'react';

interface IconProps {
  className?: string;
}

const DropletLogoIcon: React.FC<IconProps> = ({ className }) => (
  <svg width="96" height="96" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <filter id="shadow-logo-drop" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="5"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
      </filter>
      <linearGradient id="gloss-logo-drop" x1="50%" y1="0%" x2="50%" y2="80%">
        <stop offset="0%" stopColor="white" stopOpacity="0.5"/>
        <stop offset="100%" stopColor="white" stopOpacity="0"/>
      </linearGradient>
    </defs>
    <g filter="url(#shadow-logo-drop)">
        <path d="M32 58C45.2548 58 56 47.2548 56 34C56 25.4051 51.3726 17.7452 44.5 12.5C39.4091 8.54545 32 4 32 4C32 4 24.5909 8.54545 19.5 12.5C12.6274 17.7452 8 25.4051 8 34C8 47.2548 18.7452 58 32 58Z" fill="#40E0D0"/>
        <path d="M32 58C45.2548 58 56 47.2548 56 34C56 25.4051 51.3726 17.7452 44.5 12.5C39.4091 8.54545 32 4 32 4C32 4 24.5909 8.54545 19.5 12.5C12.6274 17.7452 8 25.4051 8 34C8 47.2548 18.7452 58 32 58Z" fill="url(#gloss-logo-drop)"/>
        <rect x="29" y="30" width="6" height="14" rx="3" fill="#A7F3D0" fillOpacity="0.8"/>
        <rect x="22" y="34" width="20" height="6" rx="3" fill="#A7F3D0" fillOpacity="0.8"/>
    </g>
  </svg>
);

export default DropletLogoIcon;