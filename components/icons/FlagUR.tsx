import React from 'react';

const FlagUR: React.FC<{className?: string}> = ({className = "w-6 h-4 rounded-sm"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className={className}>
        <rect fill="#fff" width="900" height="600"/>
        <rect fill="#01411c" x="225" width="675" height="600"/>
        <circle fill="#fff" cx="562.5" cy="300" r="131.25"/>
        <circle fill="#01411c" cx="585.9375" cy="300" r="114.84375"/>
        <polygon fill="#fff" points="630,225 647.73,272.27 699.4,279.39 660.83,313.11 671.18,362.5 630,336.2 588.82,362.5 599.17,313.11 560.6,279.39 612.27,272.27"/>
    </svg>
);

export default FlagUR;
