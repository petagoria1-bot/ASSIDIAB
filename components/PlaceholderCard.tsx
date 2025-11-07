import React from 'react';
import useTranslations from '../hooks/useTranslations';
import { MealTime } from '../types';
import BreakfastIcon from './icons/BreakfastIcon';
import LunchIcon from './icons/LunchIcon';
import SnackIcon from './icons/SnackIcon';
import DinnerIcon from './icons/DinnerIcon';

interface PlaceholderCardProps {
  mealTime: MealTime;
  onAdd: () => void;
}

const mealIcons: Record<MealTime, React.ReactNode> = {
    petit_dej: <BreakfastIcon className="w-10 h-10 text-emerald-main/50 opacity-70"/>,
    dejeuner: <LunchIcon className="w-10 h-10 text-emerald-main/50 opacity-70"/>,
    gouter: <SnackIcon className="w-10 h-10 text-emerald-main/50 opacity-70"/>,
    diner: <DinnerIcon className="w-10 h-10 text-emerald-main/50 opacity-70"/>,
    collation: <SnackIcon className="w-10 h-10 text-emerald-main/50 opacity-70"/>,
};

const PlaceholderCard: React.FC<PlaceholderCardProps> = ({ mealTime, onAdd }) => {
  const t = useTranslations();
  
  const addActionLabels: Record<MealTime, string> = {
      petit_dej: t.journal_addBreakfast,
      dejeuner: t.journal_addLunch,
      gouter: t.journal_addSnackTime,
      diner: t.journal_addDinner,
      collation: t.journal_addSnack,
  };

  return (
    <div 
        className="border-2 border-dashed border-emerald-main/40 bg-emerald-main/5 p-4 rounded-lg flex flex-col items-center justify-center text-center transition-colors hover:bg-emerald-main/10"
        onClick={onAdd}
        role="button"
        tabIndex={0}
    >
      {mealIcons[mealTime]}
      <p className="mt-2 text-sm font-semibold text-text-muted">{t.mealTimes[mealTime]}</p>
      <div 
        className="mt-3 text-center py-2 px-4 bg-white text-emerald-main font-semibold rounded-lg border-2 border-dashed border-emerald-main/30 hover:bg-mint-soft/50 transition-colors"
      >
        + {addActionLabels[mealTime]}
      </div>
    </div>
  );
};

export default PlaceholderCard;