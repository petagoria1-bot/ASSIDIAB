import React from 'react';
const FlagPS: React.FC<{className?: string}> = ({className = "w-6 h-4 rounded-sm"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className={className}>
        <rect width="300" height="600" fill="#000"/>
        <rect width="300" height="600" x="300" fill="#d32027"/>
        <rect width="300" height="600" x="600" fill="#00933c"/>
        <g transform="translate(450, 300) scale(16)" fill="#fff">
            <path d="M0-11c-1.1 0-2 .9-2 2v1c-2.8 0-5 2.2-5 5v2c0 2.8 2.2 5 5 5h1c.6 0 1 .4 1 1v2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-2c0-.6.4-1 1-1h1c2.8 0 5-2.2 5-5v-2c0-2.8-2.2-5-5-5v-1c0-1.1-.9-2-2-2z"/>
            <path d="M0 4.5A.5.5 0 00-.5 5v3c0 .3.2.5.5.5h2c.3 0 .5-.2.5-.5V5c0-.3-.2-.5-.5-.5z" transform="translate(-1 0)"/>
            <path d="M0-4a1 1 0 011 1v2a1 1 0 01-2 0v-2a1 1 0 011-1z"/>
        </g>
    </svg>
);
export default FlagPS;