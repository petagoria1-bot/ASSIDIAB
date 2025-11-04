
import React from 'react';

interface IconProps {
  className?: string;
}

const ChartIcon: React.FC<IconProps> = ({ className }) => (
  <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
     <defs>
      <filter id="shadow-chart" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="3"/>
        <feGaussianBlur stdDeviation="3"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
      </filter>
    </defs>
    <g filter="url(#shadow-chart)">
      <rect x="8" y="8" width="48" height="48" rx="8" fill="#A7F3D0"/>
      <path d="M16 44C16 44 23 20 32 28C41 36 48 20 48 20" stroke="#00A86B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  </svg>
);

export default ChartIcon;
