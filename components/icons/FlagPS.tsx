import React from 'react';

const FlagPS: React.FC<{className?: string}> = ({className = "w-6 h-4 rounded-sm"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className={className}>
        <rect width="1" height="2" fill="#000"/>
        <rect x="1" width="1" height="2" fill="#d21010"/>
        <rect x="2" width="1" height="2" fill="#007a36"/>
    </svg>
);

export default FlagPS;
