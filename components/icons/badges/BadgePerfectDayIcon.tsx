import React from 'react';

const BadgePerfectDayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
         <defs>
            <radialGradient id="grad-moon" cx="50%" cy="50%" r="50%" fx="70%" fy="30%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#FCD34D" stopOpacity="0"/>
            </radialGradient>
        </defs>
        <path d="M49.71,38.29A22,22,0,1,1,25.71,14.29,17,17,0,0,0,49.71,38.29Z" fill="#FCD34D"/>
        <path d="M49.71,38.29A22,22,0,1,1,25.71,14.29,17,17,0,0,0,49.71,38.29Z" fill="url(#grad-moon)"/>
        <circle cx="45" cy="20" r="3" fill="white" opacity="0.7"/>
        <circle cx="40" cy="45" r="2" fill="white" opacity="0.5"/>
    </svg>
);

export default BadgePerfectDayIcon;
