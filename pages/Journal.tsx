import React, { useMemo, useState } from 'react';
import { usePatientStore } from '../store/patientStore';
import { useUiStore } from '../store/uiStore';
import { Mesure, Repas, Injection, Page, MealTime } from '../types';
import useTranslations from '../hooks/useTranslations';
import toast from 'react-hot-toast';
import GlucoseDropIcon from '../components/icons/GlucoseDropIcon';
import MealIcon from '../components/icons/MealIcon';
import SyringeIcon from '../components/icons/SyringeIcon';
import WalkIcon from '../components/icons/WalkIcon';
import NoteIcon from '../components/icons/NoteIcon';
import DateNavigator from '../components/DateNavigator';
import ChevronDownIcon from '../components/icons/ChevronDownIcon';
import CalculatorIcon from '../components/icons/CalculatorIcon';
import QuickAddItemModal from '../components/QuickAddItemModal';

type RoutineTaskType = 'routine-mesure' | 'routine-injection';
interface RoutineTask {
    id: string;
    ts: string;
    eventType: RoutineTaskType;
    mealTime: MealTime;
    label: string;
    actionLabel: string;
}
type JournalEvent = (Mesure | Repas | Injection | RoutineTask | { id: string; ts: string; type: string, details: any }) & { eventType: 'mesure' | 'repas' | 'injection' | 'activity' | 'note' | RoutineTaskType };
type ViewMode = 'day' | 'week' | 'month';

