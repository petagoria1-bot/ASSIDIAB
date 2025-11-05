import React from 'react';

const PlusIcon: React.FC<{className?: string}> = ({className}) => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <radialGradient id="add-snack-grad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                <stop offset="0%" stopColor="#FFFFFF"/>
                <stop offset="100%" stopColor="#F1F5F9"/>
            </radialGradient>
            <filter id="add-snack-shadow" x="-25%" y="-25%" width="150%" height="150%">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.08"/>
            </filter>
        </defs>
        <g filter="url(#add-snack-shadow)">
            {/* Background Circle with Gradient */}
            <circle cx="32" cy="32" r="28" fill="url(#add-snack-grad)"/>
            
            {/* Double Border */}
            <circle cx="32" cy="32" r="29" stroke="#FFFFFF" strokeOpacity="0.9" strokeWidth="1.5"/>
            <circle cx="32" cy="32" r="30.5" stroke="#E2E8F0" strokeOpacity="0.8" strokeWidth="1"/>
            
            {/* Green Plus Symbol */}
            <path d="M32 22V42" stroke="#10B981" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 32H42" stroke="#10B981" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
    </svg>
);

export default PlusIcon;