

import React from 'react';
import DropletLogoIcon from './icons/DropletLogoIcon.tsx';

const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Chargement...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-main-gradient">
      <div className="relative w-24 h-24 mb-4">
        <div className="absolute inset-0 flex items-center justify-center">
            <DropletLogoIcon className="w-20 h-20" />
        </div>
        <div className="absolute inset-0 border-4 border-emerald-main/30 border-t-white rounded-full animate-loader-spin"></div>
      </div>
      <p className="text-white font-semibold text-lg tracking-wider">{message}</p>
    </div>
  );
};

export default LoadingScreen;