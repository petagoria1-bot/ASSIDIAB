import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface QuickAddItemModalProps {
  onClose: () => void;
  onConfirm: (gly: number, cetone: number | undefined, ts: string) => void;
}

const DropletIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>
);


const QuickAddItemModal: React.FC<QuickAddItemModalProps> = ({ onClose, onConfirm }) => {
  const [gly, setGly] = useState('');
  const [cetone, setCetone] = useState('');

  const toLocalISOString = (date: Date) => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  }
  const [eventDateTime, setEventDateTime] = useState(toLocalISOString(new Date()));

  const handleConfirm = () => {
    const glyValue = parseFloat(gly.replace(',', '.'));
    if (isNaN(glyValue) || glyValue <= 0) {
      toast.error('Veuillez entrer une glycémie valide.');
      return;
    }
    const cetoneValue = cetone ? parseFloat(cetone.replace(',', '.')) : undefined;
    if (cetoneValue && (isNaN(cetoneValue) || cetoneValue < 0)) {
        toast.error('Veuillez entrer une valeur de cétone valide.');
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-fade-in-lift" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center text-center mb-4">
            <DropletIcon className="w-8 h-8 text-emerald-main mr-2" />
            <h3 className="text-xl font-display font-semibold text-text-title">Ajouter une Mesure</h3>
        </div>
        
        <div className="space-y-4">
            <div>
                <label htmlFor="measure-datetime" className="block text-sm font-medium text-text-muted mb-1">Date et Heure</label>
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
                <label htmlFor="measure-gly" className="block text-sm font-medium text-text-muted mb-1">Glycémie (g/L)</label>
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
                <label htmlFor="measure-cetone" className="block text-sm font-medium text-text-muted mb-1">Cétone (mmol/L) - <span className="italic">optionnel</span></label>
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
          <button onClick={onClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">Annuler</button>
          <button onClick={handleConfirm} className="w-full bg-emerald-main text-white font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors shadow-sm">Confirmer</button>
        </div>
      </div>
    </div>
  );
};

export default QuickAddItemModal;