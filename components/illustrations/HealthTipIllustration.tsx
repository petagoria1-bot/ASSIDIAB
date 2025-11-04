
import React from 'react';

const HealthTipIllustration: React.FC = () => (
    <div className="relative w-24 h-24 mx-auto my-2">
        <svg viewBox="0 0 100 100" className="absolute inset-0">
            {/* Lightbulb */}
            <g transform="translate(25, 10)">
                <path d="M25 50C33.2843 50 40 43.2843 40 35C40 26.7157 33.2843 20 25 20C16.7157 20 10 26.7157 10 35C10 43.2843 16.7157 50 25 50Z" fill="#FCD34D"/>
                <path d="M15 50H35V58C35 59.1046 34.1046 60 33 60H17C15.8954 60 15 59.1046 15 58V50Z" fill="#E5E7EB"/>
                <circle cx="25" cy="35" r="15" fill="white" fillOpacity="0.4"/>
            </g>
            {/* Leaf */}
            <g transform="translate(45, 45)">
                 <path d="M20 0C20 0 40 10 40 30C40 45 20 50 20 50C20 50 0 45 0 30C0 10 20 0 20 0Z" fill="#A7F3D0"/>
                <path d="M20 0V50" stroke="#00A86B" strokeWidth="2"/>
            </g>
        </svg>
    </div>
);

export default HealthTipIllustration;
