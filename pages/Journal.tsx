
import React from 'react';
import { usePatientStore } from '../store/patientStore';
import { Injection, Mesure, Repas } from '../types';

const Journal: React.FC = () => {
  const { mesures, repas, injections } = usePatientStore();

  // Combine and sort all events by timestamp
  const allEvents = [
    ...mesures.map(m => ({ ...m, type: 'mesure' })),
    ...repas.map(r => ({ ...r, type: 'repas' })),
    ...injections.map(i => ({ ...i, type: 'injection' })),
  ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

  const renderEvent = (event: any) => {
    const time = new Date(event.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    switch (event.type) {
      case 'mesure':
        const mesure = event as Mesure;
        return (
          <div className="flex items-center space-x-4">
            <div className="w-12 text-sm text-gray-500">{time}</div>
            <div className="flex-grow">Glycémie: <span className="font-bold">{mesure.gly.toFixed(2)} g/L</span></div>
          </div>
        );
      case 'repas':
        const r = event as Repas;
        return (
          <div className="flex items-center space-x-4">
            <div className="w-12 text-sm text-gray-500">{time}</div>
            <div className="flex-grow">Repas: <span className="font-bold">{r.total_carbs_g}g</span></div>
          </div>
        );
      case 'injection':
        const injection = event as Injection;
        return (
          <div className="flex items-center space-x-4">
            <div className="w-12 text-sm text-gray-500">{time}</div>
            <div className="flex-grow">Injection: <span className="font-bold">{injection.dose_U} U</span> ({injection.type})</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Journal</h1>
      <div className="space-y-4">
        {allEvents.length > 0 ? (
          allEvents.map((event, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
              {renderEvent(event)}
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
