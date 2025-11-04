
import React from 'react';

interface IconProps {
  className?: string;
}

const GlucoseDropIcon: React.FC<IconProps> = ({ className }) => (
  <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <filter id="shadow-drop" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="3"/>
        <feGaussianBlur stdDeviation="3"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
      </filter>
       <linearGradient id="gloss-drop" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="white" stopOpacity="0.4"/>
        <stop offset="100%" stopColor="#40E0D0" stopOpacity="0"/>
      </linearGradient>
    </defs>
    <g filter="url(#shadow-drop)">
        <circle cx="32" cy="32" r="22" fill="#F9FAFB"/>
        <path d="M47.5 40C47.5 48.5563 40.5563 55.5 32 55.5C23.4437 55.5 16.5 48.5563 16.5 40C16.5 31.4437 22.1856 21.5832 32 12C41.8144 21.5832 47.5 31.4437 47.5 40Z" fill="#40E0D0"/>
        <path d="M47.5 40C47.5 48.5563 40.5563 55.5 32 55.5C23.4437 55.5 16.5 48.5563 16.5 40C16.5 31.4437 22.1856 21.5832 32 12C41.8144 21.5832 47.5 31.4437 47.5 40Z" fill="url(#gloss-drop)"/>
    </g>
  </svg>
);

export default GlucoseDropIcon;
