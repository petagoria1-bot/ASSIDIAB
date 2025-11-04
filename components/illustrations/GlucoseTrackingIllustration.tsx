
import React from 'react';

const GlucoseTrackingIllustration: React.FC = () => (
    <div className="relative w-full h-24 my-2">
        <svg viewBox="0 0 150 60" className="w-full h-full">
            {/* Background Chart */}
            <path d="M10 50 C 30 10, 50 50, 70 30, 90 5, 110 40, 130 20" stroke="#A7F3D0" strokeWidth="8" strokeLinecap="round" fill="none"/>
            {/* Foreground Chart */}
            <path d="M15 45 C 35 15, 55 45, 75 25, 95 10, 115 35, 135 15" stroke="#00A86B" strokeWidth="4" strokeLinecap="round" fill="none"/>
            {/* CGM Sensor */}
            <g transform="translate(110, 35)">
                 <circle cx="10" cy="10" r="10" fill="#E5E7EB"/>
                 <circle cx="10" cy="10" r="4" fill="#40E0D0"/>
            </g>
        </svg>
    </div>
);

export default GlucoseTrackingIllustration;
