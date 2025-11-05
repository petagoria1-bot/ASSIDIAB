import React from 'react';

const BowlIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 5c-5 0-8 2.5-8 5s3 5 8 5 8-2.5 8-5-3-5-8-5z" />
    <path d="M4 10h16" />
    <path d="M12 15v5" />
    <path d="M8 19h8" />
  </svg>
);

export default BowlIcon;
