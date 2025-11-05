import React, { useState } from 'react';
import { Repas, Injection, Mesure, MealTime } from '../types';
import useTranslations from '../hooks/useTranslations';
import GlucoseDropIcon from './icons/GlucoseDropIcon';
import SyringeIcon from './icons/SyringeIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import BreakfastIcon from './icons/BreakfastIcon';
import LunchIcon from './icons/LunchIcon';
import DinnerIcon from './icons/DinnerIcon';
import SnackIcon from './icons/SnackIcon';


interface MealGroupCardProps {
  event: {
    repas: Repas;
    injection?: Injection;
    mesure?: Mesure;
  };
}

const MealGroupCard: React.FC<MealGroupCardProps> = ({ event }) => {
    const { repas, injection, mesure } = event;
    const t = useTranslations();
    const [isExpanded, setIsExpanded] = useState(false);
    const time = new Date(repas.ts).toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' });

    const isSnack = repas.moment === 'collation' || repas.moment === 'gouter';
    const borderColorClass = isSnack ? 'border-honey-yellow' : 'border-coral';
    
    const getIconForMeal = (moment: MealTime) => {
        const commonClasses = "w-6 h-6";
        switch (moment) {
            case 'petit_dej': return <BreakfastIcon className={`${commonClasses} text-honey-yellow`} />;
            case 'dejeuner': return <LunchIcon className={`${commonClasses} text-coral`} />;
            case 'diner': return <DinnerIcon className={`${commonClasses} text-slate-400`} />;
            case 'gouter':
            case 'collation':
            default:
                return <SnackIcon className={`${commonClasses} text-warning`} />;
        }
    };

    const hasMeaningfulItems = repas.items && repas.items.length > 0 && 
                                !(repas.items.length === 1 && (repas.items[0].nom === t.mealTimes.collation || repas.items[0].nom === t.mealTimes.gouter));

    const hasDetails = hasMeaningfulItems || repas.note;

    return (
        <div className={`relative bg-white p-3 rounded-lg shadow-sm border ${borderColorClass} shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)] animate-fade-in-lift`}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    {getIconForMeal(repas.moment)}
                    <div>
                        <p className="text-md font-bold text-text-title">{t.mealTimes[repas.moment]}</p>
                        <p className={`text-lg font-bold ${isSnack ? 'text-warning' : 'text-coral'} leading-tight`}>{`${Math.round(repas.total_carbs_g)}${t.history_carbs_unit} de glucides`}</p>
                    </div>
                </div>
                <p className="text-xs text-text-muted font-mono">{time}</p>
            </div>

            {(mesure || injection) && (
                <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-200/80">
                    {mesure && (
                        <div className="flex items-center justify-between bg-slate-50/70 p-2 rounded-md">
                            <div className="flex items-center gap-2">
                                <GlucoseDropIcon className="w-5 h-5 text-emerald-main" />
                                <span className="font-semibold text-sm text-text-main">{t.history_glucose_title}</span>
                            </div>
                            <span className="font-bold text-sm text-text-title">{mesure.gly.toFixed(2)} g/L</span>
                        </div>
                    )}
                    {injection && (
                        <div className="flex items-center justify-between bg-slate-50/70 p-2 rounded-md">
                            <div className="flex items-center gap-2">
                                <SyringeIcon className="w-5 h-5 text-jade-deep" />
                                <span className="font-semibold text-sm text-text-main">{injection.type === 'correction' ? t.common_correction : t.history_bolus_title}</span>
                            </div>
                            <span className="font-bold text-sm text-text-title">{injection.dose_U} {t.history_insulin_unit}</span>
                        </div>
                    )}
                </div>
            )}


            {hasDetails && (
                <div className="mt-2">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-1 text-xs font-semibold text-emerald-main hover:underline">
                        <span>{isExpanded ? t.journal_hideDetails : t.journal_showDetails}</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                         <div className="text-xs text-text-muted space-y-1 pt-2 border-t border-slate-200/80">
                            {repas.note && <p className="italic mb-2">Note: "{repas.note}"</p>}
                            {hasMeaningfulItems && (
                                <ul className="space-y-1">
                                    {repas.items.map((item, index) => (
                                        <li key={index} className="flex justify-between">
                                            <span>- {item.nom} {item.poids_g && <span className="text-slate-400">({item.poids_g}g)</span>}</span>
                                            <span className="font-medium">{Math.round(item.carbs_g)}g</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MealGroupCard;