
import React from 'react';
import { usePatientStore } from '../store/patientStore';
import { Injection, Mesure, Repas } from '../types';

const SyringeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m18 2 4 4"></path><path d="m17 7 3-3"></path><path d="M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0L2.3 16.3a2.4 2.4 0 0 1 0-3.4Z"></path><path d="m14 11 3-3"></path><path d="M6 18l-2-2"></path><path d="m2 22 4-4"></path></svg>
);
const Wheat: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 22 16 8l-4-4-2 2 4 4-2.5 2.5-4.5 4.5-1.5-1.5z"></path><path d="m18 12 2-2-4.5-4.5-2 2 4.5 4.5z"></path><path d="M16 8s2-2 4-4"></path><path d="M18.5 4.5s2 2 4 4"></path></svg>
);
const Thermometer: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>
);

const Journal: React.FC = () => {
  const { mesures, repas, injections } = usePatientStore();

  const allEvents = [
    ...mesures.map(m => ({ ...m, type: 'mesure' as const })),
    ...repas.map(r => ({ ...r, type: 'repas' as const })),
    ...injections.map(i => ({ ...i, type: 'injection' as const })),
  ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

  const groupedEvents = allEvents.reduce((acc, event) => {
    const date = new Date(event.ts).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, (Mesure & {type: 'mesure'})[] | (Repas & {type: 'repas'})[] | (Injection & {type: 'injection'})[]>);

  const renderEvent = (event: any) => {
    const time = new Date(event.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    switch (event.type) {
      case 'mesure':
        const mesure = event as Mesure;
        return (
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-red-600 dark:text-red-300" />
            </div>
            <div className="flex-grow">
                <p>Glycémie: <span className="font-bold">{mesure.gly.toFixed(2)} g/L</span></p>
                {mesure.cetone && <p className="text-sm text-gray-500">Cétones: {mesure.cetone.toFixed(1)} mmol/L</p>}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{time}</div>
          </div>
        );
      case 'repas':
        const r = event as Repas;
        return (
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
                <Wheat className="w-5 h-5 text-yellow-600 dark:text-yellow-300" />
            </div>
            <div className="flex-grow">
                <p>Repas: <span className="font-bold">{r.total_carbs_g.toFixed(0)} g</span></p>
                <p className="text-sm text-gray-500">{r.items.map(i => i.nom).join(', ')}</p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{time}</div>
          </div>
        );
      case 'injection':
        const injection = event as Injection;
        return (
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <SyringeIcon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="flex-grow">
                <p>Injection: <span className="font-bold">{injection.dose_U} U</span> ({injection.type})</p>
                {injection.calc_details && <p className="text-sm text-gray-500">{injection.calc_details}</p>}
            </div>
             <div className="text-sm text-gray-500 dark:text-gray-400">{time}</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Journal</h1>
      <div className="space-y-6">
        {Object.keys(groupedEvents).length > 0 ? (
          Object.entries(groupedEvents).map(([date, events]) => (
            <div key={date}>
                <h2 className="text-md font-semibold my-3 text-gray-700 dark:text-gray-300 sticky top-0 bg-gray-50 dark:bg-gray-900 py-2">{date}</h2>
                <div className="space-y-2">
                    {(events as any[]).map((event, index) => (
                        <div key={event.id || index} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                            {renderEvent(event)}
                        </div>
                    ))}
                </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 mt-8">Aucune donnée pour le moment.</p>
        )}
      </div>
    </div>
  );
};

export default Journal;