const EventCard: React.FC<{ event: JournalEvent }> = ({ event }) => {
    const t = useTranslations();
    const [isExpanded, setIsExpanded] = useState(false);
    const time = new Date(event.ts).toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' });

    const isMealWithDetails = event.eventType === 'repas' && (event as Repas).items && (event as Repas).items.length > 0;

    const eventConfig = useMemo(() => {
        switch (event.eventType) {
            case 'mesure':
                return {
                    icon: <GlucoseDropIcon className="w-6 h-6 text-emerald-main" />,
                    color: 'border-emerald-main',
                    title: t.history_glucose_title,
                    value: `${(event as Mesure).gly.toFixed(2)} g/L`,
                    details: (event as Mesure).cetone ? `${t.journal_ketone}: ${(event as Mesure).cetone?.toFixed(1)} mmol/L` : null,
                };
            case 'repas':
                return {
                    icon: <MealIcon className="w-6 h-6 text-coral" />,
                    color: 'border-coral',
                    title: t.mealTimes[(event as Repas).moment] || t.history_meal_title,
                    value: `${Math.round((event as Repas).total_carbs_g)}${t.history_carbs_unit} de glucides`,
                    details: (event as Repas).note ? `"${(event as Repas).note}"` : null,
                };
            case 'injection':
                 return {
                    icon: <SyringeIcon className="w-6 h-6 text-jade-deep" />,
                    color: 'border-jade-deep',
                    title: (event as Injection).type === 'correction' ? t.common_correction : t.history_bolus_title,
                    value: `${(event as Injection).dose_U} ${t.history_insulin_unit}`,
                    details: (event as Injection).calc_details,
                };
            case 'activity':
                 return {
                    icon: <WalkIcon className="w-6 h-6 text-info" />,
                    color: 'border-info',
                    title: t.history_activity_title,
                    value: `${event.details.duration} ${t.history_activity_unit}`,
                    details: event.details.type,
                };
            case 'note':
                 return {
                    icon: <NoteIcon className="w-6 h-6 text-honey-yellow" />,
                    color: 'border-honey-yellow',
                    title: t.history_note_title,
                    value: `"${event.details.text}"`,
                    details: null,
                };
            default:
                return null;
        }
    }, [event, t]);

    if (!eventConfig) return null;

    return (
        <div className={`relative bg-white p-3 rounded-lg shadow-sm border-l-4 ${eventConfig.color} animate-fade-in-lift`}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="text-xs font-semibold text-text-muted">{eventConfig.title}</p>
                    <p className="text-md font-bold text-text-main leading-tight">{eventConfig.value}</p>
                    {eventConfig.details && <p className="text-xs text-text-muted italic mt-1">{eventConfig.details}</p>}
                </div>
                <p className="text-xs text-text-muted font-mono">{time}</p>
            </div>

            {isMealWithDetails && (
                <div className="mt-2">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-1 text-xs font-semibold text-emerald-main hover:underline">
                        <span>{isExpanded ? t.journal_hideDetails : t.journal_showDetails}</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                         <ul className="text-xs text-text-muted space-y-1 pt-2 border-t border-slate-200/80">
                            {(event as Repas).items.map((item, index) => (
                                <li key={index} className="flex justify-between">
                                    <span>- {item.nom} <span className="text-slate-400">({item.poids_g}g)</span></span>
                                    <span className="font-medium">{Math.round(item.carbs_g)}g</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

const RoutineTaskCard: React.FC<{ event: RoutineTask, onAction: (task: RoutineTask) => void }> = ({ event, onAction }) => {
    const { eventType, label, actionLabel } = event;
    const icon = eventType === 'routine-mesure' ? <GlucoseDropIcon className="w-6 h-6 text-text-muted" /> : <CalculatorIcon className="w-6 h-6 text-text-muted" />;

    return (
        <div className="relative bg-white/70 backdrop-blur-sm p-3 rounded-lg border-2 border-dashed border-slate-300 animate-fade-in-lift">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {icon}
                    <p className="font-semibold text-text-muted">{label}</p>
                </div>
                <button onClick={() => onAction(event)} className="font-bold bg-white text-emerald-main text-sm py-2 px-4 rounded-button hover:bg-emerald-main/10 transition-colors shadow-sm border border-emerald-main/20">
                    {actionLabel}
                </button>
            </div>
        </div>
    );
};


const Journal: React.FC<{ setCurrentPage: (page: Page) => void }> = ({ setCurrentPage }) => {
  const { mesures, repas, injections, addMesure } = usePatientStore();
  const { setCalculatorMealTime } = useUiStore();
  const t = useTranslations();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMeasureModalOpen, setMeasureModalOpen] = useState(false);

  const { groupedEvents, hasEvents } = useMemo(() => {
    let finalEvents: JournalEvent[] = [
      ...mesures.map(m => ({ ...m, eventType: 'mesure' as const })),
      ...repas.map(r => ({ ...r, eventType: 'repas' as const })),
      ...injections.map(i => ({ ...i, eventType: 'injection' as const })),
    ];

    const isViewingToday = new Date().toDateString() === currentDate.toDateString();

    if (viewMode === 'day' && isViewingToday) {
        const today = new Date(currentDate);
        
        const tasks: Omit<RoutineTask, 'id'>[] = [
            { ts: new Date(today.setHours(8, 0, 0, 0)).toISOString(), eventType: 'routine-mesure', mealTime: 'petit_dej', label: t.journal_task_measureBreakfast, actionLabel: t.journal_task_addMeasure },
            { ts: new Date(today.setHours(8, 5, 0, 0)).toISOString(), eventType: 'routine-injection', mealTime: 'petit_dej', label: t.journal_task_bolusBreakfast, actionLabel: t.journal_task_calculateBolus },
            { ts: new Date(today.setHours(12, 30, 0, 0)).toISOString(), eventType: 'routine-mesure', mealTime: 'dejeuner', label: t.journal_task_measureLunch, actionLabel: t.journal_task_addMeasure },
            { ts: new Date(today.setHours(12, 35, 0, 0)).toISOString(), eventType: 'routine-injection', mealTime: 'dejeuner', label: t.journal_task_bolusLunch, actionLabel: t.journal_task_calculateBolus },
            { ts: new Date(today.setHours(19, 0, 0, 0)).toISOString(), eventType: 'routine-mesure', mealTime: 'diner', label: t.journal_task_measureDinner, actionLabel: t.journal_task_addMeasure },
            { ts: new Date(today.setHours(19, 5, 0, 0)).toISOString(), eventType: 'routine-injection', mealTime: 'diner', label: t.journal_task_bolusDinner, actionLabel: t.journal_task_calculateBolus },
        ];
        
        const timeWindows = {
            petit_dej: { start: 6, end: 11 },
            dejeuner: { start: 11, end: 16 },
            diner: { start: 17, end: 22 },
        };

        const pendingTasks = tasks.filter(task => {
            const window = timeWindows[task.mealTime];
            const isTaskCompleted = finalEvents.some(event => {
                const eventHour = new Date(event.ts).getHours();
                if (eventHour < window.start || eventHour >= window.end) return false;

                if (task.eventType === 'routine-mesure' && event.eventType === 'mesure') return true;
                // Fix: Add type assertion to access 'moment' property on Repas type.
                // The compiler cannot automatically narrow the type of 'event' within the complex union.
                if (task.eventType === 'routine-injection' && (event.eventType === 'injection' || (event.eventType === 'repas' && (event as Repas).moment === task.mealTime))) return true;
                
                return false;
            });
            return !isTaskCompleted;
        });

        finalEvents.push(...pendingTasks.map(task => ({...task, id: task.label })));
    }


    let filteredEvents = finalEvents;
    if (viewMode !== 'day' || !isViewingToday) {
        let startDate: Date, endDate: Date;
        const now = new Date(currentDate);
        now.setHours(0, 0, 0, 0);
        switch (viewMode) {
            case 'day':
                startDate = new Date(now);
                endDate = new Date(now);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'week':
                const firstDayOfWeek = new Date(now);
                const day = firstDayOfWeek.getDay();
                const diff = firstDayOfWeek.getDate() - day + (day === 0 ? -6 : 1);
                firstDayOfWeek.setDate(diff);
                startDate = new Date(firstDayOfWeek);
                endDate = new Date(firstDayOfWeek);
                endDate.setDate(endDate.getDate() + 6);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
        }
        filteredEvents = finalEvents.filter(event => {
            const eventDate = new Date(event.ts);
            return eventDate >= startDate && eventDate <= endDate;
        });
    }

    const isFirstTimeUser = mesures.length === 0 && repas.length === 0 && injections.length === 0;

    if (filteredEvents.length === 0 && isFirstTimeUser && isViewingToday && viewMode === 'day') {
        filteredEvents = [
            { id: 'mock-activity-1', ts: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), type: 'activity', eventType: 'activity' as const, details: { duration: 30, type: t.mock_activity_type_walk }},
            { id: 'mock-note-1', ts: new Date(Date.now() - 10 * 3600 * 1000).toISOString(), type: 'note', eventType: 'note' as const, details: { text: t.mock_note_details }},
        ] as JournalEvent[];
    }
    
    const hasAnyEvents = filteredEvents.length > 0;
    const sortedEvents = filteredEvents.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
    
    const groups: { [key: string]: JournalEvent[] } = {};
    sortedEvents.forEach(event => {
        const date = new Date(event.ts).toDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(event);
    });

    return { 
        groupedEvents: Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()), 
        hasEvents: hasAnyEvents 
    };
  }, [mesures, repas, injections, t, viewMode, currentDate]);
  
  const handleTaskAction = (task: RoutineTask) => {
    if (task.eventType === 'routine-mesure') {
        setMeasureModalOpen(true);
    } else if (task.eventType === 'routine-injection') {
        setCalculatorMealTime(task.mealTime);
        setCurrentPage('glucides');
    }
  };

  const handleAddMeasure = (gly: number, cetone: number | undefined, ts: string) => {
    addMesure({ gly, cetone, source: 'doigt' }, ts);
    toast.success(t.toast_measureAdded(gly));
    setMeasureModalOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return t.history_today;
    if (date.toDateString() === yesterday.toDateString()) return t.history_yesterday;
    
    return date.toLocaleDateString(t.locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="p-4 space-y-4 pb-24 min-h-screen">
      <header className="py-4 text-center">
        <h1 className="text-3xl font-display font-bold text-white text-shadow">{t.journal_title}</h1>
      </header>
      
      <div className="sticky top-0 bg-emerald-main/20 backdrop-blur-md py-2 z-10 -mx-4 px-4 shadow-sm space-y-3">
        <div className="flex justify-center bg-white/40 p-1 rounded-pill shadow-inner">
          {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => { setViewMode(mode); setCurrentDate(new Date()); }}
              className={`flex-1 py-2 rounded-pill text-sm font-semibold transition-all duration-300 ${viewMode === mode ? 'bg-white text-text-title shadow-md' : 'text-white/90'}`}
            >
              {t[`journal_view${mode.charAt(0).toUpperCase() + mode.slice(1)}`]}
            </button>
          ))}
        </div>
        <DateNavigator 
            currentDate={currentDate} 
            setCurrentDate={setCurrentDate} 
            viewMode={viewMode} 
        />
      </div>

      {!hasEvents ? (
        <div className="text-center p-8 bg-white/50 rounded-card mt-10">
            <p className="font-semibold text-text-muted">{t.journal_emptyPeriod}</p>
        </div>
      ) : (
        <div className="relative px-2">
            <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-slate-200/70 rounded-full" />
            {groupedEvents.map(([date, events]) => (
                <div key={date} className="relative mb-6">
                    <h2 className="font-display font-semibold text-white text-shadow pl-12 mb-2">{formatDate(date)}</h2>
                    <div className="space-y-4">
                        {events.map((event) => {
                            const eventConfig = {
                                'mesure': { icon: <GlucoseDropIcon className="w-6 h-6 text-white"/>, bg: 'bg-emerald-main' },
                                'repas': { icon: <MealIcon className="w-6 h-6 text-white"/>, bg: 'bg-coral' },
                                'injection': { icon: <SyringeIcon className="w-6 h-6 text-white"/>, bg: 'bg-jade-deep' },
                                'activity': { icon: <WalkIcon className="w-6 h-6 text-white"/>, bg: 'bg-info' },
                                'note': { icon: <NoteIcon className="w-6 h-6 text-white"/>, bg: 'bg-honey-yellow' },
                                'routine-mesure': { icon: <GlucoseDropIcon className="w-6 h-6 text-white"/>, bg: 'bg-slate-400' },
                                'routine-injection': { icon: <CalculatorIcon className="w-6 h-6 text-white"/>, bg: 'bg-slate-400' },
                            }[event.eventType];
                            
                             if (!eventConfig) return null;

                            const isRoutine = event.eventType.startsWith('routine-');

                            return (
                                <div key={event.id} className="relative flex items-start gap-4">
                                    <div className={`z-10 absolute top-2 left-6 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${eventConfig.bg}`}>
                                        {eventConfig.icon}
                                    </div>
                                    <div className="pl-12 w-full">
                                        {isRoutine ? (
                                            <RoutineTaskCard event={event as RoutineTask} onAction={handleTaskAction} />
                                        ) : (
                                            <EventCard event={event} />
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
      )}
      {isMeasureModalOpen && (
        <QuickAddItemModal onClose={() => setMeasureModalOpen(false)} onConfirm={handleAddMeasure} />
      )}
    </div>
  );
};

export default Journal;