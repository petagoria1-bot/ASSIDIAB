import React from 'react';
import { createPortal } from 'react-dom';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';
import { DoseCalculationOutput, Patient, MealTime } from '../types.ts';
import MealIcon from './icons/MealIcon.tsx';
import SyringeIcon from './icons/SyringeIcon.tsx';
import EmergencyIcon from './icons/EmergencyIcon.tsx';

interface DoseExplanationModalProps {
  onClose: () => void;
  calculation: DoseCalculationOutput;
  patient: Patient;
  glyPre: string;
  totalCarbs: number;
  moment: MealTime;
}

const DoseExplanationModal: React.FC<DoseExplanationModalProps> = ({
  onClose,
  calculation,
  patient,
  glyPre,
  totalCarbs,
  moment,
}) => {
  const t = useTranslations();

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-fade-in-lift" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-display font-semibold text-text-title mb-4 text-center">{t.doseExplanation_title}</h3>

        <div className="space-y-3">
          {/* Meal Bolus */}
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <MealIcon className="w-5 h-5 text-emerald-main" />
              <p className="font-semibold text-text-title">{t.doseExplanation_mealTitle}</p>
            </div>
            <p className="text-sm text-text-muted ps-7">{t.doseExplanation_mealDetail(totalCarbs, patient.ratios[moment])}</p>
            <p className="text-end font-bold text-lg text-emerald-main">{calculation.doseRepas_U.toFixed(1)} U</p>
          </div>

          {/* Correction Bolus */}
          {calculation.addCorr_U > 0 && (
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                 <SyringeIcon className="w-5 h-5 text-info" />
                 <p className="font-semibold text-text-title">{t.doseExplanation_correctionTitle}</p>
              </div>
              <p className="text-sm text-text-muted ps-7">{t.doseExplanation_correctionDetail(glyPre)}</p>
              <p className="text-end font-bold text-lg text-info">{calculation.addCorr_U} U</p>
            </div>
          )}

          {/* Warning */}
          {calculation.warning && (
            <div className="bg-amber-100 p-3 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-1">
                 <EmergencyIcon className="w-5 h-5 text-warning" />
                 <p className="font-semibold text-amber-800">{t.doseExplanation_warningTitle}</p>
              </div>
              <p className="text-sm text-amber-700 ps-7">{calculation.warning}</p>
            </div>
          )}

          {/* Total */}
          <div className="bg-emerald-main/10 p-3 rounded-lg border border-emerald-main/20 text-center">
            <p className="font-semibold text-text-title">{t.doseExplanation_totalTitle}</p>
            <p className="font-display text-4xl font-bold text-emerald-main">{calculation.doseTotale} U</p>
          </div>
        </div>

        <div className="mt-6">
          <button onClick={onClose} className="w-full bg-emerald-main text-white font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors shadow-sm">{t.doseExplanation_close}</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DoseExplanationModal;