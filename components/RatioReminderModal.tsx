
import React from 'react';
import { createPortal } from 'react-dom';
import useTranslations from '../hooks/useTranslations';
import { MealTime } from '../types';
import RatioIcon from './icons/RatioIcon';

interface RatioReminderModalProps {
  onClose: () => void;
  onConfirm: () => void;
  mealTime: MealTime;
  ratio: number;
  totalDose: number;
}

const RatioReminderModal: React.FC<RatioReminderModalProps> = ({
  onClose,
  onConfirm,
  mealTime,
  ratio,
  totalDose,
}) => {
  const t = useTranslations();

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-card-open" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-mint-soft rounded-full mb-3">
                <RatioIcon className="w-8 h-8 text-emerald-main"/>
            </div>
            <h3 className="text-xl font-display font-semibold text-text-title">{t.ratioReminder_title}</h3>
            <p className="text-text-muted mt-2">
                {t.ratioReminder_forMeal(t.mealTimes[mealTime])}, {t.ratioReminder_ratioIs(ratio)}
            </p>
        </div>

        <div className="mt-4 text-center bg-emerald-main/10 p-4 rounded-xl border border-emerald-main/20">
            <p className="font-semibold text-text-title">{t.ratioReminder_doseIs}</p>
            <p className="font-display text-5xl font-bold text-emerald-main">{totalDose} <span className="text-3xl text-text-muted">U</span></p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">{t.common_cancel}</button>
          <button onClick={onConfirm} className="w-full bg-emerald-main text-white font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors shadow-sm">{t.ratioReminder_confirm}</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RatioReminderModal;
