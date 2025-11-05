import React from 'react';

const LunchIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className={className} width="64" height="64">
        <g stroke="#1E293B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12,48h40c0,4.4-8.9,8-20,8S12,52.4,12,48z" fill="#F1F5F9" />
            <ellipse cx="32" cy="48" rx="20" ry="4" fill="#F9FAFB"/>
            <path d="M28.4,22.8c-3.7,0-7,2-7,6.4c0,5.7,4.3,8.8,7,8.8s7-3.1,7-8.8C35.4,24.8,32.1,22.8,28.4,22.8z" fill="#10B981"/>
            <path d="M22.4,29.2c0-3.3,2.7-6,6-6" fill="none"/>
            <path d="M34.4,29.2c0-3.3-2.7-6-6-6" fill="none"/>
            <path d="M28.4,38V48" fill="none"/>
            <path d="M37.3,42.5c0,4.4-3.6,8-8,8s-8-3.6-8-8c0-5.7,3.6-9,8-9S37.3,36.8,37.3,42.5z" fill="#EF4444"/>
            <path d="M33,26c0-2.2-1.8-4-4-4s-4,1.8-4,4" fill="none" stroke="#059669" />
            <path d="M35,32c0,0-2-4-6-4" fill="none" stroke="#FEE2E2"/>
        </g>
    </svg>
);

export default LunchIcon;