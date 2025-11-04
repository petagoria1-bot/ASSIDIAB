
import React from 'react';

interface IconProps {
  className?: string;
}

const SyringeIcon: React.FC<IconProps> = ({ className }) => (
  <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <filter id="shadow-syringe" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
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
    <g filter="url(#shadow-syringe)" transform="rotate(45 32 32)">
        <rect x="22" y="10" width="20" height="4" rx="2" fill="#E5E7EB"/>
        <rect x="26" y="6" width="12" height="4" rx="2" fill="#C5B7FF"/>
        <path d="M26 14H38V22C38 23.1046 37.1046 24 36 24H28C26.8954 24 26 23.1046 26 22V14Z" fill="#F9FAFB"/>
        <rect x="28" y="16" width="8" height="6" fill="#A7F3D0"/>
        <path d="M36 24H28C28 24 26 34 32 34C38 34 36 24 36 24Z" fill="#F9FAFB"/>
        <path d="M34 34C34 38.4183 37.5817 42 42 42C46.4183 42 50 38.4183 50 34L34 34Z" fill="#40E0D0" fillOpacity="0.7"/>
        <path d="M14 34L34 34C34 38.4183 30.4183 42 26 42C21.5817 42 18 38.4183 18 34L14 34Z" fill="#40E0D0" fillOpacity="0.7"/>
        <path d="M25 42L25 54L28 58L31 54L31 42" stroke="#40E0D0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  </svg>
);

export default SyringeIcon;
