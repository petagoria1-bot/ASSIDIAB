import React from 'react';

const DinnerIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className={className} width="64" height="64">
        <g stroke="#1E293B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12,48h40c0,4.4-8.9,8-20,8S12,52.4,12,48z" fill="#F1F5F9"/>
            <ellipse cx="32" cy="48" rx="20" ry="4" fill="#F9FAFB"/>
            <path d="M35.6,22.8c-3.7,0-7,2-7,6.4c0,5.7,4.3,8.8,7,8.8s7-3.1,7-8.8C42.6,24.8,39.3,22.8,35.6,22.8z" fill="#10B981"/>
            <path d="M29.6,29.2c0-3.3,2.7-6,6-6" fill="none"/>
            <path d="M41.6,29.2c0-3.3-2.7-6-6-6" fill="none"/>
            <path d="M35.6,38V48" fill="none"/>
            <path d="M22,30l6-16h4l-2,8" fill="#F59E0B"/>
            <path d="M29,12l4,2" fill="none"/>
            <path d="M25,16l6-1" fill="none"/>
            <path d="M32.8,45.8c-4.6,0-8-5.3-8-8.8c0-3.5,4-10,8-10s8,6.5,8,10C40.8,40.5,37.4,45.8,32.8,45.8z" fill="#EF4444" transform="rotate(-45 32.8 35.8)"/>
            <circle cx="30" cy="38" r="0.5" fill="#FCD34D" stroke="none"/>
            <circle cx="32" cy="39" r="0.5" fill="#FCD34D" stroke="none"/>
            <circle cx="34" cy="38" r="0.5" fill="#FCD34D" stroke="none"/>
        </g>
    </svg>
);

export default DinnerIcon;