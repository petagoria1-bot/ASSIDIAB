import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-mint-soft/30 p-4 rounded-xl text-center">
      <div className="flex items-center justify-center gap-1.5">
          {icon}
          <p className="text-sm font-semibold text-text-muted">{title}</p>
      </div>
      <p className="text-2xl font-display font-bold text-jade-deep-dark mt-1">{value}</p>
    </div>
  );
};

export default StatCard;