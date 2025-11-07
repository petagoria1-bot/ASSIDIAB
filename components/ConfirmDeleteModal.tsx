import React from 'react';
import { createPortal } from 'react-dom';
import useTranslations from '../hooks/useTranslations';
import EmergencyIcon from './icons/EmergencyIcon';

interface ConfirmDeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  onClose,
  onConfirm,
  title,
  message,
  confirmText
}) => {
  const t = useTranslations();

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-card-open" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-danger-soft rounded-full mb-3">
            <EmergencyIcon className="w-8 h-8 text-danger-dark"/>
          </div>
          <h3 className="text-xl font-display font-semibold text-text-title">{title}</h3>
          <p className="text-text-muted text-sm mt-2">{message}</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">{t.common_cancel}</button>
          <button onClick={onConfirm} className="w-full bg-danger text-white font-bold py-3 rounded-button hover:bg-danger-dark transition-colors shadow-sm">{confirmText}</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ConfirmDeleteModal;
