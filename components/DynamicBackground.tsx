import React, { useState, useEffect } from 'react';

const getGradientClass = () => {
    const hour = new Date().getHours();
    // Sunrise (5am - 8am)
    if (hour >= 5 && hour < 8) return 'from-[#008A68]/80 via-[#FCD34D]/20 to-[#FF7E67]/40';
    // Daytime (8am - 5pm)
    if (hour >= 8 && hour < 17) return 'from-jade-deep-dark to-emerald-main';
    // Sunset (5pm - 8pm)
    if (hour >= 17 && hour < 20) return 'from-jade-deep-dark/90 via-[#FF7E67]/30 to-indigo-400/50';
    // Night (8pm - 5am)
    return 'from-[#0F172A] via-[#1E293B] to-[#334155]';
};

const DynamicBackground: React.FC = () => {
    const [gradientClass, setGradientClass] = useState(getGradientClass());

    useEffect(() => {
        const timerId = setInterval(() => {
            setGradientClass(getGradientClass());
        }, 60000); // Update every minute

        return () => clearInterval(timerId);
    }, []);

    return (
        <div 
            className={`fixed inset-0 -z-10 bg-gradient-to-b transition-all duration-[3000ms] ease-in-out ${gradientClass}`}
        />
    );
};

export default DynamicBackground;
