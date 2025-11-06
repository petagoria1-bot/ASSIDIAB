import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePatientStore } from '../store/patientStore.ts';
import { useUiStore } from '../store/uiStore.ts';
import { Mesure, Repas, Injection, Page, MealTime } from '../types.ts';
import useTranslations from '../hooks/useTranslations.ts';
import toast from 'react-hot-toast';

import QuickAddItemModal from '../components/QuickAddItemModal.tsx';
import DateNavigator from '../components/DateNavigator.tsx';
import MealGroupCard from '../components/MealGroupCard.tsx';
import TimeSlotCard from '../components/TimeSlotCard.tsx';
import PlusIcon from '../components/icons/PlusIcon.tsx';
import AddEventChoiceModal from '../components/AddEventChoiceModal.tsx';
import AddSnackModal from '../components/AddSnackModal.tsx';
import HistoryIcon from '../components/icons/HistoryIcon.tsx';

// Combined type for all possible events in the journal
type JournalEvent = 
    | { type: 'mealgroup'; ts: string; data: { repas: Repas; injection?: Injection; mesure?: Mesure } }
    | { type: 'mesure'; ts: string; data: Mesure }
    | { type: 'injection'; ts: string; data: { injection: Injection; mesure?: Mesure } };


const Journal: React.FC<{ setCurrentPage: (page: Page) => void }> = ({ setCurrentPage }) => {
  const { mesures, repas, injections } = usePatientStore();
  const { setCalculatorMealTime } = useUiStore();
  const t = useTranslations();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddChoiceModalOpen, setAddChoiceModalOpen] = useState(false);
  const [isAddSnackModalOpen, setAddSnackModalOpen] = useState(false);
  const [isAddMeasureModalOpen, setAddMeasureModalOpen] = useState(false);
  const [modalTimeHints, setModalTimeHints] = useState<{before: string, after: string} | null>(null);

  const groupedEventsByDay = useMemo(() => {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const dayMesures = mesures.filter(e => { const d = new Date(e.ts); return d >= dayStart && d <= dayEnd; });
    const dayRepas = repas.filter(e => { const d = new Date(e.ts); return d >= dayStart && d <= dayEnd; });
    const dayInjections = injections.filter(e => { const d = new Date(e.ts); return d >= dayStart && d <= dayEnd; });

    let processedMesureIds = new Set<string>();
    let processedInjectionIds = new Set<string>();
    let processedRepasIds = new Set<string>();
    const mealGroups: JournalEvent[] = [];

    dayRepas.sort((a,b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()).forEach(r => {
        const injection = dayInjections.find(i => i.lien_repas_id === r.id);
        const mesure = injection ? dayMesures.find(m => m.id === injection.lien_mesure_id) : undefined;
        mealGroups.push({ type: 'mealgroup', ts: r.ts, data: { repas: r, injection, mesure }});
        processedRepasIds.add(r.id);
        if(injection) processedInjectionIds.add(injection.id);
        if(mesure) processedMesureIds.add(mesure.id);
    });
    
    const standaloneInjections = dayInjections.filter(i => !processedInjectionIds.has(i.id)).map(injection => {
        const mesure = dayMesures.find(m => m.id === injection.lien_mesure_id);
        if(mesure) processedMesureIds.add(mesure.id);
        return { type: 'injection', ts: injection.ts, data: { injection, mesure } } as JournalEvent;
    });

    const standaloneMesures = dayMesures.filter(m => !processedMesureIds.has(m.id)).map(mesure => ({ type: 'mesure', ts: mesure.ts, data: mesure } as JournalEvent));

    const allEvents = [...mealGroups, ...standaloneInjections, ...standaloneMesures];
    return allEvents.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  }, [currentDate, mesures, repas, injections]);
  

  const timeSlots = useMemo(() => [
    { mealTime: 'petit_dej' as MealTime, start: 5, end: 10 },
    { mealTime: 'dejeuner' as MealTime, start: 11, end: 14 },
    { mealTime: 'gouter' as MealTime, start: 15, end: 17 },
    { mealTime: 'diner' as MealTime, start: 18, end: 21 },
  ], []);

  const handleAddAction = (mealTime: MealTime) => {
    setCalculatorMealTime(mealTime);
    setCurrentPage('glucides');
  }
  
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
    <div className="pb-24 min-h-screen">
        <header className="sticky top-0 bg-emerald-main/90 backdrop-blur-md py-4 z-20 shadow-md">
            <div className="px-4 flex items-center justify-between">
                <div className="flex-1"></div>
                <h1 className="text-3xl font-display font-bold text-white text-shadow text-center flex-1">{t.journal_title}</h1>
                <div className="flex-1 flex justify-end">
                    <button onClick={() => setCurrentPage('history')} className="flex items-center gap-1 text-white text-sm font-semibold p-2 rounded-lg hover:bg-white/20 transition-colors" aria-label={t.journal_timelineView}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
                    </button>
                </div>
            </div>
            <div className="px-4 mt-2">
                 <DateNavigator currentDate={currentDate} setCurrentDate={setCurrentDate} viewMode="day" />
            </div>
        </header>

        <div className="p-4 space-y-4">
          {groupedEventsByDay.length === 0 ? (
            <div className="text-center p-8 bg-white/50 rounded-card mt-10">
                <p className="font-semibold text-text-muted">{t.journal_emptyDay}</p>
            </div>
          ) : (
            groupedEventsByDay.map(event => {
                if(event.type === 'mealgroup') {
                    return <MealGroupCard key={event.data.repas.id} event={event.data} />;
                }
                // Render standalone events here if needed, for now focusing on meal groups.
                return null;
            })
          )}
        </div>
        
        <button 
            onClick={() => handleOpenAddChoice(new Date(0).toISOString(), new Date().toISOString())}
            className="fixed bottom-24 right-5 w-16 h-16 rounded-full shadow-2xl z-30 btn-interactive"
            aria-label={t.addEventChoice_title}
        >
            <PlusIcon />
        </button>

        {isAddChoiceModalOpen && (
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