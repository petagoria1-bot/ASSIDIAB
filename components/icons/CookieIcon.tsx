import React from 'react';

const CookieIcon: React.FC<{className?: string}> = ({className}) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#F59E0B"/>
        <circle cx="9" cy="10" r="1" fill="#78350F"/>
        <circle cx="15" cy="9" r="1" fill="#78350F"/>
        <circle cx="14" cy="15" r="1" fill="#78350F"/>
        <circle cx="10" cy="16" r="1.5" fill="#78350F"/>
    </svg>
);

export default CookieIcon;