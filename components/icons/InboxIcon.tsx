import React from 'react';

interface IconProps {
  className?: string;
}

const InboxIcon: React.FC<IconProps> = ({ className }) => (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <filter id="shadow-inbox" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
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
    <g filter="url(#shadow-inbox)">
      <path d="M12 16H52V42C52 45.3137 49.3137 48 46 48H18C14.6863 48 12 45.3137 12 42V16Z" fill="#F9FAFB"/>
      <path d="M12 16L32 32L52 16" stroke="#B0B0B0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 16H52" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round"/>
      <path d="M22 26L16 32" stroke="#A7F3D0" strokeWidth="4" strokeLinecap="round"/>
      <path d="M42 26L48 32" stroke="#A7F3D0" strokeWidth="4" strokeLinecap="round"/>
    </g>
  </svg>
);

export default InboxIcon;
