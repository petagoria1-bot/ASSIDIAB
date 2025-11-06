import React, { useMemo, useState } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import { useUiStore } from '../store/uiStore.ts';
import { Mesure, Repas, Injection, Page, MealTime } from '../types.ts';
import useTranslations from '../hooks/useTranslations.ts';
import toast from 'react-hot-toast';
import GlucoseDropIcon from '../components/icons/GlucoseDropIcon.tsx';
import MealIcon from '../components/icons/MealIcon.tsx';
import SyringeIcon from '../components/icons/SyringeIcon.tsx';
import WalkIcon from '../components/icons/WalkIcon.tsx';
import NoteIcon from '../components/icons/NoteIcon.tsx';
import DateNavigator from '../components/DateNavigator.tsx';
import ChevronDownIcon from '../components/icons/ChevronDownIcon.tsx';
import QuickAddItemModal from '../components/QuickAddItemModal.tsx';
import AddSnackModal from '../components/AddSnackModal.tsx';
import PlusIcon from '../components/icons/PlusIcon.tsx';
import MealGroupCard from '../components/MealGroupCard.tsx';
import TimeSlotCard from '../components/TimeSlotCard.tsx';
import AddEventChoiceModal from '../components/AddEventChoiceModal.tsx';
import BreakfastIcon from '../components/icons/BreakfastIcon.tsx';
import LunchIcon from '../components/icons/LunchIcon.tsx';
import DinnerIcon from '../components/icons/DinnerIcon.tsx';
import SnackIcon from '../components/icons/SnackIcon.tsx';


interface MealGroupEvent {
    id: string;
    ts: string;
    eventType: 'meal_group';
    repas: Repas;
    injection?: Injection;
    mesure?: Mesure;
}

interface TimeSlotEvent {
    id: string;
    ts: string;
    eventType: 'timeslot';
    mealTime: MealTime;
    time: string;
    title: string;
    icon: React.ReactNode;
}


