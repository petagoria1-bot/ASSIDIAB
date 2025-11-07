import React from 'react';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';
import GlucoseDropIcon from './icons/GlucoseDropIcon.tsx';
import BowlIcon from './icons/BowlIcon.tsx';
import SyringeIcon from './icons/SyringeIcon.tsx';
import WalkIcon from './icons/WalkIcon.tsx';
import NoteIcon from './icons/NoteIcon.tsx';
import ArrowUpIcon from './icons/ArrowUpIcon.tsx';
import ArrowDownIcon from './icons/ArrowDownIcon.tsx';
import ArrowStableIcon from './icons/ArrowStableIcon.tsx';

type EventType = 'mesure' | 'repas' | 'injection' | 'activity' | 'note';

interface TimelineEventCardProps {
  event: any;
  position: 'left' | 'right';
}

const getIcon = (type: EventType) => {
    const commonClasses = "w-6 h-6";
    switch(type) {
        case 'mesure': return <GlucoseDropIcon className={`${commonClasses} text-turquoise-light`} />;
        case 'repas': return <BowlIcon className={`${commonClasses} text-coral`} />;
        case 'injection': return <SyringeIcon className={`${commonClasses} text-jade-deep`} />;
        case 'activity': return <WalkIcon className={`${commonClasses} text-mint-soft bg-jade p-0.5 rounded-full`} />;
        case 'note': return <NoteIcon className={`${commonClasses} text-honey-yellow`} />;
        default: return null;
    }
};

const CardContent: React.FC<{ event: any }> = ({ event }) => {
    const t = useTranslations();
    const time = new Date(event.ts).toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' });

    let title, value, details;

    switch(event.eventType) {
        case 'mesure':
            title = t.history_glucose_title;
            value = `${event.gly.toFixed(2)} g/L`;
            // Mock trend for demo
            const trend = event.gly > 1.8 ? 'up' : event.gly < 0.8 ? 'down' : 'stable';
            details = (
                <div className="flex items-center gap-1 text-sm text-text-muted">
                    {trend === 'up' && <ArrowUpIcon className="w-4 h-4 text-danger" />}
                    {trend === 'down' && <ArrowDownIcon className="w-4 h-4 text-warning" />}
                    {trend === 'stable' && <ArrowStableIcon className="w-4 h-4 text-gray-400" />}
                </div>
            );
            break;
        case 'repas':
            title = t.mealTimes[event.moment] || t.history_meal_title;
            value = `${Math.round(event.total_carbs_g)}${t.history_carbs_unit}`;
            break;
        case 'injection':
            title = event.type === 'correction' ? t.common_correction : t.history_bolus_title;
            value = `${event.dose_U} ${t.history_insulin_unit}`;
            break;
        case 'activity':
            title = t.history_activity_title;
            value = `${event.details.duration} ${t.history_activity_unit}`;
            details = <p className="text-xs text-text-muted">{event.details.type}</p>;
            break;
        case 'note':
            title = t.history_note_title;
            value = `"${event.details.text}"`;
            break;
    }

    return (
        <div className="flex-1 text-left">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-semibold text-text-muted">{title}</p>
                    <p className="text-lg font-bold text-text-main leading-tight">{value}</p>
                    {details && <div className="mt-1">{details}</div>}
                </div>
                <p className="text-xs text-text-muted">{time}</p>
            </div>
        </div>
    );
};

const TimelineEventCard: React.FC<TimelineEventCardProps> = ({ event, position }) => {
  const containerClasses = `relative w-[calc(50%-2rem)] ${position === 'left' ? 'mr-auto' : 'ml-auto'}`;
  const cardClasses = "timeline-card relative w-full bg-white p-3 rounded-card shadow-timeline-card transition-transform duration-300 ease-fast flex items-center gap-3";
  
  // Pseudo-element for the tail/arrow
  const tailClasses = `absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white transform rotate-45 ${
    position === 'left' ? 'right-[-6px]' : 'left-[-6px]'
  }`;

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-input-bg rounded-full">
            {getIcon(event.eventType)}
        </div>
        <CardContent event={event} />
      </div>
       <div className={tailClasses} />
    </div>
  );
};

export default TimelineEventCard;