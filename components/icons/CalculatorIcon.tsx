
import React from 'react';

interface IconProps {
  className?: string;
}

const CalculatorIcon: React.FC<IconProps> = ({ className }) => (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <filter id="shadow-calc" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="3"/>
        <feGaussianBlur stdDeviation="4"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
      </filter>
      <linearGradient id="gloss-calc" x1="32" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="white" stopOpacity="0.3"/>
        <stop offset="1" stopColor="white" stopOpacity="0"/>
      </linearGradient>
    </defs>
    <g filter="url(#shadow-calc)">
      <rect x="12" y="8" width="40" height="48" rx="8" fill="#F9FAFB"/>
      <rect x="16" y="12" width="32" height="12" rx="4" fill="#E5E7EB"/>
      <rect x="18" y="28" width="8" height="8" rx="4" fill="#E5E7EB"/>
      <rect x="28" y="28" width="8" height="8" rx="4" fill="#E5E7EB"/>
      <rect x="38" y="28" width="8" height="8" rx="4" fill="#C5B7FF"/>
      <rect x="18" y="38" width="8" height="8" rx="4" fill="#E5E7EB"/>
      <rect x="28" y="38" width="8" height="8" rx="4" fill="#E5E7EB"/>
      <rect x="38" y="38" width="8" height="18" rx="4" fill="#A7F3D0"/>
      <rect x="18" y="48" width="18" height="8" rx="4" fill="#FCD34D"/>
      <rect x="12" y="8" width="40" height="48" rx="8" fill="url(#gloss-calc)"/>
      <path d="M45.5 19C45.5 22.0376 43.1091 24.5 40.0909 24.5C37.0727 24.5 35 22.0376 35 19C35 15.9624 37.0727 14.5055 38.5818 12.5C39.4093 11.3912 40.0909 9.5 40.0909 9.5C40.0909 9.5 42.5 14.0111 45.5 19Z" fill="#10B981"/>
    </g>
  </svg>
);

export default CalculatorIcon;