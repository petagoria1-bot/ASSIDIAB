import React from 'react';
import DropletLogoIcon from './icons/DropletLogoIcon.tsx';
import useTranslations from '../hooks/useTranslations.ts';

const LoadingScreen: React.FC<{ message?: string }> = ({ message }) => {
  const t = useTranslations();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-main-gradient">
      <div className="relative w-24 h-24 mb-4">
        <DropletLogoIcon className="w-full h-full animate-loader-beat" />
      </div>
      <p className="text-white font-semibold text-lg tracking-wider text-shadow">
        {message || t.common_loading_connection}
      </p>
    </div>
  );
};

export default LoadingScreen;