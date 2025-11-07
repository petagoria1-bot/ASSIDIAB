import React from 'react';

const FlagAR: React.FC<{className?: string}> = ({className = "w-6 h-4 rounded-sm"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" className={className}>
        <rect width="1200" height="800" fill="#006c35"/>
        <text x="600" y="400" fill="#fff" fontFamily="serif" fontSize="150" textAnchor="middle">
        لا إله إلا الله، محمد رسول الله
        </text>
        <path d="M200 550 H 1000 L 970 570 H 230 z" fill="#fff"/>
        <path d="M950 540 L 920 550 L 950 560 L 940 550 z" fill="#fff"/>
    </svg>
);

export default FlagAR;
