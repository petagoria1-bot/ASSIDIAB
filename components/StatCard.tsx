import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="bg-mint-soft/30 p-4 rounded-xl text-center">
      <p className="text-sm font-semibold text-text-muted">{title}</p>
      <p className="text-2xl font-display font-bold text-jade-deep-dark mt-1">{value}</p>
    </div>
  );
};

export default StatCard;
