import React from 'react';

const BadgeGlucoseDropIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <radialGradient id="grad-drop" cx="50%" cy="50%" r="50%" fx="25%" fy="25%">
                <stop offset="0%" stopColor="#A7F3D0"/>
                <stop offset="100%" stopColor="#00A86B"/>
            </radialGradient>
        </defs>
        <path d="M32 54C32 54 14 42 14 28C14 16.9543 22.0589 8 32 8C41.9411 8 50 16.9543 50 28C50 42 32 54 32 54Z" fill="url(#grad-drop)"/>
        <path d="M30 15C29.2731 15 24.5 16.5 24.5 21C24.5 25.5 29.3333 26.8333 30 27" stroke="white" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

export default BadgeGlucoseDropIcon;
