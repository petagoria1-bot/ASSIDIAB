import React from 'react';
import { MealTime } from '../types.ts';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';
import PlusIcon from './icons/PlusIcon.tsx';

interface TimeSlotEvent {
    mealTime: MealTime;
    time: string;
    title: string;
    icon: React.ReactNode;
}

interface TimeSlotCardProps {
  event: TimeSlotEvent;
  children: React.ReactNode;
  onAdd: () => void;
}

const TimeSlotCard: React.FC<TimeSlotCardProps> = ({ event, children, onAdd }) => {
    const t = useTranslations();
    const hasContent = React.Children.count(children) > 0;

    const addActionLabels = {
        petit_dej: t.journal_addBreakfast,
        dejeuner: t.journal_addLunch,
        gouter: t.journal_addSnackTime,
        diner: t.journal_addDinner,
        collation: t.journal_addSnack,
    };

    return (
        <div className="relative flex items-start gap-4 my-3">
            <div className="z-10 absolute top-2 left-6 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-md">
                {event.icon}
            </div>
            <div className="pl-12 w-full">
                <div className="bg-white rounded-lg p-3 border border-slate-200/80">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg text-text-title">{event.title}</h3>
                        <span className="font-mono text-sm text-text-muted">{event.time}</span>
                    </div>
                    {hasContent ? (
                        <div className="space-y-2">{children}</div>
                    ) : (
                        <button 
                            onClick={onAdd}
                            className="w-full text-center py-3 bg-emerald-main/10 text-emerald-main font-semibold rounded-lg border-2 border-dashed border-emerald-main/30 hover:bg-emerald-main/20 transition-colors"
                        >
                            {addActionLabels[event.mealTime]}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimeSlotCard;