type JournalEvent = (Mesure | Repas | Injection | MealGroupEvent | TimeSlotEvent | { id: string; ts: string; type: string, details: any }) & { eventType: 'mesure' | 'repas' | 'injection' | 'activity' | 'note' | 'meal_group' | 'timeslot' };
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
                    borderColor: 'border-emerald-main',
                    title: t.history_glucose_title,
                    value: `${(event as Mesure).gly.toFixed(2)} g/L`,
                    details: (event as Mesure).cetone ? `${t.journal_ketone}: ${(event as Mesure).cetone?.toFixed(1)} mmol/L` : null,
                };
            case 'repas': {
                const repasEvent = event as Repas;
                const { moment } = repasEvent;
                let icon, borderColor;
                switch (moment) {
                    case 'petit_dej':
                        icon = <BreakfastIcon className="w-6 h-6 text-honey-yellow" />;
                        borderColor = 'border-honey-yellow';
                        break;
                    case 'dejeuner':
                        icon = <LunchIcon className="w-6 h-6 text-coral" />;
                        borderColor = 'border-coral';
                        break;
                    case 'gouter':
                        icon = <SnackIcon className="w-6 h-6 text-warning" />;
                        borderColor = 'border-warning';
                        break;
                    case 'diner':
                        icon = <DinnerIcon className="w-6 h-6 text-icon-inactive" />;
                        borderColor = 'border-slate-400';
                        break;
                    case 'collation':
                        icon = <SnackIcon className="w-6 h-6 text-warning" />;
                        borderColor = 'border-warning';
                        break;
                    default:
                        icon = <MealIcon className="w-6 h-6 text-coral" />;
                        borderColor = 'border-coral';
                }
                return {
                    icon,
                    borderColor,
                    title: t.mealTimes[moment] || t.history_meal_title,
                    value: `${Math.round(repasEvent.total_carbs_g)}${t.history_carbs_unit} de glucides`,
                    details: repasEvent.note ? `"${repasEvent.note}"` : null,
                };
            }
            case 'injection':
                 return {
                    icon: <SyringeIcon className="w-6 h-6 text-jade-deep" />,
                    borderColor: 'border-jade-deep',
                    title: (event as Injection).type === 'correction' ? t.common_correction : t.history_bolus_title,
                    value: `${(event as Injection).dose_U} ${t.history_insulin_unit}`,
                    details: (event as Injection).calc_details,
                };
            case 'activity':
                 return {
                    icon: <WalkIcon className="w-6 h-6 text-info" />,
                    borderColor: 'border-info',
                    title: t.history_activity_title,
                    value: `${event.details.duration} ${t.history_activity_unit}`,
                    details: event.details.type,
                };
            case 'note':
                 return {
                    icon: <NoteIcon className="w-6 h-6 text-honey-yellow" />,
                    borderColor: 'border-honey-yellow',
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
        <div className={`relative bg-white p-3 rounded-lg shadow-sm border ${eventConfig.borderColor} shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)] animate-fade-in-lift`}>
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


const Journal: React.FC<{ setCurrentPage: (page: Page) => void }> = ({ setCurrentPage }) => {
  const { mesures, repas, injections, addMesure } = usePatientStore();
  const { setCalculatorMealTime } = useUiStore();
  const t = useTranslations();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [choiceModalState, setChoiceModalState] = useState<{ open: boolean; beforeTs: string; afterTs: string; } | null>(null);
  const [snackModalState, setSnackModalState] = useState<{ beforeTs: string; afterTs: string; } | null>(null);
  const [measureModalState, setMeasureModalState] = useState<{ open: boolean; ts: string; } | null>(null);

  const { timelineEvents, hasEvents } = useMemo(() => {
    const eventsForPeriod = [...mesures, ...repas, ...injections].filter(e => {
        const eventDate = new Date(e.ts);
        if (viewMode === 'day') {
            const dayStart = new Date(currentDate); dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(currentDate); dayEnd.setHours(23, 59, 59, 999);
            return eventDate >= dayStart && eventDate <= dayEnd;
        }
        if (viewMode === 'week') {
            const startOfWeek = new Date(currentDate); startOfWeek.setHours(0,0,0,0);
            startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1));
            const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(endOfWeek.getDate() + 6); endOfWeek.setHours(23, 59, 59, 999);
            return eventDate >= startOfWeek && eventDate <= endOfWeek;
        }
        if (viewMode === 'month') {
            return eventDate.getFullYear() === currentDate.getFullYear() && eventDate.getMonth() === currentDate.getMonth();
        }
        return false;
    });

    if (viewMode !== 'day' || eventsForPeriod.length === 0) {
        const allEvents = eventsForPeriod
            .map(e => ({ ...e, eventType: 'gly' in e ? 'mesure' : 'total_carbs_g' in e ? 'repas' : 'injection' } as JournalEvent))
            .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
        return { timelineEvents: allEvents, hasEvents: eventsForPeriod.length > 0 };
    }
    
    // Day View Logic with Grouping
    const dayToDisplay = new Date(currentDate);
    const getTimeSlotDate = (hours: number): Date => {
        const slotDate = new Date(dayToDisplay); slotDate.setHours(hours, 0, 0, 0); return slotDate;
    };

    const timeSlots: TimeSlotEvent[] = [
        { id: 'slot-petit_dej', ts: getTimeSlotDate(8).toISOString(), eventType: 'timeslot', mealTime: 'petit_dej', time: '08:00', title: t.mealTimes.petit_dej, icon: <BreakfastIcon className="w-8 h-8 text-honey-yellow" /> },
        { id: 'slot-dejeuner', ts: getTimeSlotDate(12).toISOString(), eventType: 'timeslot', mealTime: 'dejeuner', time: '12:00', title: t.mealTimes.dejeuner, icon: <LunchIcon className="w-8 h-8 text-warning" /> },
        { id: 'slot-gouter', ts: getTimeSlotDate(16).toISOString(), eventType: 'timeslot', mealTime: 'gouter', time: '16:00', title: t.mealTimes.gouter, icon: <SnackIcon className="w-8 h-8 text-coral" /> },
        { id: 'slot-diner', ts: getTimeSlotDate(20).toISOString(), eventType: 'timeslot', mealTime: 'diner', time: '20:00', title: t.mealTimes.diner, icon: <DinnerIcon className="w-8 h-8 text-icon-inactive" /> },
    ];
    
    const mesuresMap = new Map(eventsForPeriod.filter((e): e is Mesure => 'gly' in e).map(m => [m.id, m]));
    const repasMap = new Map(eventsForPeriod.filter((e): e is Repas => 'total_carbs_g' in e).map(r => [r.id, r]));
    const injectionsMap = new Map(eventsForPeriod.filter((e): e is Injection => 'dose_U' in e).map(i => [i.id, i]));
    const linkedIds = new Set<string>();
    const allMealGroups: MealGroupEvent[] = [];

    // 1. Group full boluses (injection-driven)
    for (const injection of injectionsMap.values()) {
        if (injection.lien_repas_id && repasMap.has(injection.lien_repas_id)) {
            const currentRepas = repasMap.get(injection.lien_repas_id)!;
            const currentMesure = injection.lien_mesure_id ? mesuresMap.get(injection.lien_mesure_id) : undefined;
            if (linkedIds.has(injection.id)) continue;

            allMealGroups.push({ id: currentRepas.id, ts: currentRepas.ts, eventType: 'meal_group', repas: currentRepas, injection, mesure: currentMesure });
            linkedIds.add(injection.id);
            linkedIds.add(currentRepas.id);
            if (currentMesure) linkedIds.add(currentMesure.id);
        }
    }

    // 2. Group meals/snacks with nearby measurements
    const remainingRepas = Array.from(repasMap.values()).filter(r => !linkedIds.has(r.id));
    const unlinkedMesures = Array.from(mesuresMap.values()).filter(m => !linkedIds.has(m.id));

    for (const currentRepas of remainingRepas) {
        const repasTime = new Date(currentRepas.ts).getTime();
        const TIME_WINDOW_MS = 60 * 60 * 1000; // 60 minutes window

        let closestMesure: Mesure | undefined = undefined;
        let minDiff = TIME_WINDOW_MS;

        for (const currentMesure of unlinkedMesures) {
            if (linkedIds.has(currentMesure.id)) continue;
            const mesureTime = new Date(currentMesure.ts).getTime();
            const diff = Math.abs(repasTime - mesureTime);

            if (diff <= minDiff) {
                minDiff = diff;
                closestMesure = currentMesure;
            }
        }
        
        if (closestMesure) {
            allMealGroups.push({ id: currentRepas.id, ts: currentRepas.ts, eventType: 'meal_group', repas: currentRepas, mesure: closestMesure, injection: undefined as any });
            linkedIds.add(currentRepas.id);
            linkedIds.add(closestMesure.id);
        }
    }

    // 3. Distribute groups into timeslots or as standalone
    const mealGroupsByMealTime = new Map<MealTime, MealGroupEvent[]>();
    const standaloneGroups: MealGroupEvent[] = [];
    allMealGroups.forEach(group => {
        const moment = group.repas.moment;
        if (moment === 'collation' || moment === 'gouter') {
            standaloneGroups.push(group);
        } else {
            if (!mealGroupsByMealTime.has(moment)) mealGroupsByMealTime.set(moment, []);
            mealGroupsByMealTime.get(moment)!.push(group);
        }
    });

    const slotsWithContent = timeSlots.map(slot => ({ ...slot, content: mealGroupsByMealTime.get(slot.mealTime) || [] }));

    const otherEvents = eventsForPeriod
        .filter(e => !linkedIds.has(e.id))
        .map(e => ({ ...e, eventType: 'gly' in e ? 'mesure' as const : 'total_carbs_g' in e ? 'repas' as const : 'injection' as const } as JournalEvent));

    const finalEvents = [...slotsWithContent, ...standaloneGroups, ...otherEvents]
        .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

    return { timelineEvents: finalEvents, hasEvents: finalEvents.length > 0 };
}, [mesures, repas, injections, t, viewMode, currentDate]);

  const handleAddAction = (mealTime: MealTime) => {
    setCalculatorMealTime(mealTime);
    setCurrentPage('glucides');
  };

  const handleOpenChoiceModal = (beforeTs: string, afterTs: string) => {
    setChoiceModalState({ open: true, beforeTs, afterTs });
  };

  const handleSelectMeasure = () => {
    if (!choiceModalState) return;
    const beforeTime = new Date(choiceModalState.beforeTs).getTime();
    const afterTime = new Date(choiceModalState.afterTs).getTime();
    const middleTime = new Date((beforeTime + afterTime) / 2).toISOString();
    setMeasureModalState({ open: true, ts: middleTime });
    setChoiceModalState(null);
  };

  const handleSelectSnack = () => {
    if (!choiceModalState) return;
    setSnackModalState({ beforeTs: choiceModalState.beforeTs, afterTs: choiceModalState.afterTs });
    setChoiceModalState(null);
  };
  
  const handleAddMeasure = (gly: number, cetone: number | undefined, ts: string) => {
    addMesure({ gly, cetone, source: 'doigt' }, ts);
    toast.success(t.toast_measureAdded(gly));
    setMeasureModalState(null);
  };

  return (
    <div className="p-4 space-y-4 pb-24">
        <header className="sticky top-0 bg-emerald-main/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 shadow-sm space-y-4">
          <h1 className="text-3xl font-display font-bold text-white text-shadow text-center">{t.journal_title}</h1>
          
          <div className="flex justify-center bg-black/10 p-1 rounded-pill shadow-inner">
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
        </header>

        {!hasEvents ? (
          <div className="text-center p-8 bg-white rounded-card mt-10">
              <p className="font-semibold text-text-muted">{viewMode === 'day' ? t.journal_emptyDay : t.journal_emptyPeriod}</p>
          </div>
        ) : (
          <div className="relative px-2">
              {viewMode === 'day' && <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-emerald-main/30 rounded-full" />}
              <div className={viewMode === 'day' ? "space-y-0" : "space-y-3"}>
                  {timelineEvents.map((event, index) => {
                      if (event.eventType === 'timeslot') {
                          const slot = event as TimeSlotEvent & { content: MealGroupEvent[] };
                          return (
                              <div key={slot.id}>
                                  <TimeSlotCard event={slot} onAdd={() => handleAddAction(slot.mealTime)}>
                                      {slot.content.map(group => <MealGroupCard key={group.id} event={group} />)}
                                  </TimeSlotCard>
                                  {index < timelineEvents.length - 1 && (
                                      <div key={`add-${event.id}`} className="relative h-12 flex items-center justify-center my-2">
                                          <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-emerald-main/30" />
                                          <button 
                                              onClick={() => handleOpenChoiceModal(event.ts, timelineEvents[index + 1].ts)}
                                              className="z-10 transition-all duration-300 ease-fast transform hover:scale-110 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-main rounded-full"
                                              aria-label={t.journal_addSnack}
                                          >
                                              <PlusIcon className="w-10 h-10" />
                                          </button>
                                      </div>
                                  )}
                              </div>
                          );
                      }
                      
                      if (event.eventType === 'meal_group') {
                          const group = event as MealGroupEvent;
                          return (
                              <div key={group.id} className={viewMode === 'day' ? "relative flex items-start gap-4 my-6" : ""}>
                                  {viewMode === 'day' && <div className="absolute top-1/2 -translate-y-1/2 left-6 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-slate-300" />}
                                  <div className={viewMode === 'day' ? "pl-12 w-full" : "w-full"}>
                                    <MealGroupCard event={group} />
                                  </div>
                              </div>
                          );
                      }

                      if (event.eventType === 'repas' || event.eventType === 'mesure' || event.eventType === 'injection') {
                          const isSnack = event.eventType === 'repas' && ((event as Repas).moment === 'collation' || (event as Repas).moment === 'gouter');
                          
                          if (isSnack) {
                              const snackEvent = { repas: event as Repas };
                              return (
                                  <div key={event.id} className={viewMode === 'day' ? "relative flex items-start gap-4 my-6" : ""}>
                                      {viewMode === 'day' && <div className="absolute top-1/2 -translate-y-1/2 left-6 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-slate-300" />}
                                      <div className={viewMode === 'day' ? "pl-12 w-full" : "w-full"}>
                                        <MealGroupCard event={snackEvent} />
                                      </div>
                                  </div>
                              );
                          }
                  
                          return (
                              <div key={event.id} className={viewMode === 'day' ? "relative flex items-start gap-4 my-6" : ""}>
                                  {viewMode === 'day' && <div className="absolute top-1/2 -translate-y-1/2 left-6 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-slate-300" />}
                                  <div className={viewMode === 'day' ? "pl-12 w-full" : "w-full"}>
                                    <EventCard event={event} />
                                  </div>
                              </div>
                          );
                      }

                      return null;
                  })}
              </div>
          </div>
        )}

      {choiceModalState?.open && (
        <AddEventChoiceModal 
            onClose={() => setChoiceModalState(null)}
            onSelectMeasure={handleSelectMeasure}
            onSelectSnack={handleSelectSnack}
        />
      )}
      {snackModalState && (
        <AddSnackModal 
            onClose={() => setSnackModalState(null)}
            beforeTs={snackModalState.beforeTs}
            afterTs={snackModalState.afterTs}
        />
      )}
      {measureModalState?.open && (
        <QuickAddItemModal 
          onClose={() => setMeasureModalState(null)}
          onConfirm={handleAddMeasure}
          initialTs={measureModalState.ts}
        />
      )}
    </div>
  );
};

export default Journal;