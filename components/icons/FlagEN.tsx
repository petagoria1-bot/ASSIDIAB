import React from 'react';
const FlagEN: React.FC<{className?: string}> = ({className = "w-6 h-4 rounded-sm"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 36" className={className}>
        <clipPath id="a"><path d="M0 0h60v36H0z"/></clipPath>
        <g clipPath="url(#a)">
            <path d="M0 0h60v36H0z" fill="#012169"/>
            <path d="m0 0 60 36m-60 0L60 0" stroke="#fff" strokeWidth="6"/>
            <path d="m0 0 60 36m-60 0L60 0" stroke="#C8102E" strokeWidth="4"/>
            <path d="M30 0v36M0 18h60" stroke="#fff" strokeWidth="10"/>
            <path d="M30 0v36M0 18h60" stroke="#C8102E" strokeWidth="6"/>
        </g>
    </svg>
);
export default FlagEN;
