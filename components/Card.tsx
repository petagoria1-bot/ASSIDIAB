import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverEffect = true }) => {
  const baseClasses = "bg-white/[.85] rounded-card p-5 shadow-glass border border-black/5 transition-shadow duration-300 ease-fast";
  const clickableClasses = onClick ? "cursor-pointer" : "";
  const hoverClasses = hoverEffect && onClick ? "hover:shadow-glass-hover" : "";
  
  return (
    <div className={`${baseClasses} ${clickableClasses} ${hoverClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;