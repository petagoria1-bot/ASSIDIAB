
import React from 'react';

const DiabetesInfoIllustration: React.FC = () => (
    <div className="relative w-24 h-24 mx-auto my-2">
        <svg viewBox="0 0 100 100" className="absolute inset-0">
            {/* Stethoscope */}
            <g transform="translate(5, 5)">
                <path d="M20,30 A15,15 0 0,1 50,30" stroke="#E5E7EB" strokeWidth="6" fill="none" strokeLinecap="round"/>
                <line x1="20" y1="30" x2="10" y2="70" stroke="#E5E7EB" strokeWidth="6" strokeLinecap="round"/>
                <line x1="50" y1="30" x2="60" y2="70" stroke="#E5E7EB" strokeWidth="6" strokeLinecap="round"/>
                <circle cx="60" cy="70" r="10" fill="#40E0D0"/>
            </g>
             {/* Booklet */}
            <g transform="translate(45, 35)">
                <rect x="0" y="0" width="50" height="60" rx="8" fill="#F9FAFB"/>
                <rect x="5" y="10" width="30" height="5" rx="2.5" fill="#C5B7FF"/>
                <rect x="5" y="20" width="40" height="3" rx="1.5" fill="#E5E7EB"/>
                <rect x="5" y="30" width="40" height="3" rx="1.5" fill="#E5E7EB"/>
            </g>
        </svg>
    </div>
);

export default DiabetesInfoIllustration;
