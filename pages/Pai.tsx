import React from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import Card from '../components/Card.tsx';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';
import { MealTime, CorrectionRule } from '../types.ts';

const Pai: React.FC = () => {
  const { patient } = usePatientStore();
  const t = useTranslations();

  if (!patient) return null;
  
  const getCorrectionRuleText = (rule: CorrectionRule, index: number) => {
    const sortedCorrections = [...patient.corrections].sort((a,b) => a.max - b.max);
    if (index === 0) {
      return t.pai_correctionRuleFirst(rule.max);
    }
    const prevMax = sortedCorrections[index - 1].max;
    if (rule.max === Infinity) {
        return `Si > ${prevMax.toFixed(2)} g/L`;
    }
    return t.pai_correctionRuleNext(prevMax, rule.max);
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      <header className="py-4 text-center">
        <h1 className="text-3xl font-display font-bold text-white text-shadow">{t.pai_title(patient.prenom)}</h1>
        <p className="text-white/80">{t.pai_subtitle}</p>
      </header>
      
      <Card>
        <h2 className="text-lg font-semibold text-text-title mb-2">{t.pai_generalInfo}</h2>
        <p><span className="font-semibold">{t.common_name}:</span> {patient.prenom}</p>
        <p><span className="font-semibold">{t.common_birthDate}:</span> {new Date(patient.naissance).toLocaleDateString(t.locale)}</p>
      </Card>
      
      <Card>
        <h2 className="text-lg font-semibold text-text-title mb-2">{t.pai_glycemicTargets}</h2>
        <div className="text-center bg-mint-soft/50 p-3 rounded-lg">
            <p className="text-sm font-semibold text-text-muted">{t.pai_target}</p>
            <p className="text-2xl font-bold text-emerald-main">{patient.cibles.gly_min.toFixed(2)} - {patient.cibles.gly_max.toFixed(2)} g/L</p>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-text-title mb-2">{t.pai_ratios}</h2>
        <p className="text-xs text-text-muted mb-3 text-center">{t.pai_ratiosSubtitle}</p>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(patient.ratios).map(([moment, ratio]) => (
            <div key={moment} className="bg-input-bg p-2 rounded-md">
              <p className="font-semibold text-text-main">{t.mealTimes[moment as MealTime]}</p>
              <p className="text-text-muted">{ratio} g</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-text-title mb-2">{t.pai_correctionSchema}</h2>
        <p className="text-xs text-text-muted mb-3 text-center">{t.pai_correctionSchemaSubtitle}</p>
        <div className="space-y-2">
            {patient.corrections.sort((a,b) => a.max - b.max).map((rule, index) => (
                <div key={index} className="flex justify-between items-center bg-input-bg p-2 rounded-md">
                    <p className="text-text-main">{getCorrectionRuleText(rule, index)}</p>
                    <p className="font-bold text-emerald-main">+{rule.addU} U</p>
                </div>
            ))}
        </div>
        <p className="text-center text-sm font-semibold text-amber-700 mt-4 bg-amber-100 p-2 rounded-md">{t.pai_correctionDelay(patient.correctionDelayHours)}</p>
      </Card>
      
       <Card>
        <h2 className="text-lg font-semibold text-text-title mb-2">{t.pai_notes}</h2>
        <p className="text-text-main whitespace-pre-wrap">{patient.notes_pai || t.pai_noNotes}</p>
      </Card>
    </div>
  );
};

export default Pai;