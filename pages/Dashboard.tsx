import React, { useState, useMemo, useEffect } from 'react';
import { usePatientStore } from '../store/patientStore';
import { Page, InjectionType, Event } from '../types';
import QuickAddItemModal from '../components/QuickAddItemModal';
import QuickBolusModal from '../components/QuickBolusModal';
import AddEventModal from '../components/AddEventModal';
import Card from '../components/Card';
import toast from 'react-hot-toast';

interface DashboardProps {
  setCurrentPage: (page: Page) => void;
}

// --- SVG Icons ---
const CalculatorIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><line x1="16" y1="10" x2="12" y2="10"></line><line x1="12" y1="10" x2="8" y2="10"></line><line x1="12" y1="14" x2="12" y2="18"></line><line x1="8" y1="14" x2="8" y2="18"></line></svg>;
const SyringeIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 2 4 4"></path><path d="m17 7 3-3"></path><path d="M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0L2.3 16.3a2.4 2.4 0 0 1 0-3.4Z"></path><path d="m14 11 3-3"></path><path d="m6 18l-2-2"></path><path d="m2 22 4-4"></path></svg>;
const DropletIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>;
const AlertIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const ArrowUpRight: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>;
const ArrowDownRight: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 7 17 17 7 17"></polyline><line x1="7" y1="7" x2="17" y2="17"></line></svg>;
const ArrowRight: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const CalendarIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const LightbulbIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-7 7c0 3 2 5 2 7h10c0-2 2-4 2-7a7 7 0 0 0-7-7z"></path></svg>;
const BarChartIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>;
const StethoscopeIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4.8 2.3A.3.3 0 1 0 5 2a.3.3 0 0 0-.2.3V5a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9a2 2 0 0 1 2-2h1a2 2 0 0 0 2-2V2.3a.3.3 0 1 0-.5 0V5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5V9a.5.5 0 0 0-.5.5h-1a.5.5 0 0 1-.5-.5V2.3a.3.3 0 0 0-.2-.3Z"></path><path d="M8 15a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-3a2 2 0 0 0-2-2h-1a2 2 0 0 1-2-2V7a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v1a2 2 0 0 1-2 2H7a2 2 0 0 0-2 2Z"></path><circle cx="12" cy="18" r="2"></circle></svg>;
const ClipboardIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path></svg>;


