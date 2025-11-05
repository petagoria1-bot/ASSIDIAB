import React from 'react';
import { createPortal } from 'react-dom';
import useTranslations from '../hooks/useTranslations';
import GlucoseDropIcon from './icons/GlucoseDropIcon';
import SnackIcon from './icons/SnackIcon';

interface AddEventChoiceModalProps {
  onClose: () => void;
  onSelectMeasure: () => void;
  onSelectSnack: () => void;
}

const AddEventChoiceModal: React.FC<AddEventChoiceModalProps> = ({ onClose, onSelectMeasure, onSelectSnack }) => {
  const t = useTranslations();

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-fade-in-lift" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-display font-semibold text-text-title mb-6 text-center">{t.addEventChoice_title}</h3>
        
        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={onSelectMeasure}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-card hover:shadow-lg transition-all transform hover:-translate-y-1 space-y-2 border border-slate-200 ring-1 ring-white/20 btn-interactive"
            >
                <GlucoseDropIcon className="w-10 h-10 text-emerald-main"/>
                <span className="text-md font-bold text-text-title">{t.addEventChoice_measure}</span>
            </button>
            <button 
                onClick={onSelectSnack}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-card hover:shadow-lg transition-all transform hover:-translate-y-1 space-y-2 border border-slate-200 ring-1 ring-white/20 btn-interactive"
            >
                <SnackIcon className="w-10 h-10 text-warning"/>
                <span className="text-md font-bold text-text-title">{t.addEventChoice_snack}</span>
            </button>
        </div>
        
        <div className="mt-6">
          <button onClick={onClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">{t.common_cancel}</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AddEventChoiceModal;