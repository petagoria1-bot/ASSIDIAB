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
import MorningIcon from '../components/icons/MorningIcon.tsx';
import NoonIcon from '../components/icons/NoonIcon.tsx';
import AfternoonIcon from '../components/icons/AfternoonIcon.tsx';
import NightIcon from '../components/icons/NightIcon.tsx';

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

const AddBetweenButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <div className="relative h-10">
        <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-emerald-main/20 border border-dashed border-emerald-main/30" />
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
            <button
                onClick={onClick}
                className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-emerald-main hover:scale-110 transition-transform"
            >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            </button>
        </div>
    </div>
);

const TimeSlotHeader: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
    <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">{icon}</div>
        <h2 className="font-display font-bold text-xl text-text-title">{title}</h2>
    </div>
);

const Journal: React.FC<{ setCurrentPage: (page: Page) => void }> = ({ setCurrentPage }) => {
  const { mesures, repas, injections } = usePatientStore();
  const { setCalculatorMealTime } = useUiStore();
  const t = useTranslations();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddChoiceModalOpen, setAddChoiceModalOpen] = useState(false);
  const [isAddSnackModalOpen, setAddSnackModalOpen] = useState(false);
  const [isAddMeasureModalOpen, setAddMeasureModalOpen] = useState(false);
  const [modalTimeHints, setModalTimeHints] = useState<{ before: string, after: string } | null>(null);
  
  const timeSlots = useMemo(() => [
    { id: 'morning', title: "Matin", startHour: 5, endHour: 12, icon: <MorningIcon className="w-6 h-6 text-amber-500"/> },
    { id: 'afternoon', title: "Midi", startHour: 12, endHour: 16, icon: <NoonIcon className="w-6 h-6 text-yellow-500"/> },
    { id: 'evening', title: "Après-midi & Soir", startHour: 16, endHour: 24, icon: <AfternoonIcon className="w-6 h-6 text-orange-500"/> },
  ], []);

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
  
  const handleOpenAddChoice = (beforeTs: string, afterTs: string) => {
    setModalTimeHints({ before: beforeTs, after: afterTs });
    setAddChoiceModalOpen(true);
  };
  
  const closeAllModals = () => {
    setAddChoiceModalOpen(false);
    setAddSnackModalOpen(false);
    setAddMeasureModalOpen(false);
    setModalTimeHints(null);
  };

  return (
    <div className="pb-24 min-h-screen bg-off-white">
      <header className="sticky top-0 bg-emerald-main/90 backdrop-blur-md py-4 z-20 shadow-md">
        <div className="px-4 flex items-center justify-center relative">
          <h1 className="text-3xl font-display font-bold text-white text-shadow text-center">{t.journal_title}</h1>
        </div>
        <div className="px-4 mt-2">
          <DateNavigator currentDate={currentDate} setCurrentDate={setCurrentDate} viewMode="day" />
        </div>
      </header>

      <div className="p-4">
        {timeSlots.map(slot => {
            const slotStart = new Date(currentDate); slotStart.setHours(slot.startHour, 0, 0, 0);
            const slotEnd = new Date(currentDate); slotEnd.setHours(slot.endHour, 0, 0, -1);
            const slotEvents = timelineItems.filter(e => {
                const eventDate = new Date(e.ts);
                return eventDate >= slotStart && eventDate < slotEnd;
            });

            if (slotEvents.length === 0 && slot.id === 'evening') return null; // Hide empty evening slot unless there are events

            return (
                <div key={slot.id} className="mb-6">
                    <TimeSlotHeader title={slot.title} icon={slot.icon} />
                    <div className="relative">
                        <div className="absolute left-6 -translate-x-1/2 top-0 h-full w-0.5 bg-emerald-main/20 border border-dashed border-emerald-main/30" />
                        
                        <AddBetweenButton onClick={() => handleOpenAddChoice(slotStart.toISOString(), slotEvents[0]?.ts || slotEnd.toISOString())} />
                        
                        {slotEvents.map((event, index) => (
                            <div key={event.id}>
                                <div className="ml-12">
                                    {event.type === 'placeholder' ? (
                                        <PlaceholderCard 
                                            mealTime={event.data.mealTime}
                                            onAdd={() => {
                                                setCalculatorMealTime(event.data.mealTime);
                                                setCurrentPage('glucides');
                                            }}
                                        />
                                    ) : (
                                        <MealGroupCard event={event.data} />
                                    )}
                                </div>
                                <AddBetweenButton onClick={() => handleOpenAddChoice(event.ts, slotEvents[index+1]?.ts || slotEnd.toISOString())} />
                            </div>
                        ))}
                    </div>
                </div>
            );
        })}
         {timelineItems.length === 0 && (
            <div className="text-center p-8 bg-white/50 rounded-card mt-10">
                <p className="font-semibold text-text-muted">{t.journal_emptyDay}</p>
            </div>
          )}
      </div>

      {isAddChoiceModalOpen && modalTimeHints && (
        <AddEventChoiceModal
          onClose={closeAllModals}
          onSelectMeasure={() => { setAddChoiceModalOpen(false); setAddMeasureModalOpen(true); }}
          onSelectSnack={() => { setAddChoiceModalOpen(false); setAddSnackModalOpen(true); }}
        />
      )}
      {isAddSnackModalOpen && modalTimeHints && (
        <AddSnackModal
          onClose={closeAllModals}
          beforeTs={modalTimeHints.before}
          afterTs={modalTimeHints.after}
        />
      )}
      {isAddMeasureModalOpen && modalTimeHints && (
        <QuickAddItemModal
          onClose={closeAllModals}
          onConfirm={(gly, cetone, ts) => {
            usePatientStore.getState().addMesure({ gly, cetone, source: 'doigt' }, ts);
            toast.success(t.toast_measureAdded(gly));
            closeAllModals();
          }}
          initialTs={new Date((new Date(modalTimeHints.before).getTime() + new Date(modalTimeHints.after).getTime()) / 2).toISOString()}
        />
      )}
    </div>
  );
};

export default Journal;