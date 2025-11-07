import React from 'react';
import { createPortal } from 'react-dom';
import useTranslations from '../hooks/useTranslations.ts';
import UsersIcon from './icons/UsersIcon.tsx';
import CloseIcon from './icons/CloseIcon.tsx';

interface EmailExistsModalProps {
  onClose: () => void;
  onGoToLogin: () => void;
  onGoToReset: () => void;
}

const EmailExistsModal: React.FC<EmailExistsModalProps> = ({ onClose, onGoToLogin, onGoToReset }) => {
  const t = useTranslations();

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-card-open relative" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-text-muted hover:text-text-title p-1"
          aria-label={t.common_cancel}
        >
          <CloseIcon />
        </button>

        <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-mint-soft rounded-full mb-3">
                <UsersIcon className="w-8 h-8 text-jade"/>
            </div>
            <h3 className="text-xl font-display font-semibold text-text-title">{t.auth_emailExistsTitle}</h3>
            <p className="text-text-muted text-sm mt-2">{t.auth_emailExistsSubtitle}</p>
        </div>

        <div className="mt-6 flex flex-col space-y-3">
          <button 
            onClick={onGoToLogin} 
            className="w-full bg-jade text-white font-bold py-3 rounded-button hover:opacity-90 transition-colors shadow-sm btn-interactive"
          >
            {t.auth_goToLogin}
          </button>
          <button 
            onClick={onGoToReset} 
            className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors btn-interactive"
          >
            {t.auth_forgotPassword}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EmailExistsModal;