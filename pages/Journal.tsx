
import React from 'react';
import { usePatientStore } from '../store/patientStore';
import { Mesure, Repas, Injection, MealTime } from '../types';
import Card from '../components/Card';
import useTranslations from '../hooks/useTranslations';

type JournalEvent = (Mesure | Repas | Injection) & { eventType: 'mesure' | 'repas' | 'injection' };

const Journal: React.FC = () => {
  const { mesures, repas, injections } = usePatientStore();
  const t = useTranslations();

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
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="text-xl">🩸</div>
                <div>
                    <p className="font-semibold text-text-main">{t.journal_glycemia}: <span className="font-bold text-emerald-main">{mesure.gly.toFixed(2)} g/L</span></p>
                    {mesure.cetone && <p className="text-sm text-text-muted">{t.journal_ketone}: {mesure.cetone.toFixed(1)} mmol/L</p>}
                </div>
            </div>
        );
      case 'repas':
        const r = event as Repas;
        return (
             <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="text-xl">🍽️</div>
                <div>
                    <p className="font-semibold text-text-main">{t.mealTimes[r.moment]}: <span className="font-bold text-emerald-main">{t.journal_carbs(r.total_carbs_g)}</span></p>
                    {r.note && <p className="text-sm text-text-muted italic">"{r.note}"</p>}
                </div>
            </div>
        );
      case 'injection':
        const injection = event as Injection;
        const typeLabel = injection.type === 'rapide' ? t.common_rapid : t.common_correction;
        return (
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="text-xl">💉</div>
                <div>
                    <p className="font-semibold text-text-main">{t.journal_bolus} {typeLabel}: <span className="font-bold text-emerald-main">{injection.dose_U} U</span></p>
                    {injection.calc_details && <p className="text-sm text-text-muted">{injection.calc_details}</p>}
                </div>
            </div>
        );
      default:
        return null;
    }
  };
  
  let lastDate: string | null = null;
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  return (
    <div className="p-4 space-y-4">
      <header className="py-4 text-center">
        <h1 className="text-3xl font-display font-bold text-white text-shadow">{t.journal_title}</h1>
      </header>
      
      {combinedEvents.length === 0 ? (
        <Card className="text-center">
          <p className="text-text-muted">{t.journal_empty}</p>
        </Card>
      ) : (
        combinedEvents.map((event) => {
          const eventDate = new Date(event.ts).toLocaleDateString(t.locale, dateOptions);
          const showDateHeader = eventDate !== lastDate;
          lastDate = eventDate;
          
          return (
            <React.Fragment key={event.id}>
              {showDateHeader && <h2 className="text-lg font-semibold text-text-title pt-4 pb-2">{eventDate}</h2>}
              <Card className="flex justify-between items-center">
                {renderEvent(event)}
                <span className="text-xs text-text-muted/80 self-start">
                    {new Date(event.ts).toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' })}
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