import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import useTranslations from '../hooks/useTranslations';
import DropletIcon from './icons/DropletIcon';

interface QuickAddItemModalProps {
  onClose: () => void;
  onConfirm: (gly: number, cetone: number | undefined, ts: string) => void;
}

const QuickAddItemModal: React.FC<QuickAddItemModalProps> = ({ onClose, onConfirm }) => {
  const [gly, setGly] = useState('');
  const [cetone, setCetone] = useState('');
  const t = useTranslations();

  const toLocalISOString = (date: Date) => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  }
  const [eventDateTime, setEventDateTime] = useState(toLocalISOString(new Date()));

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
  
  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150 text-center";

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-fade-in-lift" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center text-center mb-4">
            <DropletIcon className="w-8 h-8 text-emerald-main mr-2" />
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
          <button onClick={onClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">{t.common_cancel}</button>
          <button onClick={handleConfirm} className="w-full bg-emerald-main text-white font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors shadow-sm">{t.common_confirm}</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default QuickAddItemModal;