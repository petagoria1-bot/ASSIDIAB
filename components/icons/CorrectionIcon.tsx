
import React from 'react';

const CorrectionIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 19l7-7-7-7"></path>
        <path d="M5 12h14"></path>
    </svg>
);

export default CorrectionIcon;
