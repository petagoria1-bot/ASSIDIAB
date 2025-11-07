import React, { useState, useMemo } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import { Page, Mesure, Repas, Injection } from '../types.ts';
import Card from '../components/Card.tsx';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';
import StatCard from '../components/StatCard.tsx';
import GlucoseChart from '../components/GlucoseChart.tsx';
import TargetIcon from '../components/icons/TargetIcon.tsx';
import DropletIcon from '../components/icons/DropletIcon.tsx';
import ArrowDownIcon from '../components/icons/ArrowDownIcon.tsx';
import ArrowUpIcon from '../components/icons/ArrowUpIcon.tsx';

interface ReportsProps {
  setCurrentPage: (page: Page) => void;
}

type ChartEvent = (Mesure | Repas | Injection) & { type: 'mesure' | 'repas' | 'injection' };

const Reports: React.FC<ReportsProps> = ({ setCurrentPage }) => {
  const { patient, mesures, repas, injections } = usePatientStore();
  const t = useTranslations();
  const [days, setDays] = useState(7);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredMesures = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    return mesures.filter(m => {
      const date = new Date(m.ts);
      return date >= startDate && date <= endDate;
    });
  }, [mesures, days]);

  const stats = useMemo(() => {
    if (!patient || filteredMesures.length === 0) {
      return { tir: 0, avg: 0, hypos: 0, hypers: 0 };
    }
    const total = filteredMesures.length;
    const inRange = filteredMesures.filter(m => m.gly >= patient.cibles.gly_min && m.gly <= patient.cibles.gly_max).length;
    const tir = (inRange / total) * 100;
    const avg = filteredMesures.reduce((sum, m) => sum + m.gly, 0) / total;
    const hypos = filteredMesures.filter(m => m.gly < patient.cibles.gly_min).length;
    const hypers = filteredMesures.filter(m => m.gly > patient.cibles.gly_max).length;
    return { tir, avg, hypos, hypers };
  }, [filteredMesures, patient]);

  const dailyEvents = useMemo(() => {
    const selectedDay = new Date(selectedDate).toDateString();
    return [
      ...mesures.filter(m => new Date(m.ts).toDateString() === selectedDay).map(e => ({ ...e, type: 'mesure' as const })),
      ...repas.filter(r => new Date(r.ts).toDateString() === selectedDay).map(e => ({ ...e, type: 'repas' as const })),
      ...injections.filter(i => new Date(i.ts).toDateString() === selectedDay).map(e => ({ ...e, type: 'injection' as const })),
    ] as ChartEvent[];
  }, [selectedDate, mesures, repas, injections]);
  
  if (!patient) return null;

  return (
    <div className="p-4 space-y-4 pb-24">
      <header className="py-4 text-center">
        <h1 className="text-3xl font-display font-bold text-white text-shadow">{t.reports_title}</h1>
      </header>

      <div className="flex justify-center bg-white/30 backdrop-blur-sm p-1 rounded-pill shadow-sm">
        {[7, 14, 30, 90].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`flex-1 py-2 rounded-pill text-sm font-semibold transition-colors ${days === d ? 'bg-white text-text-title shadow' : 'text-white/80'}`}
          >
            {t.reports_days(d)}
          </button>
        ))}
      </div>
      
      <Card>
        <h2 className="text-lg font-semibold text-text-title mb-3">{t.reports_keyStats}</h2>
        {filteredMesures.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            <StatCard title={t.reports_tir} value={`${stats.tir.toFixed(0)}%`} icon={<TargetIcon className="w-4 h-4 text-emerald-main"/>} />
            <StatCard title={t.reports_avgGlucose} value={`${stats.avg.toFixed(2)} g/L`} icon={<DropletIcon className="w-4 h-4 text-blue-500"/>} />
            <StatCard title={t.reports_hypos} value={stats.hypos.toString()} icon={<ArrowDownIcon className="w-4 h-4 text-warning"/>} />
            <StatCard title={t.reports_hypers} value={stats.hypers.toString()} icon={<ArrowUpIcon className="w-4 h-4 text-danger"/>} />
          </div>
        ) : (
          <p className="text-center text-text-muted p-4">{t.reports_noDataPeriod}</p>
        )}
      </Card>
      
      <Card>
        <h2 className="text-lg font-semibold text-text-title mb-3">{t.reports_dailyChart}</h2>
        <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2 bg-input-bg rounded-md border border-slate-200 mb-4"
        />
        {dailyEvents.filter(e => e.type === 'mesure').length > 0 ? (
            <GlucoseChart events={dailyEvents} patient={patient}/>
        ) : (
            <div className="text-center p-8 text-text-muted">
                <p>{t.reports_noData}</p>
                <p className="text-sm">{t.reports_selectDayWithData}</p>
            </div>
        )}
      </Card>

    </div>
  );
};

export default Reports;