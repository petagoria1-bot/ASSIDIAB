
import React from 'react';

const MealIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M7 21h10" />
        <path d="M3 11h18" />
        <path d="M12 11v10" />
        <path d="M6.6 11.2c.9-2.5 3.1-4.2 5.4-4.2s4.5 1.7 5.4 4.2" />
    </svg>
);

export default MealIcon;
