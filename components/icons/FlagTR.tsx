import React from 'react';
const FlagTR: React.FC<{className?: string}> = ({className = "w-6 h-4 rounded-sm"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className={className}>
      <rect width="900" height="600" fill="#e30a17"/>
      <circle cx="300" cy="300" r="150" fill="#fff"/>
      <circle cx="337.5" cy="300" r="120" fill="#e30a17"/>
      <polygon points="450,300 488.1,369.1 423,321.9 511.9,321.9 456.9,369.1" fill="#fff"/>
    </svg>
);
export default FlagTR;