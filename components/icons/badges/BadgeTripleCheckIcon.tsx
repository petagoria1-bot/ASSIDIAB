import React from 'react';

const BadgeTripleCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <g transform="translate(0, 5)">
            <path d="M32 44C32 44 18 35 18 25C18 16.7157 24.268 10 32 10C39.732 10 46 16.7157 46 25C46 35 32 44 32 44Z" fill="#FF7E67" opacity="0.6"/>
            <path d="M22 38C22 38 10 30 10 22C10 14.8203 15.297 9 22 9C28.703 9 34 14.8203 34 22C34 30 22 38 22 38Z" fill="#A7F3D0" opacity="0.8"/>
            <path d="M42 38C42 38 30 30 30 22C30 14.8203 35.297 9 42 9C48.703 9 54 14.8203 54 22C54 30 42 38 42 38Z" fill="#40E0D0"/>
        </g>
    </svg>
);

export default BadgeTripleCheckIcon;
