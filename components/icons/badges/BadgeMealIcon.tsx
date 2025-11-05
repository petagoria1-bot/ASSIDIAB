import React from 'react';

const BadgeMealIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <radialGradient id="grad-bowl" cx="50%" cy="50%" r="50%" fx="25%" fy="25%">
                <stop offset="0%" stopColor="#FFFFFF"/>
                <stop offset="100%" stopColor="#E5E7EB"/>
            </radialGradient>
        </defs>
        <path d="M12 36C12 45.9411 20.0589 54 30 54H34C43.9411 54 52 45.9411 52 36V34H12V36Z" fill="#40E0D0"/>
        <ellipse cx="32" cy="34" rx="22" ry="8" fill="url(#grad-bowl)"/>
        <path d="M25 20L28 32" stroke="#FF7E67" strokeWidth="4" strokeLinecap="round"/>
        <path d="M37 22L34 32" stroke="#FF7E67" strokeWidth="4" strokeLinecap="round"/>
    </svg>
);

export default BadgeMealIcon;
