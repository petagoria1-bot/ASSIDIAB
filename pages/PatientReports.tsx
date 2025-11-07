import React, { useState, useEffect } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import useTranslations from '../hooks/useTranslations.ts';
import { Page } from '../types.ts';
import Card from '../components/Card.tsx';
import DateNavigator from '../components/DateNavigator.tsx';
import StatCard from '../components/StatCard.tsx';
import GlucoseChart from '../components/GlucoseChart.tsx';
import TargetIcon from '../components/icons/TargetIcon.tsx';
import ArrowUpIcon from '../components/icons/ArrowUpIcon.tsx';
import ArrowDownIcon from '../components/icons/ArrowDownIcon.tsx';

const PatientReports: React.FC<{ setCurrentPage: (page: Page) => void }> = ({ setCurrentPage }) => {
    const { patient, reportData, loadReportDataForDay, exportPatientPdf, isLoading } = usePatientStore();
    const t = useTranslations();
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const dayId = currentDate.toISOString().split('T')[0];
        loadReportDataForDay(dayId);
    }, [currentDate, loadReportDataForDay]);
    
    const handleExport = () => {
        const from = new Date(currentDate);
        from.setDate(from.getDate() - 7);
        const to = new Date(currentDate);
        exportPatientPdf({
            from: from.toISOString().split('T')[0],
            to: to.toISOString().split('T')[0],
        });
    };

    if (!patient) return null;
    const { summary, entries } = reportData;

    return (
        <div className="pb-24 min-h-screen bg-off-white">
            <header className="sticky top-0 bg-jade/90 backdrop-blur-md py-4 z-20 shadow-md">
                <div className="px-4 flex items-center justify-center relative">
                    <h1 className="text-3xl font-display font-bold text-white text-shadow text-center">{t.reports_title}</h1>
                </div>
                <div className="px-4 mt-2">
                    <DateNavigator currentDate={currentDate} setCurrentDate={setCurrentDate} viewMode="day" />
                </div>
            </header>

            <div className="p-4 space-y-4">
                {isLoading ? (
                    <Card><p className="text-center py-10 text-text-muted">{t.common_loading}</p></Card>
                ) : summary && summary.count > 0 ? (
                    <>
                        <Card>
                            <h2 className="text-lg font-semibold text-text-title mb-3">{t.reports_keyStats}</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <StatCard title={t.reports_avgGlucose} value={`${summary.avg.toFixed(2)} g/L`} />
                                <StatCard title={t.reports_tir} value={`${summary.tir}%`} icon={<TargetIcon className="w-4 h-4 text-jade" />} />
                                <StatCard title={t.reports_hypos} value={summary.hypo.toString()} icon={<ArrowDownIcon className="w-4 h-4 text-warning" />} />
                                <StatCard title={t.reports_hypers} value={summary.hyper.toString()} icon={<ArrowUpIcon className="w-4 h-4 text-danger" />} />
                            </div>
                        </Card>

                        <Card>
                            <h2 className="text-lg font-semibold text-text-title mb-3">{t.reports_dailyChart}</h2>
                            <GlucoseChart events={entries as any} patient={patient} />
                        </Card>
                        
                        <button onClick={handleExport} className="w-full bg-white text-jade font-bold py-3 rounded-button border border-slate-300 hover:bg-mint-soft/50 transition-colors">
                            Exporter le rapport PDF (7 jours)
                        </button>
                    </>
                ) : (
                    <Card>
                        <div className="text-center py-12">
                            <p className="text-text-muted font-semibold">{t.reports_noData}</p>
                            <p className="text-sm text-text-muted mt-1">{t.reports_selectDayWithData}</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default PatientReports;