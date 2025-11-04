
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { InjectionType } from '../types';
import useTranslations from '../hooks/useTranslations';

interface QuickBolusModalProps {
  onClose: () => void;
  onConfirm: (dose: number, type: InjectionType, ts: string) => void;
}

const SyringeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m18 2 4 4"></path><path d="m17 7 3-3"></path><path d="M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0L2.3 16.3a2.4 2.4 0 0 1 0-3.4Z"></path><path d="m14 11 3-3"></path><path d="m6 18l-2-2"></path><path d="m2 22 4-4"></path></svg>
);

const QuickBolusModal: React.FC<QuickBolusModalProps> = ({ onClose, onConfirm }) => {
  const [dose, setDose] = useState('');
  const [type, setType] = useState<InjectionType>('rapide');
  const t = useTranslations();
  
  const toLocalISOString = (date: Date) => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  }
  const [eventDateTime, setEventDateTime] = useState(toLocalISOString(new Date()));

  const handleConfirm = () => {
    const doseValue = parseFloat(dose.replace(',', '.'));
    if (isNaN(doseValue) || doseValue <= 0) {
      toast.error(t.toast_invalidDose);
      return;
    }
    onConfirm(doseValue, type, new Date(eventDateTime).toISOString());
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
            <SyringeIcon className="w-8 h-8 text-emerald-main me-2" />
            <h3 className="text-xl font-display font-semibold text-text-title">{t.quickAdd_bolusTitle}</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="bolus-datetime" className="block text-sm font-medium text-text-muted mb-1">{t.common_datetime}</label>
            <input
              type="datetime-local"
              id="bolus-datetime"
              value={eventDateTime}
              onChange={(e) => setEventDateTime(e.target.value)}
              onFocus={handleFocus}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="bolus-dose" className="block text-sm font-medium text-text-muted mb-1">{t.quickAdd_doseLabel}</label>
            <input
              type="number"
              inputMode="decimal"
              id="bolus-dose"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              onFocus={handleFocus}
              className={inputClasses}
              placeholder="ex: 4.5"
            />
          </div>
          <div>
            <span className="block text-sm font-medium text-text-muted mb-2">{t.quickAdd_injectionType}</span>
            <div className="flex gap-2">
                <button onClick={() => setType('rapide')} className={`flex-1 py-3 rounded-button text-sm font-semibold transition-colors ${type === 'rapide' ? 'bg-emerald-main text-white shadow-sm' : 'bg-white text-text-main border border-slate-300 hover:bg-slate-50'}`}>
                    {t.quickAdd_rapid}
                </button>
                <button onClick={() => setType('correction')} className={`flex-1 py-3 rounded-button text-sm font-semibold transition-colors ${type === 'correction' ? 'bg-emerald-main text-white shadow-sm' : 'bg-white text-text-main border border-slate-300 hover:bg-slate-50'}`}>
                    {t.common_correction}
                </button>
            </div>
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

export default QuickBolusModal;