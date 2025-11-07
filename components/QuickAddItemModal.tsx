import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';
import DropletIcon from './icons/DropletIcon.tsx';

interface QuickAddItemModalProps {
  onClose: () => void;
  onConfirm: (gly: number, cetone: number | undefined, ts: string) => void;
  initialTs?: string;
}

const QuickAddItemModal: React.FC<QuickAddItemModalProps> = ({ onClose, onConfirm, initialTs }) => {
  const [gly, setGly] = useState('');
  const [cetone, setCetone] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const t = useTranslations();

  const toLocalISOString = (date: Date) => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  }
  const [eventDateTime, setEventDateTime] = useState(initialTs ? toLocalISOString(new Date(initialTs)) : toLocalISOString(new Date()));

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 400); // Wait for animation to finish
  };

  const handleConfirm = () => {
    const glyValue = parseFloat(gly.replace(',', '.'));
    if (isNaN(glyValue) || glyValue <= 0) {
      toast.error(t.toast_invalidGlycemia);
      return;
    }
    const cetoneValue = cetone ? parseFloat(cetone.replace(',', '.')) : undefined;
    if (cetoneValue && (isNaN(cetoneValue) || cetoneValue < 0)) {
        toast.error(t.toast_invalidKetone);
        return;
    }
    onConfirm(glyValue, cetoneValue, new Date(eventDateTime).toISOString());
  };
  
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      event.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };
  
  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-jade focus:ring-2 focus:ring-jade/30 transition-all duration-150 text-center";

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={handleClose}>
      <div className={`bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 ${isClosing ? 'animate-card-close' : 'animate-card-open'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center text-center mb-4">
            <DropletIcon className="w-8 h-8 text-jade me-2" />
            <h3 className="text-xl font-display font-semibold text-text-title">{t.quickAdd_measureTitle}</h3>
        </div>
        
        <div className="space-y-4">
            <div>
                <label htmlFor="measure-datetime" className="block text-sm font-medium text-text-muted mb-1">{t.common_datetime}</label>
                <input
                  type="datetime-local"
                  id="measure-datetime"
                  value={eventDateTime}
                  onChange={(e) => setEventDateTime(e.target.value)}
                  onFocus={handleFocus}
                  className={inputClasses}
                />
            </div>
            <div>
                <label htmlFor="measure-gly" className="block text-sm font-medium text-text-muted mb-1">{t.quickAdd_glycemiaLabel}</label>
                <input
                  type="number"
                  inputMode="decimal"
                  id="measure-gly"
                  value={gly}
                  onChange={(e) => setGly(e.target.value)}
                  onFocus={handleFocus}
                  className={inputClasses}
                  placeholder="ex: 1.25"
                  autoFocus
                />
            </div>
            <div>
                <label htmlFor="measure-cetone" className="block text-sm font-medium text-text-muted mb-1">{t.quickAdd_ketoneLabel} - <span className="italic">({t.common_optional})</span></label>
                <input
                  type="number"
                  inputMode="decimal"
                  id="measure-cetone"
                  value={cetone}
                  onChange={(e) => setCetone(e.target.value)}
                  onFocus={handleFocus}
                  className={inputClasses}
                  placeholder="ex: 0.8"
                />
            </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={handleClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors btn-interactive">{t.common_cancel}</button>
          <button onClick={handleConfirm} className="w-full bg-jade text-white font-bold py-3 rounded-button hover:bg-opacity-90 transition-colors shadow-sm btn-interactive">{t.common_confirm}</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default QuickAddItemModal;