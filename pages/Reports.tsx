import React, { useState, useMemo } from 'react';
import { usePatientStore } from '../store/patientStore';
import { Page, Mesure, Repas, Injection } from '../types';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import GlucoseChart from '../components/GlucoseChart';

interface ReportsProps {
  setCurrentPage: (page: Page) => void;
}

const ArrowLeftIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;

type PeriodDays = 7 | 14 | 30;

const Reports: React.FC<ReportsProps> = ({ setCurrentPage }) => {
  const { patient, mesures, repas, injections } = usePatientStore();
  const [period, setPeriod] = useState<PeriodDays>(7);

  const { filteredMesures, stats } = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - period);

    const filtered = mesures.filter(m => {
        const mesureDate = new Date(m.ts);
        return mesureDate >= startDate && mesureDate <= endDate;
    });

    if (!patient || filtered.length === 0) {
      return { filteredMesures: [], stats: { tir: 0, avg: 0, hypo: 0, hyper: 0 } };
    }
    
    const inRange = filtered.filter(m => m.gly >= patient.cibles.gly_min && m.gly <= patient.cibles.gly_max).length;
    const hypo = filtered.filter(m => m.gly < patient.cibles.gly_min).length;
    const hyper = filtered.filter(m => m.gly > patient.cibles.gly_max).length;
    const sum = filtered.reduce((acc, m) => acc + m.gly, 0);

    return {
        filteredMesures: filtered,
        stats: {
            tir: Math.round((inRange / filtered.length) * 100),
            avg: sum / filtered.length,
            hypo,
            hyper
        }
    };
  }, [period, mesures, patient]);
  
  const eventsByDay = useMemo(() => {
    const allEvents = [
        ...mesures.map(e => ({ ...e, type: 'mesure' })),
        ...repas.map(e => ({ ...e, type: 'repas' })),
        ...injections.map(e => ({ ...e, type: 'injection' }))
    ];

    return allEvents.reduce((acc, event) => {
        const day = new Date(event.ts).toISOString().split('T')[0];
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push(event);
        return acc;
    }, {} as Record<string, (Mesure | Repas | Injection)[]>);
  }, [mesures, repas, injections]);
  
  const availableDays = useMemo(() => Object.keys(eventsByDay).sort((a,b) => b.localeCompare(a)), [eventsByDay]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const selectedDate = availableDays[selectedDayIndex];
  const eventsForSelectedDay = selectedDate ? eventsByDay[selectedDate] : [];

  const handlePrevDay = () => setSelectedDayIndex(prev => Math.min(prev + 1, availableDays.length - 1));
  const handleNextDay = () => setSelectedDayIndex(prev => Math.max(prev - 1, 0));

  if (!patient) return null;

  return (
    <div className="p-4 space-y-5 animate-fade-in">
        <header className="flex items-center justify-between py-4 text-white">
            <button onClick={() => setCurrentPage('dashboard')} className="p-2 -ml-2">
                <ArrowLeftIcon />
            </button>
            <h1 className="text-3xl font-display font-bold text-shadow text-center">
                Rapports
            </h1>
            <div className="w-8"></div>
        </header>
        
        <div className="bg-white/20 p-1 rounded-pill flex justify-center items-center backdrop-blur-sm">
            {[7, 14, 30].map(p => (
                <button 
                    key={p} 
                    onClick={() => setPeriod(p as PeriodDays)}
                    className={`w-full py-2 text-sm font-semibold rounded-pill transition-colors ${period === p ? 'bg-white text-emerald-main shadow' : 'text-white/80'}`}
                >
                    {p} jours
                </button>
            ))}
        </div>

        <Card>
            <h2 className="text-xl font-display font-semibold text-text-title mb-3">Statistiques Clés</h2>
            {filteredMesures.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                    <StatCard title="Temps dans la cible" value={`${stats.tir}%`} />
                    <StatCard title="Glycémie moyenne" value={`${stats.avg.toFixed(2)} g/L`} />
                    <StatCard title="Hypoglycémies" value={`${stats.hypo}`} />
                    <StatCard title="Hyperglycémies" value={`${stats.hyper}`} />
                </div>
            ) : (
                <p className="text-center text-text-muted py-4">Pas de données pour cette période.</p>
            )}
        </Card>
        
        <Card>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-display font-semibold text-text-title">Graphique Journalier</h2>
                    <p className="text-sm text-text-muted">{selectedDate ? new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : "Aucune donnée"}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handlePrevDay} disabled={selectedDayIndex >= availableDays.length - 1} className="px-3 py-1 bg-input-bg rounded-md disabled:opacity-50">Préc.</button>
                    <button onClick={handleNextDay} disabled={selectedDayIndex === 0} className="px-3 py-1 bg-input-bg rounded-md disabled:opacity-50">Suiv.</button>
                </div>
            </div>
            {eventsForSelectedDay.length > 0 ? (
                <GlucoseChart events={eventsForSelectedDay} patient={patient} />
            ) : (
                <div className="h-64 flex items-center justify-center text-text-muted">
                    <p>Sélectionnez un jour avec des données.</p>
                </div>
            )}
        </Card>
    </div>
  );
};

export default Reports;
