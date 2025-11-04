
import React from 'react';

interface IconProps {
  className?: string;
}

const HomeIcon: React.FC<IconProps> = ({ className }) => (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <filter id="shadow-home" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="3"/>
        <feGaussianBlur stdDeviation="4"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
      </filter>
      <linearGradient id="gloss-home" x1="32" y1="6" x2="32" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="white" stopOpacity="0.4"/>
        <stop offset="1" stopColor="white" stopOpacity="0"/>
      </linearGradient>
    </defs>
    <g filter="url(#shadow-home)">
      <path d="M54 26.2687V52C54 53.1046 53.1046 54 52 54H12C10.8954 54 10 53.1046 10 52V26.2687L30.9836 8.79974C31.6033 8.29134 32.4223 8.29134 33.042 8.79974L54 26.2687Z" fill="#F9FAFB"/>
      <path d="M57 25L33.042 5.79974C32.4223 5.29134 31.6033 5.29134 30.9836 5.79974L7 25L32.0128 3.02454L57 25Z" fill="#10B981"/>
      <path d="M57 25L33.042 5.79974C32.4223 5.29134 31.6033 5.29134 30.9836 5.79974L7 25L32.0128 3.02454L57 25Z" fill="url(#gloss-home)"/>
      <path d="M36.1667 43.6186C34.4167 44.9519 32 46.5 32 46.5C32 46.5 29.5833 44.9519 27.8333 43.6186C25.5 41.8352 24 39.5 24 37.5C24 34.5 27.5 33 32 37.5C36.5 33 40 34.5 40 37.5C40 39.5 38.5 41.8352 36.1667 43.6186Z" fill="#EF4444"/>
    </g>
  </svg>
);

export default HomeIcon;