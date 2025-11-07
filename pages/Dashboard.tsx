import React, { useMemo, useState } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import Card from '../components/Card.tsx';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';
import { Page, Mesure, Event, MealTime } from '../types.ts';
import QuickAddItemModal from '../components/QuickAddItemModal.tsx';
import QuickBolusModal from '../components/QuickBolusModal.tsx';
import toast from 'react-hot-toast';
import ProgressCard from '../components/ProgressCard.tsx';
import AddEventModal from '../components/AddEventModal.tsx';
import GlucoseTrackingIllustration from '../components/illustrations/GlucoseTrackingIllustration.tsx';
import MedicalAgendaIllustration from '../components/illustrations/MedicalAgendaIllustration.tsx';
import CalculatorIcon from '../components/icons/CalculatorIcon.tsx';
import SyringeIcon from '../components/icons/SyringeIcon.tsx';
import GlucoseDropIcon from '../components/icons/GlucoseDropIcon.tsx';
import EmergencyIcon from '../components/icons/EmergencyIcon.tsx';
import CheckCircleIcon from '../components/icons/CheckCircleIcon.tsx';
import CircleIcon from '../components/icons/CircleIcon.tsx';
import GlucoQuizCard from '../components/GlucoQuizCard.tsx';
import GlucosePulseAnimation from '../components/animations/GlucosePulseAnimation.tsx';
import CalendarBlinkAnimation from '../components/animations/CalendarBlinkAnimation.tsx';
import TimeOfDayHeader from '../components/TimeOfDayHeader.tsx';
import { useUiStore } from '../store/uiStore.ts';
import BreakfastIcon from '../components/icons/BreakfastIcon.tsx';
import LunchIcon from '../components/icons/LunchIcon.tsx';
import DinnerIcon from '../components/icons/DinnerIcon.tsx';
import SnackIcon from '../components/icons/SnackIcon.tsx';
import InboxIcon from '../components/icons/InboxIcon.tsx';
import ArrowRightIcon from '../components/icons/ArrowRightIcon.tsx';


interface DashboardProps {
  setCurrentPage: (page: Page) => void;
}

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
    const t = useTranslations();
    const { updateEventStatus } = usePatientStore();
    const eventDate = new Date(event.ts);
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const isToday = eventDate.toDateString() === now.toDateString();
    const isTomorrow = eventDate.toDateString() === tomorrow.toDateString();
    
    const time = eventDate.toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' });
    let dateLabel = eventDate.toLocaleDateString(t.locale, { weekday: 'long', day: 'numeric', month: 'long' });
    if(isToday) dateLabel = t.dashboard_todayAt(time);
    if(isTomorrow) dateLabel = t.dashboard_tomorrowAt(time);

    const handleStatusChange = () => {
        const newStatus = event.status === 'pending' ? 'completed' : 'pending';
        updateEventStatus(event.id, newStatus);
        if (newStatus === 'completed') {
            toast.success(t.toast_eventCompleted(event.title));
        } else {
            toast.success(t.toast_eventReactivated(event.title));
        }
    };

    return (
        <div className={`p-3 rounded-lg flex items-center justify-between transition-all duration-300 ${event.status === 'completed' ? 'opacity-60 bg-slate-50' : 'bg-white/50'}`}>
            <div className="flex items-center gap-3">
                 <button onClick={handleStatusChange} className="focus:outline-none focus:ring-2 focus:ring-jade/50 rounded-full" aria-label={event.status === 'pending' ? t.dashboard_markCompleted : t.dashboard_markPending}>
                    {event.status === 'pending' ? (
                        <CircleIcon className="w-7 h-7 text-slate-400 hover:text-jade transition-colors" />
                    ) : (
                        <CheckCircleIcon className="w-7 h-7 text-jade" />
                    )}
                </button>
                <div>
                    <p className={`font-semibold ${event.status === 'completed' ? 'line-through text-text-muted' : 'text-text-title'}`}>{event.title}</p>
                    <p className="text-sm text-text-muted">{dateLabel}</p>
                </div>
            </div>
        </div>
    );
}


