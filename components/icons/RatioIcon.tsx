
import React from 'react';

const RatioIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16.5 16.5 7.5 7.5"></path>
        <path d="M17 7h-5"></path>
        <path d="M17 7v5"></path>
        <path d="M7 17h5"></path>
        <path d="M7 17v-5"></path>
    </svg>
);

export default RatioIcon;
