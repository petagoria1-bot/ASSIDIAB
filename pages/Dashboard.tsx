
import React, { useMemo, useState } from 'react';
import { usePatientStore } from '../store/patientStore';
import Card from '../components/Card';
import useTranslations from '../hooks/useTranslations';
import { Page, Mesure, Event } from '../types';
import QuickAddItemModal from '../components/QuickAddItemModal';
import QuickBolusModal from '../components/QuickBolusModal';
import toast from 'react-hot-toast';
import ProgressCard from '../components/ProgressCard';
import AddEventModal from '../components/AddEventModal';
import GlucoseTrackingIllustration from '../components/illustrations/GlucoseTrackingIllustration';
import MedicalAgendaIllustration from '../components/illustrations/MedicalAgendaIllustration';
import CalculatorIcon from '../components/icons/CalculatorIcon';
import SyringeIcon from '../components/icons/SyringeIcon';
import GlucoseDropIcon from '../components/icons/GlucoseDropIcon';
import EmergencyIcon from '../components/icons/EmergencyIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import CircleIcon from '../components/icons/CircleIcon';
import GlucoQuizCard from '../components/GlucoQuizCard';
import GlucosePulseAnimation from '../components/animations/GlucosePulseAnimation';
import CalendarBlinkAnimation from '../components/animations/CalendarBlinkAnimation';


interface DashboardProps {
  setCurrentPage: (page: Page) => void;
}

const getGreeting = (t: any, name: string) => {
  const hour = new Date().getHours();
  if (hour < 12) return `${t.greeting_morning}, ${name}!`;
  if (hour < 18) return `${t.greeting_afternoon}, ${name}!`;
  return `${t.greeting_evening}, ${name}!`;
};

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
                 <button onClick={handleStatusChange} className="focus:outline-none focus:ring-2 focus:ring-emerald-main/50 rounded-full" aria-label={event.status === 'pending' ? 'Mark as completed' : 'Mark as pending'}>
                    {event.status === 'pending' ? (
                        <CircleIcon className="w-7 h-7 text-slate-400 hover:text-emerald-main transition-colors" />
                    ) : (
                        <CheckCircleIcon className="w-7 h-7 text-emerald-main" />
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
  const { patient, mesures, addMesure, addInjection, events, addEvent } = usePatientStore();
  const t = useTranslations();
  const [isMeasureModalOpen, setMeasureModalOpen] = useState(false);
  const [isBolusModalOpen, setBolusModalOpen] = useState(false);
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

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

  if (!patient) return null;

  return (
    <div className="p-4 space-y-5">
      <header className="py-4">
        <h1 className="text-3xl font-display font-bold text-white text-shadow">{getGreeting(t, patient.prenom)}</h1>
      </header>
      
      <Card className="animate-card-open">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {lastMeasure ? (
                <GlucosePulseAnimation className="w-16 h-16 flex-shrink-0" />
            ) : (
                <div className="w-16 h-16 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold text-text-muted">{t.dashboard_currentGlucose}</p>
              {lastMeasure ? (
                <p className="text-4xl font-display font-bold text-emerald-main">{lastMeasure.gly.toFixed(2)} <span className="text-xl text-text-muted">g/L</span></p>
              ) : (
                <p className="text-lg font-semibold text-text-muted">{t.dashboard_noMeasure}</p>
              )}
              <p className="text-xs text-text-muted/80 mt-1">{t.dashboard_todayChecks(todayMeasuresCount)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <button onClick={() => setCurrentPage('glucides')} className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-white/60 to-mint-soft/40 rounded-card hover:shadow-lg transition-all transform hover:-translate-y-1 space-y-2 border border-white/50 ring-1 ring-white/20 btn-interactive">
              <CalculatorIcon className="w-8 h-8"/>
              <span className="text-sm font-bold text-jade-deep">{t.dashboard_action_calculate}</span>
            </button>
            <button onClick={() => setBolusModalOpen(true)} className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-white/60 to-mint-soft/40 rounded-card hover:shadow-lg transition-all transform hover:-translate-y-1 space-y-2 border border-white/50 ring-1 ring-white/20 btn-interactive">
              <SyringeIcon className="w-8 h-8"/>
              <span className="text-sm font-bold text-jade-deep">{t.dashboard_action_bolus}</span>
            </button>
            <button onClick={() => setMeasureModalOpen(true)} className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-white/60 to-mint-soft/40 rounded-card hover:shadow-lg transition-all transform hover:-translate-y-1 space-y-2 border border-white/50 ring-1 ring-white/20 btn-interactive">
               <GlucoseDropIcon className="w-8 h-8"/>
              <span className="text-sm font-bold text-jade-deep">{t.dashboard_action_measure}</span>
            </button>
            <button onClick={() => setCurrentPage('emergency')} className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-white/60 to-danger-soft/50 rounded-card hover:shadow-lg transition-all transform hover:-translate-y-1 space-y-2 border border-white/50 ring-1 ring-white/20 btn-interactive">
               <EmergencyIcon className="w-8 h-8"/>
              <span className="text-sm font-bold text-danger-dark">{t.dashboard_action_emergency}</span>
            </button>
          </div>
        </div>
      </Card>
      
      <Card className="animate-card-open" style={{animationDelay: '100ms'}}>
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
         <button onClick={() => setEventModalOpen(true)} className="w-full mt-3 text-emerald-main text-sm font-bold py-2 rounded-button hover:bg-mint-soft transition-colors btn-interactive">
             {t.dashboard_addEvent}
         </button>
      </Card>
      
       <div className="rounded-card animate-breathing-halo">
        <Card className="cursor-pointer hover:shadow-glass-hover animate-card-open" style={{animationDelay: '200ms'}} onClick={() => setCurrentPage('rapports')}>
           <GlucoseTrackingIllustration />
          <h2 className="font-display font-semibold text-xl text-center text-text-title">{t.dashboard_dataAnalysisTitle}</h2>
          <p className="text-sm text-text-muted text-center mt-1">{t.dashboard_dataAnalysisText}</p>
          <button className="w-full mt-3 bg-emerald-main text-white text-sm font-bold py-2 rounded-button hover:bg-jade-deep-dark transition-colors btn-interactive">
            {t.dashboard_dataAnalysisButton}
          </button>
        </Card>
      </div>

      <div className="animate-card-open" style={{animationDelay: '300ms'}}>
        <ProgressCard />
      </div>

      <div className="animate-card-open" style={{animationDelay: '400ms'}}>
        <GlucoQuizCard />
      </div>

       {showNotification && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-sm p-4 z-50">
          <div className="bg-mint-soft p-4 rounded-card shadow-xl border border-turquoise-light/50 text-center text-jade-deep-dark font-semibold animate-notification-pop-up">
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
  );
};

export default Dashboard;
