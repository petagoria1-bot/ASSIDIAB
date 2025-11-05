import React from 'react';

const BreakfastIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className={className} width="64" height="64">
        <g stroke="#1E293B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M48,32H32c-1.1,0-2,0.9-2,2v12c0,1.1,0.9,2,2,2h10c1.1,0,2-0.9,2-2v-3" fill="#F9FAFB"/>
            <path d="M48,32h4c1.1,0,2,0.9,2,2v6c0,1.1-0.9,2-2,2h-4" fill="#F9FAFB"/>
            <path d="M34,26c0-2.2-1.8-4-4-4" fill="none" />
            <path d="M40,26c0-2.2-1.8-4-4-4" fill="none" />
            <path d="M30.7,40.1C23,43,18.7,35,23.3,28.6c4.6-6.4,13.8-3.4,13.8-3.4s-3,10.1,3.6,14.7c6.6,4.6,13.4-3.5,9.8-10.2 c-3.5-6.6-13.7-4.2-13.7-4.2" fill="#FCD34D"/>
            <path d="M23.3,28.6c-1,1.8-0.6,4,1,5.4" fill="none"/>
            <path d="M32.5,27.1c-1,1.8-0.6,4,1,5.4" fill="none"/>
            <path d="M41.7,29.9c-1,1.8-0.6,4,1,5.4" fill="none"/>
            <rect x="32" y="34" width="16" height="10" fill="#475569" stroke="none"/>
        </g>
    </svg>
);

export default BreakfastIcon;