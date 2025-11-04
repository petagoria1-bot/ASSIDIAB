import React from 'react';

const SunIcon: React.FC<{className?: string}> = ({className}) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="5" fill="#FCD34D"/>
        <path d="M12 1V3" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 21V23" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
        <path d="M4.22 4.22L5.64 5.64" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
        <path d="M18.36 18.36L19.78 19.78" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
        <path d="M1 12H3" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
        <path d="M21 12H23" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
        <path d="M4.22 19.78L5.64 18.36" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
        <path d="M18.36 5.64L19.78 4.22" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

export default SunIcon;