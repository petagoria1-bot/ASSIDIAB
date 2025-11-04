import React from 'react';
const FlagAR: React.FC<{className?: string}> = ({className = "w-6 h-4 rounded-sm"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" className={className}>
        <rect width="1200" height="800" fill="#c1272d"/>
        <path fill="none" stroke="#006233" strokeWidth="38" d="M600 243.21l58.78 167.9h-180.5l145.31-108.4h-117.56z"/>
    </svg>
);
export default FlagAR;