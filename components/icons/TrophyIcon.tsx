import React from 'react';

const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2L9 6H4l3 5-3 5h5l3 4 3-4h5l-3-5 3-5h-5L12 2z" fill="#FCD34D" />
    <path d="M12 2v20" stroke="#FBBF24" strokeWidth="1" />
  </svg>
);

export default TrophyIcon;