const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage }) => {
  const { patient, mesures, events, addInjection, addMesure, addEvent } = usePatientStore();
  const [isAddItemModalOpen, setAddItemModalOpen] = useState(false);
  const [isBolusModalOpen, setBolusModalOpen] = useState(false);
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [randomTip, setRandomTip] = useState('');
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const handleConfirmBolus = (dose: number, type: InjectionType, ts: string) => {
    addInjection({ dose_U: dose, type }, ts);
    toast.success(`Bolus de ${dose}U ajouté !`);
    setBolusModalOpen(false);
  };
  
  const { lastMesure, trend, todayMesuresCount } = useMemo(() => {
    if (mesures.length === 0) return { lastMesure: null, trend: null, todayMesuresCount: 0 };
    
    const today = new Date().toDateString();
    const todayMesures = mesures.filter(m => new Date(m.ts).toDateString() === today);
    
    let trend: 'up' | 'down' | 'stable' | null = null;
    if (mesures.length > 1) {
      const diff = mesures[0].gly - mesures[1].gly;
      if (diff > 0.1) trend = 'up';
      else if (diff < -0.1) trend = 'down';
      else trend = 'stable';
    }
    return { lastMesure: mesures[0], trend, todayMesuresCount: todayMesures.length };
  }, [mesures]);

  const upcomingEvents = useMemo(() => {
      const now = new Date();
      return events.filter(e => new Date(e.ts) >= now).slice(0, 2);
  }, [events]);
  
  const formatEventDate = (ts: string) => {
    const eventDate = new Date(ts);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (eventDate.toDateString() === today.toDateString()) {
        return `Aujourd'hui à ${eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (eventDate.toDateString() === tomorrow.toDateString()) {
        return `Demain à ${eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return eventDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) + ` à ${eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  }

  useEffect(() => {
    const tips = [
        "N'oubliez pas de tourner les sites d'injection pour éviter les lipodystrophies.",
        "Une activité physique peut influencer votre glycémie pendant plusieurs heures après l'effort.",
        "L'hydratation est clé ! Boire de l'eau aide à réguler la glycémie.",
        "Vérifiez toujours la date d'expiration de vos flacons d'insuline.",
        "Un repas riche en graisses peut ralentir la digestion et causer une hyperglycémie tardive."
    ];
    setRandomTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  return (
    <div className="p-4 space-y-5">
      <header className="py-4">
        <h1 className="text-3xl font-display font-bold text-white text-shadow">
          {getGreeting()}, {patient?.prenom} !
        </h1>
      </header>

      <Card hoverEffect={false}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-text-muted">Glycémie Actuelle</p>
                {lastMesure ? (
                    <p className="text-5xl font-display font-bold text-text-title tracking-tight">{lastMesure.gly.toFixed(2)}
                        <span className="text-3xl text-text-muted ml-1">g/L</span>
                    </p>
                ) : (
                    <p className="text-2xl font-display font-semibold text-text-muted mt-2">Aucune mesure</p>
                )}
            </div>
            {trend && (
                <div className={`p-2 rounded-full ${
                    trend === 'up' ? 'bg-rose-100 text-rose-600' :
                    trend === 'down' ? 'bg-sky-100 text-sky-600' :
                    'bg-slate-100 text-slate-600'
                }`}>
                    {trend === 'up' && <ArrowUpRight />}
                    {trend === 'down' && <ArrowDownRight />}
                    {trend === 'stable' && <ArrowRight />}
                </div>
            )}
        </div>
        {lastMesure && (
            <div className="text-xs text-text-muted mt-2 flex justify-between">
                <span>{new Date(lastMesure.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>
                <span>{todayMesuresCount} contrôle{todayMesuresCount > 1 ? 's' : ''} aujourd'hui</span>
            </div>
        )}
      </Card>
      
      <div className="grid grid-cols-4 gap-3 text-center">
        {[
          { label: 'Calcul', icon: <CalculatorIcon />, action: () => setCurrentPage('glucides') },
          { label: 'Bolus', icon: <SyringeIcon />, action: () => setBolusModalOpen(true) },
          { label: 'Mesure', icon: <DropletIcon />, action: () => setAddItemModalOpen(true) },
          { label: 'Urgence', icon: <AlertIcon />, action: () => setCurrentPage('emergency') },
        ].map(item => (
            <div key={item.label}>
                <button
                    onClick={item.action}
                    className="w-full h-16 bg-white/70 backdrop-blur-sm rounded-card shadow-glass flex items-center justify-center text-emerald-main hover:bg-white transition-colors"
                >
                    {item.icon}
                </button>
                <span className="text-xs font-semibold text-white/90 mt-1 block">{item.label}</span>
            </div>
        ))}
      </div>
      
      <Card>
        <div className="flex items-center text-text-title mb-3">
            <BarChartIcon />
            <h2 className="font-display font-semibold text-xl ml-2">Analyse des Données</h2>
        </div>
        <div className="text-center py-2">
            <p className="text-sm text-text-muted mb-4">Visualisez les tendances, le temps dans la cible et les statistiques détaillées.</p>
            <button
                onClick={() => setCurrentPage('rapports')}
                className="bg-emerald-main text-white font-bold py-3 px-6 rounded-button hover:bg-jade-deep-dark transition-colors shadow-md"
            >
                Accéder aux Rapports
            </button>
        </div>
      </Card>
      
      <Card>
        <div className="flex items-center text-text-title mb-3">
          <LightbulbIcon />
          <h2 className="font-display font-semibold text-xl ml-2">Bon à savoir</h2>
        </div>
        <p className="text-sm text-text-main">{randomTip}</p>
      </Card>
      
      <Card>
        <div className="flex items-center text-text-title mb-3">
          <CalendarIcon />
          <h2 className="font-display font-semibold text-xl ml-2">Prochains Événements</h2>
        </div>
        <div className="text-sm text-text-main space-y-2">
            {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                    <div key={event.id} className="flex items-start justify-between py-2 border-b border-black/5 last:border-b-0">
                        <div className="flex items-start gap-3">
                           {event.type === 'rdv' ? <StethoscopeIcon className="w-5 h-5 text-emerald-main mt-0.5" /> : <ClipboardIcon className="w-5 h-5 text-emerald-main mt-0.5" />}
                            <div>
                                <p className="font-semibold">{event.title}</p>
                                <p className="text-xs text-text-muted">{event.description}</p>
                            </div>
                        </div>
                        <span className="text-xs text-text-muted font-medium text-right flex-shrink-0 ml-2">{formatEventDate(event.ts)}</span>
                    </div>
                ))
            ) : (
                <p className="text-text-muted text-center py-2">Aucun événement à venir.</p>
            )}
           <button onClick={() => setEventModalOpen(true)} className="w-full text-sm text-emerald-main font-semibold mt-2 py-2 bg-emerald-main/10 hover:bg-emerald-main/20 rounded-lg transition-colors">
               + Ajouter un événement
           </button>
        </div>
      </Card>
      
      {isAddItemModalOpen && (
        <QuickAddItemModal 
          onClose={() => setAddItemModalOpen(false)} 
          onConfirm={(gly, cetone, ts) => {
            addMesure({ gly, cetone, source: 'doigt'}, ts);
            toast.success(`Mesure de ${gly} g/L ajoutée !`);
            setAddItemModalOpen(false);
          }} 
        />
      )}
      {isBolusModalOpen && <QuickBolusModal onClose={() => setBolusModalOpen(false)} onConfirm={handleConfirmBolus} />}
      {isEventModalOpen && (
        <AddEventModal 
            onClose={() => setEventModalOpen(false)}
            onConfirm={(eventData) => {
                addEvent(eventData);
                toast.success("Événement ajouté !");
                setEventModalOpen(false);
            }}
        />
       )}
    </div>
  );
};

export default Dashboard;