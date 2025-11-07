import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';
import { Repas } from '../types.ts';
import { usePatientStore } from '../store/patientStore.ts';

interface AddSnackModalProps {
  onClose: () => void;
  beforeTs: string;
  afterTs: string;
}

const toLocalISOString = (date: Date) => {
  const tzoffset = (new Date()).getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
};

const AddSnackModal: React.FC<AddSnackModalProps> = ({ onClose, beforeTs, afterTs }) => {
  const { addRepas } = usePatientStore();
  const t = useTranslations();

  const [carbs, setCarbs] = useState('');
  const [note, setNote] = useState('');

  const defaultTs = useMemo(() => {
    const beforeTime = new Date(beforeTs).getTime();
    const afterTime = new Date(afterTs).getTime();
    const middleTime = new Date((beforeTime + afterTime) / 2);
    return toLocalISOString(middleTime);
  }, [beforeTs, afterTs]);

  const [eventDateTime, setEventDateTime] = useState(defaultTs);

  const handleConfirm = () => {
    const carbsValue = parseFloat(carbs.replace(',', '.'));
    if (isNaN(carbsValue) || carbsValue < 0) {
      toast.error(t.toast_invalidCarbs);
      return;
    }

    const repasData: Omit<Repas, 'id' | 'patient_id' | 'ts'> = {
      moment: 'collation',
      items: [{ nom: t.mealTimes.collation, carbs_g: carbsValue, poids_g: undefined }],
      total_carbs_g: carbsValue,
      note: note.trim() || undefined,
    };

    addRepas(repasData, new Date(eventDateTime).toISOString());
    toast.success(t.toast_snackAdded);
    onClose();
  };

  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-jade focus:ring-2 focus:ring-jade/30 transition-all duration-150";

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-fade-in-lift" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-display font-semibold text-text-title mb-4 text-center">{t.addSnack_title}</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="snack-datetime" className="block text-sm font-medium text-text-muted mb-1">{t.common_datetime}</label>
            <input
              type="datetime-local"
              id="snack-datetime"
              value={eventDateTime}
              onChange={(e) => setEventDateTime(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="snack-carbs" className="block text-sm font-medium text-text-muted mb-1">{t.addSnack_totalCarbs}</label>
            <input
              type="number"
              inputMode="decimal"
              id="snack-carbs"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              className={inputClasses}
              placeholder="ex: 15"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="snack-note" className="block text-sm font-medium text-text-muted mb-1">{t.addSnack_note} ({t.common_optional})</label>
            <textarea
              id="snack-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputClasses}
              rows={2}
            />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">{t.common_cancel}</button>
          <button onClick={handleConfirm} className="w-full bg-jade text-white font-bold py-3 rounded-button hover:bg-opacity-90 transition-colors shadow-sm">{t.common_confirm}</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AddSnackModal;