
import React from 'react';

interface IconProps {
  className?: string;
}

const SettingsIcon: React.FC<IconProps> = ({ className }) => (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <filter id="shadow-settings" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="3"/>
        <feGaussianBlur stdDeviation="4"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
      </filter>
      <linearGradient id="gloss-settings" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="white" stopOpacity="0.4"/>
        <stop offset="100%" stopColor="white" stopOpacity="0"/>
      </linearGradient>
    </defs>
    <g filter="url(#shadow-settings)">
        <path d="M32 42C37.5228 42 42 37.5228 42 32C42 26.4772 37.5228 22 32 22C26.4772 22 22 26.4772 22 32C22 37.5228 26.4772 42 32 42Z" fill="#F9FAFB"/>
        <path d="M32 42L36 45L39 42L42 39L45 36L42 32L45 28L42 25L39 22L36 19L32 22L28 19L25 22L22 25L19 28L22 32L19 36L22 39L25 42L28 45L32 42Z" fill="#E5E7EB"/>
        <path d="M32 42C37.5228 42 42 37.5228 42 32C42 26.4772 37.5228 22 32 22C26.4772 22 22 26.4772 22 32C22 37.5228 26.4772 42 32 42Z" stroke="#E5E7EB" strokeWidth="2"/>
        <circle cx="32" cy="32" r="6" fill="#A7F3D0"/>
        <path d="M50.6274 23.4118L49.3725 19.3725L53 17L51 14L47.3725 15.6275L43.3333 14.3725L42 10H38L36.6275 14.3725L32.6274 15.6275L29 14L27 17L30.6275 19.3725L29.3725 23.4118H33.3725L34.5 27L37.5 27.5L40.5 27L41.6274 23.4118H50.6274Z" fill="#C5B7FF"/>
        <path d="M50.6274 23.4118L49.3725 19.3725L53 17L51 14L47.3725 15.6275L43.3333 14.3725L42 10H38L36.6275 14.3725L32.6274 15.6275L29 14L27 17L30.6275 19.3725L29.3725 23.4118H33.3725L34.5 27L37.5 27.5L40.5 27L41.6274 23.4118H50.6274Z" fill="url(#gloss-settings)"/>
    </g>
  </svg>
);

export default SettingsIcon;