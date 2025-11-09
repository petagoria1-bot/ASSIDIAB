import React, { useState, useEffect } from 'react';
import DropletLogoIcon from './icons/DropletLogoIcon.tsx';
import useTranslations from '../hooks/useTranslations.ts';

const LoadingScreen: React.FC<{ message?: string }> = ({ message }) => {
  const t = useTranslations();
  const messages = [
    t.common_loading_connection,
    "Vérification du profil...",
    "Préparation de l'interface...",
  ];
  const [currentMessage, setCurrentMessage] = useState(message || messages[0]);

  useEffect(() => {
    if (!message) {
      let index = 0;
      const intervalId = setInterval(() => {
        index = (index + 1) % messages.length;
        setCurrentMessage(messages[index]);
      }, 2000);

      return () => clearInterval(intervalId);
    }
  }, [message, messages]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-main-gradient">
      <div className="relative w-24 h-24 mb-4">
        <DropletLogoIcon className="w-full h-full animate-loader-beat" />
      </div>
      <p className="text-white font-semibold text-lg tracking-wider text-shadow transition-opacity duration-500 animate-fade-in-fast" key={currentMessage}>
        {currentMessage}
      </p>
    </div>
  );
};

export default LoadingScreen;