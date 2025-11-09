import React from 'react';

// FIX: Updated CardProps to extend React.HTMLAttributes<HTMLDivElement> to allow passing standard div attributes like `style`.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverEffect = true, ...props }) => {
  const baseClasses = "bg-white/[.85] rounded-card p-5 shadow-glass border border-black/5 transition-all duration-300 ease-fast";
  const clickableClasses = onClick ? "cursor-pointer" : "";
  const hoverClasses = hoverEffect && onClick ? "hover:shadow-glass-hover hover:-translate-y-1 hover:ring-4 hover:ring-mint/30" : "";
  
  return (
    <div className={`${baseClasses} ${clickableClasses} ${hoverClasses} ${className}`} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export default Card;
