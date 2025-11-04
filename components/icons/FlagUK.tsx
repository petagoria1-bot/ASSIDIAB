import React from 'react';
const FlagUK: React.FC<{className?: string}> = ({className = "w-6 h-4 rounded-sm"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className={className}>
        <rect width="3" height="1" fill="#005BBB"/>
        <rect width="3" height="1" y="1" fill="#FFD500"/>
    </svg>
);
export default FlagUK;