const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage }) => {
  const { patient, mesures, addMesure, addInjection, events, addEvent, unreadMessagesCount } = usePatientStore();
  const { setCalculatorMealTime } = useUiStore();
  const t = useTranslations();
  const [isMeasureModalOpen, setMeasureModalOpen] = useState(false);
  const [isBolusModalOpen, setBolusModalOpen] = useState(false);
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const getGreeting = (t: any, name: string) => {
    const hour = new Date().getHours();
    if (hour < 12) return `${t.greeting_morning}, ${name}!`;
    if (hour < 18) return `${t.greeting_afternoon}, ${name}!`;
    return `${t.greeting_evening}, ${name}!`;
  };

  const lastMeasure: Mesure | undefined = useMemo(() => mesures[0], [mesures]);
  
  const todayMeasuresCount = useMemo(() => {
    const today = new Date().toDateString();
    return mesures.filter(m => new Date(m.ts).toDateString() === today).length;
  }, [mesures]);

  const hasPendingEvents = useMemo(() => events.some(e => e.status === 'pending'), [events]);

  const handleAddMeasure = (gly: number, cetone: number | undefined, ts: string) => {
    addMesure({ gly, cetone, source: 'doigt' }, ts);
    toast.success(t.toast_measureAdded(gly));
    setMeasureModalOpen(false);
  };

  const handleAddBolus = (dose: number, type: 'rapide' | 'correction', ts: string) => {
    addInjection({ dose_U: dose, type }, ts);
    toast.success(t.toast_bolusAdded(dose));
    setBolusModalOpen(false);
  };
  
  const handleAddEvent = (eventData: Omit<Event, 'id' | 'patient_id' | 'status'>) => {
    addEvent(eventData);
    toast.success(t.toast_eventAdded);
    setEventModalOpen(false);
  }
  
  const smartAction = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 10) {
        return {
            label: t.dashboard_addBreakfast,
            icon: <BreakfastIcon className="w-10 h-10" />,
            mealTime: 'petit_dej' as MealTime
        };
    }
    if (hour >= 11 && hour < 14) {
        return {
            label: t.dashboard_addLunch,
            icon: <LunchIcon className="w-10 h-10" />,
            mealTime: 'dejeuner' as MealTime
        };
    }
    if (hour >= 15 && hour < 17) {
        return {
            label: t.dashboard_addSnack,
            icon: <SnackIcon className="w-10 h-10" />,
            mealTime: 'gouter' as MealTime
        };
    }
    if (hour >= 18 && hour < 21) {
        return {
            label: t.dashboard_addDinner,
            icon: <DinnerIcon className="w-10 h-10" />,
            mealTime: 'diner' as MealTime
        };
    }
    return {
        label: t.dashboard_action_calculate,
        icon: <CalculatorIcon className="w-10 h-10" />,
        mealTime: null
    };
  }, [t]);

  const handleSmartAction = () => {
    if (smartAction.mealTime) {
        setCalculatorMealTime(smartAction.mealTime);
    }
    setCurrentPage('glucides');
  };

  if (!patient) return null;

  const InboxCard = () => {
    const hasUnread = unreadMessagesCount > 0;
    const message = hasUnread 
      ? (unreadMessagesCount === 1 ? t.dashboard_inbox_unread_one : t.dashboard_inbox_unread_many(unreadMessagesCount))
      : t.dashboard_inbox_all_read;

    return (
      <div className={hasUnread ? 'animate-breathing-halo rounded-card' : ''}>
        <Card 
          onClick={() => setCurrentPage('inbox')} 
          className="animate-card-open"
          style={{animationDelay: '100ms'}}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <InboxIcon className={`w-12 h-12 transition-colors ${hasUnread ? 'text-jade' : 'text-slate-400'}`} />
              <div>
                <h2 className="font-display font-semibold text-xl text-text-title">{t.dashboard_inbox_title}</h2>
                <p className="text-sm text-text-muted">{message}</p>
              </div>
            </div>
            <ArrowRightIcon className="w-6 h-6 text-text-muted"/>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div>
      <TimeOfDayHeader 
        greeting={getGreeting(t, patient.prenom)}
        unreadCount={unreadMessagesCount}
        onInboxClick={() => setCurrentPage('inbox')}
      />

      <div className="px-4 space-y-5">
        <Card className="animate-card-open">
          <div className="flex justify-center items-center flex-col">
              <p className="text-sm font-semibold text-text-muted">{t.dashboard_currentGlucose}</p>
              <div className="relative flex items-center justify-center my-2 h-40 w-40">
                  <div className="absolute inset-0 bg-mint/50 rounded-full animate-pulse " style={{animationDuration: '3s'}}/>
                  <div className="absolute inset-2 bg-white/50 rounded-full"/>
                  {lastMeasure ? (
                    <p className="relative text-5xl font-display font-bold text-jade">{lastMeasure.gly.toFixed(2)}</p>
                  ) : (
                    <p className="relative text-lg font-semibold text-text-muted">{t.dashboard_noMeasure}</p>
                  )}
              </div>
              <p className="text-xs text-text-muted/80 -mt-2">{t.dashboard_todayChecks(todayMeasuresCount)}</p>
            </div>
          <div className="mt-4 space-y-4">
              <button onClick={handleSmartAction} className="w-full btn-interactive group flex flex-col items-center justify-center text-lg font-bold py-4 px-6 rounded-card bg-jade text-white transition-all duration-300 ease-fast disabled:opacity-60 disabled:cursor-not-allowed shadow-button-jade hover:shadow-button-jade-hover transform hover:-translate-y-1">
                  {smartAction.icon}
                  <span className="mt-2 text-base">{smartAction.label}</span>
              </button>
              <div className="grid grid-cols-3 gap-3 text-center">
                  <button onClick={() => setMeasureModalOpen(true)} className="flex flex-col items-center justify-center p-2 bg-white/60 rounded-lg hover:bg-white transition-colors space-y-1 text-text-muted hover:text-jade btn-interactive">
                      <GlucoseDropIcon className="w-7 h-7"/>
                      <span className="text-xs font-semibold">{t.dashboard_quickMeasure}</span>
                  </button>
                  <button onClick={() => setBolusModalOpen(true)} className="flex flex-col items-center justify-center p-2 bg-white/60 rounded-lg hover:bg-white transition-colors space-y-1 text-text-muted hover:text-jade btn-interactive">
                      <SyringeIcon className="w-7 h-7"/>
                      <span className="text-xs font-semibold">{t.dashboard_manualBolus}</span>
                  </button>
                  <button onClick={() => setCurrentPage('emergency')} className="flex flex-col items-center justify-center p-2 bg-coral/20 rounded-lg hover:bg-coral/30 transition-colors space-y-1 text-coral btn-interactive">
                      <EmergencyIcon className="w-7 h-7"/>
                      <span className="text-xs font-semibold">{t.dashboard_action_emergency}</span>
                  </button>
              </div>
          </div>
        </Card>
        
        <InboxCard />

        <Card className="animate-card-open" style={{animationDelay: '200ms'}}>
           {hasPendingEvents ? (
              <div className="relative w-24 h-24 mx-auto my-2 flex items-center justify-center">
                  <CalendarBlinkAnimation className="w-24 h-24" />
              </div>
           ) : (
              <MedicalAgendaIllustration />
           )}
          <h2 className="font-display font-semibold text-xl text-center -mt-4">{t.dashboard_eventsTitle}</h2>
           <div className="mt-2 space-y-1">
               {events.length > 0 ? (
                   events.slice(0, 3).map(event => <EventCard key={event.id} event={event} />)
               ) : (
                   <p className="text-center text-sm text-text-muted p-4">{t.dashboard_noEvents}</p>
               )}
           </div>
           <button onClick={() => setEventModalOpen(true)} className="w-full mt-3 text-jade text-sm font-bold py-2 rounded-button hover:bg-mint/50 transition-colors btn-interactive">
               {t.dashboard_addEvent}
           </button>
        </Card>
        
         <div className="rounded-card">
          <Card className="cursor-pointer hover:shadow-glass-hover animate-card-open" style={{animationDelay: '300ms'}} onClick={() => setCurrentPage('rapports')}>
             <GlucoseTrackingIllustration />
            <h2 className="font-display font-semibold text-xl text-center text-text-title">{t.dashboard_dataAnalysisTitle}</h2>
            <p className="text-sm text-text-muted text-center mt-1">{t.dashboard_dataAnalysisText}</p>
            <button className="w-full mt-3 bg-jade text-white text-sm font-bold py-2 rounded-button hover:bg-opacity-90 transition-colors btn-interactive">
              {t.dashboard_dataAnalysisButton}
            </button>
          </Card>
        </div>

        <div className="animate-card-open" style={{animationDelay: '400ms'}}>
          <ProgressCard />
        </div>

        <div className="animate-card-open" style={{animationDelay: '500ms'}}>
          <GlucoQuizCard />
        </div>

         {showNotification && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-sm p-4 z-50">
            <div className="bg-mint p-4 rounded-card shadow-xl border border-turquoise/50 text-center text-jade font-semibold animate-notification-pop-up">
              Ceci est une notification douce !
            </div>
          </div>
        )}

        {isMeasureModalOpen && (
          <QuickAddItemModal onClose={() => setMeasureModalOpen(false)} onConfirm={handleAddMeasure} />
        )}
        {isBolusModalOpen && (
          <QuickBolusModal onClose={() => setBolusModalOpen(false)} onConfirm={handleAddBolus} />
        )}
         {isEventModalOpen && (
          <AddEventModal onClose={() => setEventModalOpen(false)} onConfirm={handleAddEvent} />
         )}
      </div>
    </div>
  );
};

export default Dashboard;