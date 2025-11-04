
import React from 'react';

interface IconProps {
  className?: string;
}

const CalendarIcon: React.FC<IconProps> = ({ className }) => (
  <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <filter id="shadow-calendar" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
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
    <g filter="url(#shadow-calendar)">
      <rect x="8" y="12" width="48" height="42" rx="8" fill="#F9FAFB"/>
      <rect x="8" y="12" width="48" height="12" rx="8" fill="#E5E7EB"/>
      <rect x="18" y="8" width="8" height="8" rx="4" fill="#C5B7FF"/>
      <rect x="38" y="8" width="8" height="8" rx="4" fill="#C5B7FF"/>
      <circle cx="22" cy="34" r="4" fill="#E5E7EB"/>
      <circle cx="32" cy="34" r="4" fill="#E5E7EB"/>
      <circle cx="42" cy="34" r="4" fill="#FF7E67"/>
      <circle cx="22" cy="44" r="4" fill="#E5E7EB"/>
      <circle cx="32" cy="44" r="4" fill="#E5E7EB"/>
      <circle cx="42" cy="44" r="4" fill="#E5E7EB"/>
    </g>
  </svg>
);

export default CalendarIcon;
