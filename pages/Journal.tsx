import React from 'react';
import { usePatientStore } from '../store/patientStore';
import { Mesure, Repas, Injection } from '../types';
import Card from '../components/Card';

type JournalEvent = (Mesure | Repas | Injection) & { eventType: 'mesure' | 'repas' | 'injection' };

const Journal: React.FC = () => {
  const { mesures, repas, injections } = usePatientStore();

  const combinedEvents: JournalEvent[] = [
    ...mesures.map(m => ({ ...m, eventType: 'mesure' as const })),
    ...repas.map(r => ({ ...r, eventType: 'repas' as const })),
    ...injections.map(i => ({ ...i, eventType: 'injection' as const })),
  ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  
  const renderEvent = (event: JournalEvent) => {
    switch (event.eventType) {
      case 'mesure':
        const mesure = event as Mesure;
        return (
            <div className="flex items-center space-x-3">
                <div className="text-xl">🩸</div>
                <div>
                    <p className="font-semibold text-neutral-body dark:text-dark-body">Glycémie: <span className="font-bold text-primary dark:text-dark-primary-light">{mesure.gly.toFixed(2)} g/L</span></p>
                    {mesure.cetone && <p className="text-sm text-neutral-subtext dark:text-dark-subtext">Cétone: {mesure.cetone.toFixed(1)} mmol/L</p>}
                </div>
            </div>
        );
      case 'repas':
        const repas = event as Repas;
        return (
             <div className="flex items-center space-x-3">
                <div className="text-xl">🍽️</div>
                <div>
                    <p className="font-semibold text-neutral-body dark:text-dark-body">{repas.moment}: <span className="font-bold text-primary dark:text-dark-primary-light">{repas.total_carbs_g.toFixed(0)}g</span> de glucides</p>
                    {repas.note && <p className="text-sm text-neutral-subtext dark:text-dark-subtext italic">"{repas.note}"</p>}
                </div>
            </div>
        );
      case 'injection':
        const injection = event as Injection;
        return (
            <div className="flex items-center space-x-3">
                <div className="text-xl">💉</div>
                <div>
                    <p className="font-semibold text-neutral-body dark:text-dark-body">Bolus {injection.type}: <span className="font-bold text-primary dark:text-dark-primary-light">{injection.dose_U} U</span></p>
                    {injection.calc_details && <p className="text-sm text-neutral-subtext dark:text-dark-subtext">{injection.calc_details}</p>}
                </div>
            </div>
        );
      default:
        return null;
    }
  };
  
  let lastDate: string | null = null;

  return (
    <div className="p-4 space-y-4">
      <header className="mb-4">
        <h1 className="text-3xl font-display font-bold text-neutral-title dark:text-dark-title">Journal de bord</h1>
      </header>
      
      {combinedEvents.length === 0 ? (
        <Card className="text-center">
          <p className="text-neutral-subtext dark:text-dark-subtext">Aucun événement enregistré pour le moment.</p>
        </Card>
      ) : (
        combinedEvents.map((event, index) => {
          const eventDate = new Date(event.ts).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          const showDateHeader = eventDate !== lastDate;
          lastDate = eventDate;
          
          return (
            <React.Fragment key={event.id}>
              {showDateHeader && <h2 className="text-lg font-semibold text-neutral-title dark:text-dark-title pt-4 pb-2">{eventDate}</h2>}
              <Card className="flex justify-between items-center">
                {renderEvent(event)}
                <span className="text-xs text-neutral-subtext/80 dark:text-dark-subtext/80 self-start">
                    {new Date(event.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </Card>
            </React.Fragment>
          );
        })
      )}
    </div>
  );
};

export default Journal;
