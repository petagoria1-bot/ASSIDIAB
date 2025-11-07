import React from 'react';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';
import ArrowLeftIcon from './icons/ArrowLeftIcon.tsx';
import ArrowRightIcon from './icons/ArrowRightIcon.tsx';

type ViewMode = 'day' | 'week' | 'month';

interface DateNavigatorProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  viewMode: ViewMode;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ currentDate, setCurrentDate, viewMode }) => {
  const t = useTranslations();

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    else if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    else if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  const getDisplayString = () => {
    if (viewMode === 'day') {
        if (isToday(currentDate)) return t.history_today;
        return currentDate.toLocaleDateString(t.locale, { weekday: 'long', day: 'numeric', month: 'short' });
    }
    if (viewMode === 'week') {
        const start = new Date(currentDate);
        start.setDate(start.getDate() - start.getDay() + 1);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        if (start <= new Date() && end >= new Date()) return t.journal_thisWeek;
        return `${start.toLocaleDateString(t.locale, { day: 'numeric' })} - ${end.toLocaleDateString(t.locale, { day: 'numeric', month: 'long' })}`;
    }
    if (viewMode === 'month') {
        return currentDate.toLocaleDateString(t.locale, { month: 'long', year: 'numeric' });
    }
    return '';
  };
  
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  threeMonthsAgo.setDate(1);
  threeMonthsAgo.setHours(0,0,0,0);
  
  const isPrevDisabled = currentDate <= threeMonthsAgo;
  const isNextDisabled = isToday(currentDate) && viewMode === 'day';


  return (
    <div className="flex items-center justify-between text-white font-semibold">
      <button onClick={handlePrev} disabled={isPrevDisabled} className="p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
        <ArrowLeftIcon />
      </button>
      <span className="text-lg font-display text-shadow-sm">{getDisplayString()}</span>
      <button onClick={handleNext} disabled={isNextDisabled} className="p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
        <ArrowRightIcon />
      </button>
    </div>
  );
};

export default DateNavigator;
