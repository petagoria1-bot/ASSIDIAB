import React from 'react';

const FlagTR: React.FC<{className?: string}> = ({className = "w-6 h-4 rounded-sm"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className={className}>
        <rect width="900" height="600" fill="#e30a17"/>
        <circle cx="300" cy="300" r="150" fill="#fff"/>
        <circle cx="337.5" cy="300" r="120" fill="#e30a17"/>
        <path d="M405 300l-47.2 34.3 18-55.5-47.2 34.3-29.2-55.5 18 55.5z" fill="#fff"/>
    </svg>
);

export default FlagTR;
