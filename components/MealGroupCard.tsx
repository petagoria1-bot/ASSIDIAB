import React from 'react';
import { Mesure, Repas, Injection } from '../types.ts';
import useTranslations from '../hooks/useTranslations.ts';
import GlucoseDropIcon from './icons/GlucoseDropIcon.tsx';
import BowlIcon from './icons/BowlIcon.tsx';
import SyringeIcon from './icons/SyringeIcon.tsx';

interface MealGroupCardProps {
  event: {
    repas?: Repas;
    injection?: Injection;
    mesure?: Mesure;
  } | Mesure;
}

const MealGroupCard: React.FC<MealGroupCardProps> = ({ event }) => {
    const t = useTranslations();
    
    const isMesureOnly = 'gly' in event && !('repas' in event) && !('injection' in event);
    const data = isMesureOnly ? { mesure: event as Mesure } : event as { repas?: Repas; injection?: Injection; mesure?: Mesure; };
    
    const { repas, injection, mesure } = data;
    const time = new Date(repas?.ts || injection?.ts || mesure!.ts).toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="bg-white rounded-lg p-3 border border-slate-200/80 shadow-sm animate-card-open">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg text-text-title">{repas ? t.mealTimes[repas.moment] : (injection?.type === 'correction' ? t.common_correction : (isMesureOnly ? t.quickAdd_measureTitle : t.history_bolus_title))}</h3>
                <span className="font-mono text-sm text-text-muted">{time}</span>
            </div>
            <div className="space-y-2">
                {mesure && (
                    <div className="flex items-center gap-2 text-sm">
                        <GlucoseDropIcon className="w-5 h-5 text-turquoise-light flex-shrink-0" />
                        <span className="font-semibold">{t.history_glucose_title}:</span>
                        <span className="font-bold text-text-main">{mesure.gly.toFixed(2)} g/L</span>
                    </div>
                )}
                {repas && (
                    <div className="flex items-center gap-2 text-sm">
                        <BowlIcon className="w-5 h-5 text-coral flex-shrink-0" />
                        <span className="font-semibold">{t.common_carbs}:</span>
                        <span className="font-bold text-text-main">{repas.total_carbs_g.toFixed(0)}g</span>
                        {repas.items.length > 0 && <span className="text-text-muted text-xs">({repas.items.map(i => i.nom).join(', ')})</span>}
                    </div>
                )}
                {injection && (
                    <div className="flex items-center gap-2 text-sm">
                        <SyringeIcon className="w-5 h-5 text-jade-deep flex-shrink-0" />
                        <span className="font-semibold">{t.history_bolus_title}:</span>
                        <span className="font-bold text-text-main">{injection.dose_U} U</span>
                        {injection.calc_details && <span className="text-text-muted text-xs">({injection.calc_details})</span>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MealGroupCard;
