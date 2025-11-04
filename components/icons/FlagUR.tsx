import React from 'react';
const FlagUR: React.FC<{className?: string}> = ({className = "w-6 h-4 rounded-sm"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24" className={className}>
        <rect width="36" height="24" fill="#006643"/>
        <rect width="9" height="24" fill="#fff"/>
        <path d="M21 12a4.5 4.5 0 1 0 0 .001z m 1 0a3.5 3.5 0 1 1 0 .001z" fill="#fff"/>
        <path d="M26.5 12l-1.9 1.4.7-2.3-1.9-1.4h2.3l.7-2.3.7 2.3h2.3l-1.9 1.4.7 2.3z" fill="#fff" transform="translate(-1, 0) rotate(15, 26.5, 12)"/>
    </svg>
);
export default FlagUR;
