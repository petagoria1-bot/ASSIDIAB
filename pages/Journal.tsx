import React, { useState, useMemo } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import { useUiStore } from '../store/uiStore.ts';
import { Mesure, Repas, Injection, Page, MealTime } from '../types.ts';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';
import toast from 'react-hot-toast';

import DateNavigator from '../components/DateNavigator.tsx';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import MealGroupCard from '../components/MealGroupCard.tsx';
import PlaceholderCard from '../components/PlaceholderCard.tsx';
import AddEventChoiceModal from '../components/AddEventChoiceModal.tsx';
import AddSnackModal from '../components/AddSnackModal.tsx';
import QuickAddItemModal from '../components/QuickAddItemModal.tsx';
import PlusIcon from '../components/icons/PlusIcon.tsx';

type JournalEvent = { 
    type: 'mealgroup' | 'mesure' | 'injection' | 'snack' | 'placeholder';
    ts: string;
    id: string;
    data: any;
};

const MEAL_SLOTS_CONFIG: { mealTime: MealTime, hour: number }[] = [
    { mealTime: 'petit_dej', hour: 8 },
    { mealTime: 'dejeuner', hour: 12 },
    { mealTime: 'gouter', hour: 16 },
    { mealTime: 'diner', hour: 20 },
];

const Journal: React.FC<{ setCurrentPage: (page: Page) => void }> = ({ setCurrentPage }) => {
  const { mesures, repas, injections } = usePatientStore();
  const { setCalculatorMealTime } = useUiStore();
  const t = useTranslations();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddChoiceModalOpen, setAddChoiceModalOpen] = useState(false);
  const [isAddSnackModalOpen, setAddSnackModalOpen] = useState(false);
  const [isAddMeasureModalOpen, setAddMeasureModalOpen] = useState(false);
  
  const timelineItems: JournalEvent[] = useMemo(() => {
    const dayStart = new Date(currentDate); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate); dayEnd.setHours(23, 59, 59, 999);

    const dayMesures = mesures.filter(e => { const d = new Date(e.ts); return d >= dayStart && d <= dayEnd; });
    const dayRepas = repas.filter(e => { const d = new Date(e.ts); return d >= dayStart && d <= dayEnd; });
    const dayInjections = injections.filter(e => { const d = new Date(e.ts); return d >= dayStart && d <= dayEnd; });

    let processedMesureIds = new Set<string>();
    let processedInjectionIds = new Set<string>();
    
    const mealGroups: JournalEvent[] = dayRepas.map(r => {
      const injection = dayInjections.find(i => i.lien_repas_id === r.id);
      const mesure = injection ? dayMesures.find(m => m.id === injection.lien_mesure_id) : undefined;
      
      if (injection) processedInjectionIds.add(injection.id);
      if (mesure) processedMesureIds.add(mesure.id);
      
      return { type: (r.moment === 'collation') ? 'snack' : 'mealgroup', ts: r.ts, id: r.id, data: { repas: r, injection, mesure } };
    });

    const standaloneInjections: JournalEvent[] = dayInjections.filter(i => !processedInjectionIds.has(i.id)).map(injection => {
      const mesure = dayMesures.find(m => m.id === injection.lien_mesure_id);
      if(mesure) processedMesureIds.add(mesure.id);
      return { type: 'injection', id: injection.id, ts: injection.ts, data: { injection, mesure } };
    });

    const standaloneMesures: JournalEvent[] = dayMesures.filter(m => !processedMesureIds.has(m.id)).map(mesure => ({ type: 'mesure', id: mesure.id, ts: mesure.ts, data: mesure }));
    const loggedEvents: JournalEvent[] = [...mealGroups, ...standaloneInjections, ...standaloneMesures];
    const placeholderEvents: JournalEvent[] = [];

    MEAL_SLOTS_CONFIG.forEach(slot => {
        const mealDate = new Date(currentDate); mealDate.setHours(slot.hour, 0, 0, 0);
        let windowStartHour, windowEndHour;
        switch(slot.mealTime) {
            case 'petit_dej': windowStartHour = 5; windowEndHour = 11; break;
            case 'dejeuner': windowStartHour = 11; windowEndHour = 15; break;
            case 'gouter': windowStartHour = 15; windowEndHour = 18; break;
            case 'diner': windowStartHour = 18; windowEndHour = 23; break;
            default: return;
        }
        
        const hasMealInWindow = dayRepas.some(r => {
            const eventHour = new Date(r.ts).getHours();
            return r.moment === slot.mealTime && eventHour >= windowStartHour && eventHour < windowEndHour;
        });

        if (!hasMealInWindow) {
            placeholderEvents.push({
                type: 'placeholder',
                ts: mealDate.toISOString(),
                id: `placeholder-${slot.mealTime}`,
                data: { mealTime: slot.mealTime }
            });
        }
    });

    return [...loggedEvents, ...placeholderEvents].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
  }, [currentDate, mesures, repas, injections, t]);
  
  const closeAllModals = () => {
    setAddChoiceModalOpen(false);
    setAddSnackModalOpen(false);
    setAddMeasureModalOpen(false);
  };
  
  const getTimestampForNewEvent = () => {
      const now = new Date();
      const today = new Date(currentDate);
      today.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      return today.toISOString();
  };

  return (
    <div className="pb-24 min-h-screen bg-history-gradient">
      <header className="sticky top-0 bg-jade/90 backdrop-blur-md py-4 z-20 shadow-md">
        <div className="px-4 flex items-center justify-center relative">
          <h1 className="text-3xl font-display font-bold text-white text-shadow text-center">{t.journal_title}</h1>
        </div>
        <div className="px-4 mt-2">
          <DateNavigator currentDate={currentDate} setCurrentDate={setCurrentDate} viewMode="day" />
        </div>
      </header>

      <div className="relative px-2 py-4">
        <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-0.5 bg-turquoise/30" />
        
        {timelineItems.length === 0 && (
            <div className="text-center p-8 bg-white/50 rounded-card mt-10">
                <p className="font-semibold text-text-muted">{t.journal_emptyDay}</p>
            </div>
        )}

        {timelineItems.map((event, index) => {
            const position = index % 2 === 0 ? 'left' : 'right';
            const animationClass = position === 'left' ? 'animate-timeline-card-left' : 'animate-timeline-card-right';
            return (
                 <div key={event.id} className="relative flex items-center my-2">
                    <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-turquoise rounded-full z-10 animate-timeline-point-pop" style={{animationDelay: `${index * 100}ms`}} />
                    
                    {position === 'left' ? (
                        <>
                            <div className={`w-[calc(50%-1.5rem)] pr-3 ${animationClass}`} style={{animationDelay: `${index * 100}ms`}}>
                                {event.type === 'placeholder' ? (
                                    <PlaceholderCard mealTime={event.data.mealTime} onAdd={() => { setCalculatorMealTime(event.data.mealTime); setCurrentPage('glucides'); }} />
                                ) : (
                                    <MealGroupCard event={event.data} />
                                )}
                            </div>
                            <div className="w-[calc(50%+1.5rem)]" />
                        </>
                    ) : (
                        <>
                            <div className="w-[calc(50%+1.5rem)]" />
                            <div className={`w-[calc(50%-1.5rem)] pl-3 ${animationClass}`} style={{animationDelay: `${index * 100}ms`}}>
                                {event.type === 'placeholder' ? (
                                    <PlaceholderCard mealTime={event.data.mealTime} onAdd={() => { setCalculatorMealTime(event.data.mealTime); setCurrentPage('glucides'); }} />
                                ) : (
                                    <MealGroupCard event={event.data} />
                                )}
                            </div>
                        </>
                    )}
                 </div>
            );
        })}
      </div>

      <button
        onClick={() => setAddChoiceModalOpen(true)}
        className="fixed bottom-24 right-5 bg-jade text-white rounded-full p-2 shadow-xl z-30 transform hover:scale-110 transition-transform duration-200"
        aria-label="Ajouter un événement"
      >
        <PlusIcon className="w-12 h-12" />
      </button>

      {isAddChoiceModalOpen && (
        <AddEventChoiceModal
          onClose={closeAllModals}
          onSelectMeasure={() => { setAddChoiceModalOpen(false); setAddMeasureModalOpen(true); }}
          onSelectSnack={() => { setAddChoiceModalOpen(false); setAddSnackModalOpen(true); }}
        />
      )}
      {isAddSnackModalOpen && (
        <AddSnackModal
          onClose={closeAllModals}
          beforeTs={getTimestampForNewEvent()}
          afterTs={getTimestampForNewEvent()}
        />
      )}
      {isAddMeasureModalOpen && (
        <QuickAddItemModal
          onClose={closeAllModals}
          onConfirm={(gly, cetone, ts) => {
            usePatientStore.getState().addMesure({ gly, cetone, source: 'doigt' }, ts);
            toast.success(t.toast_measureAdded(gly));
            closeAllModals();
          }}
          initialTs={getTimestampForNewEvent()}
        />
      )}
    </div>
  );
};

export default Journal;