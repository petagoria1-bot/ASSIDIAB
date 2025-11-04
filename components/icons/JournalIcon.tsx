
import React from 'react';

interface IconProps {
  className?: string;
}

const JournalIcon: React.FC<IconProps> = ({ className }) => (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <filter id="shadow-journal" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
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
    <g filter="url(#shadow-journal)">
      <path d="M48 8H18C15.7909 8 14 9.79086 14 12V52C14 54.2091 15.7909 56 18 56H48C50.2091 56 52 54.2091 52 52V12C52 9.79086 50.2091 8 48 8Z" fill="#F9FAFB"/>
      <path d="M33 8H18C15.7909 8 14 9.79086 14 12V52C14 54.2091 15.7909 56 18 56H33V8Z" fill="#E5E7EB"/>
      <rect x="20" y="18" width="26" height="4" rx="2" fill="#C5B7FF"/>
      <rect x="20" y="28" width="26" height="2" rx="1" fill="#E5E7EB"/>
      <rect x="20" y="34" width="26" height="2" rx="1" fill="#E5E7EB"/>
      <rect x="20" y="40" width="18" height="2" rx="1" fill="#E5E7EB"/>
      <path d="M48 8H18C15.7909 8 14 9.79086 14 12V52C14 54.2091 15.7909 56 18 56H48C50.2091 56 52 54.2091 52 52V12C52 9.79086 50.2091 8 48 8Z" stroke="#E5E7EB" strokeWidth="2"/>
       <path d="M42 22L28 36L46 54L52.0003 26.5C52.0003 26.5 45 18 42 22Z" fill="#10B981"/>
      <path d="M46 54L54 48L42 22L46 54Z" fill="#A7F3D0"/>
    </g>
  </svg>
);

export default JournalIcon;