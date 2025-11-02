

import React, { useState, useMemo } from 'react';
import { usePatientStore } from '../store/patientStore';
import { Injection, Mesure, Repas } from '../types';
import { MEAL_TIMES } from '../constants';

const SyringeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m18 2 4 4"></path><path d="m17 7 3-3"></path><path d="M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0L2.3 16.3a2.4 2.4 0 0 1 0-3.4Z"></path><path d="m14 11 3-3"></path><path d="M6 18l-2-2"></path><path d="m2 22 4-4"></path></svg>
);
const Wheat: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 22 16 8l-4-4-2 2 4 4-2.5 2.5-4.5 4.5-1.5-1.5z"></path><path d="m18 12 2-2-4.5-4.5-2 2 4.5 4.5z"></path><path d="M16 8s2-2 4-4"></path><path d="M18.5 4.5s2 2 4 4"></path></svg>
);
const Thermometer: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>
);
const ChevronDown: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);

type MealBlock = {
    repas: Repas;
    injection?: Injection;
    mesure?: Mesure;
}

const Accordion: React.FC<{
    title: string;
    icon: React.ReactNode;
    summary: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}> = ({ title, icon, summary, isOpen, onToggle, children }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <button onClick={onToggle} className="w-full p-3 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {icon}
                    </div>
                    <div className="text-left">
                        <p className="font-semibold">{title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{summary}</p>
                    </div>
                </div>
                <ChevronDown className={`w-6 h-6 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    {children}
                </div>
            </div>
        </div>
    )
}

const Journal: React.FC = () => {
    const { mesures, repas, injections } = usePatientStore();

    const allEvents = useMemo(() => [
        ...mesures.map(m => ({ ...m, type: 'mesure' as const })),
        ...repas.map(r => ({ ...r, type: 'repas' as const })),
        ...injections.map(i => ({ ...i, type: 'injection' as const })),
    ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()), [mesures, repas, injections]);
    
    // FIX: Define a union type for all possible events to help TypeScript's inference.
    type JournalEvent = typeof allEvents[number];

    // FIX: Explicitly cast the initial value of the reduce function to ensure correct type inference for `groupedByDay`.
    // This prevents `dayEvents` from being inferred as `unknown`.
    const groupedByDay = useMemo(() => allEvents.reduce((acc, event) => {
        const date = new Date(event.ts).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(event);
        return acc;
    }, {} as Record<string, JournalEvent[]>), [allEvents]);

    const eventsById = useMemo(() => new Map(allEvents.map(e => [e.id, e])), [allEvents]);

    const initialAccordionId = useMemo(() => {
        const firstDayKey = Object.keys(groupedByDay)[0];
        if (!firstDayKey) return '';
        
        const firstDayEvents = groupedByDay[firstDayKey];
        const firstRepas = firstDayEvents.find(e => e.type === 'repas');

        if (firstRepas) return `${firstDayKey}-${firstRepas.id}`;
        if (firstDayEvents.length > 0) return `${firstDayKey}-autres`;
        return '';
    }, [groupedByDay]);

    const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set(initialAccordionId ? [initialAccordionId] : []));
    
    const toggleAccordion = (id: string) => {
        setOpenAccordions(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) {
            newSet.delete(id);
          } else {
            newSet.add(id);
          }
          return newSet;
        });
    };

    const renderEventDetails = (event: any) => {
        const time = new Date(event.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        
        switch (event.type) {
          case 'mesure':
            return (
                <div className="flex items-center space-x-3">
                    <Thermometer className="w-5 h-5 text-red-500" />
                    <p>Glycémie: <span className="font-bold">{event.gly.toFixed(2)} g/L</span> à {time}</p>
                </div>
            );
          case 'injection':
             return (
                <div className="flex items-center space-x-3">
                    <SyringeIcon className="w-5 h-5 text-blue-500" />
                    <div>
                        <p>Injection: <span className="font-bold">{event.dose_U} U</span> ({event.type}) à {time}</p>
                        {event.calc_details && <p className="text-xs text-gray-500">{event.calc_details}</p>}
                    </div>
                </div>
            );
          default: return null;
        }
    }


    return (
    <div className="p-4 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Journal</h1>
        <div className="space-y-6">
        {Object.keys(groupedByDay).length > 0 ? (
            Object.entries(groupedByDay).map(([date, dayEvents]) => {
                const processedEventIds = new Set<string>();

                const mealBlocks: MealBlock[] = (dayEvents.filter(e => e.type === 'repas') as Repas[]).map(repasEvent => {
                    const block: MealBlock = { repas: repasEvent };
                    processedEventIds.add(repasEvent.id);

                    const linkedInjection = injections.find(i => i.lien_repas_id === repasEvent.id);
                    if (linkedInjection) {
                        block.injection = linkedInjection;
                        processedEventIds.add(linkedInjection.id);
                        if (linkedInjection.lien_mesure_id) {
                            block.mesure = eventsById.get(linkedInjection.lien_mesure_id) as Mesure | undefined;
                            if (block.mesure) processedEventIds.add(block.mesure.id);
                        }
                    }
                    return block;
                });

                const otherEvents = dayEvents.filter(e => !processedEventIds.has(e.id));

                return (
                    <div key={date}>
                        <h2 className="text-md font-semibold my-3 text-gray-700 dark:text-gray-300 sticky top-0 bg-gray-50 dark:bg-gray-900 py-2">{date}</h2>
                        <div className="space-y-2">
                           {mealBlocks.map(block => {
                               const accordionId = `${date}-${block.repas.id}`;
                               const time = new Date(block.repas.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                               return (
                                <Accordion
                                    key={accordionId}
                                    title={`${MEAL_TIMES[block.repas.moment]} - ${time}`}
                                    icon={<Wheat className="w-5 h-5 text-yellow-600" />}
                                    summary={`${block.repas.total_carbs_g.toFixed(0)}g | ${block.injection?.dose_U || '--'}U`}
                                    isOpen={openAccordions.has(accordionId)}
                                    onToggle={() => toggleAccordion(accordionId)}
                                >
                                    <div className="space-y-3">
                                        {block.mesure && renderEventDetails(block.mesure)}
                                        {block.injection && renderEventDetails(block.injection)}
                                        <div>
                                            <p className="font-semibold">Aliments:</p>
                                            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                                                {block.repas.items.map((item, i) => (
                                                    <li key={i}>{item.nom} ({item.carbs_g.toFixed(0)}g)</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </Accordion>
                               );
                           })}
                           {otherEvents.length > 0 && (
                                <Accordion
                                    key={`${date}-autres`}
                                    title="Autres Événements"
                                    icon={<SyringeIcon className="w-5 h-5 text-gray-500" />}
                                    summary={`${otherEvents.length} entrée(s)`}
                                    isOpen={openAccordions.has(`${date}-autres`)}
                                    onToggle={() => toggleAccordion(`${date}-autres`)}
                                >
                                    <div className="space-y-3">
                                        {otherEvents.map(event => (
                                            <div key={event.id} className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-md">
                                                {renderEventDetails(event)}
                                            </div>
                                        ))}
                                    </div>
                                </Accordion>
                           )}
                        </div>
                    </div>
                )
            })
        ) : (
            <p className="text-center text-gray-500 mt-8">Aucune donnée pour le moment.</p>
        )}
        </div>
    </div>
    );
};

export default Journal;