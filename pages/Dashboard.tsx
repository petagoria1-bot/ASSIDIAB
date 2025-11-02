
import React, { useState } from 'react';
import { usePatientStore } from '../store/patientStore';
import { Page, Mesure, Repas, Injection, InjectionType } from '../types';
import { MEAL_TIMES } from '../constants';
import QuickBolusModal from '../components/QuickBolusModal';
import toast from 'react-hot-toast';

const Droplets: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.49-2.2-1.25-3.25A4.42 4.42 0 0 0 11 6.05c0-2.23-1.8-4.05-4-4.05S3 3.82 3 6.05c0 1.16.49 2.2 1.25 3.25A4.42 4.42 0 0 0 3 12.25C3 14.47 4.8 16.3 7 16.3z"></path><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.54 2.52 2.55 4.5 5 5 .44 2.45-.56 4.95-2.42 6.62"></path></svg>
);
const Wheat: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 22 16 8l-4-4-2 2 4 4-2.5 2.5-4.5 4.5-1.5-1.5z"></path><path d="m18 12 2-2-4.5-4.5-2 2 4.5 4.5z"></path><path d="M16 8s2-2 4-4"></path><path d="M18.5 4.5s2 2 4 4"></path></svg>
);
const SyringeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m18 2 4 4"></path><path d="m17 7 3-3"></path><path d="M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0L2.3 16.3a2.4 2.4 0 0 1 0-3.4Z"></path><path d="m14 11 3-3"></path><path d="M6 18l-2-2"></path><path d="m2 22 4-4"></path></svg>
);


const GlucoseCard: React.FC<{ mesure?: Mesure }> = ({ mesure }) => {
    const getTrendArrow = () => '→'; // Placeholder for sensor trend
    const value = mesure ? mesure.gly.toFixed(2) : '--';
    const unit = 'g/L';

    const getColor = () => {
        if (!mesure) return 'text-gray-500';
        if (mesure.gly < 0.8) return 'text-red-500';
        if (mesure.gly > 1.6) return 'text-yellow-500';
        return 'text-green-500';
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dernière Glycémie</p>
                <p className={`text-4xl font-bold ${getColor()}`}>{value} <span className="text-lg">{unit}</span></p>
                <p className="text-xs text-gray-400">{mesure ? new Date(mesure.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Pas de mesure'}</p>
            </div>
            <div className="text-4xl">{getTrendArrow()}</div>
        </div>
    );
};

const GlucoseChart: React.FC<{ mesures: Mesure[], cibles: { gly_min: number, gly_max: number } }> = ({ mesures, cibles }) => {
    const now = new Date().getTime();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const chartData = mesures
        .filter(m => new Date(m.ts).getTime() > oneDayAgo)
        .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

    if (chartData.length < 2) {
        return (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-center h-48">
                <p className="text-gray-500 dark:text-gray-400">Pas assez de données pour afficher le graphique.</p>
            </div>
        );
    }
    
    const width = 300;
    const height = 150;
    const padding = { top: 20, right: 20, bottom: 30, left: 30 };

    const minGly = 0;
    const maxGly = Math.max(...chartData.map(d => d.gly), cibles.gly_max) * 1.1;
    const startTime = new Date(chartData[0].ts).getTime();
    const endTime = new Date(chartData[chartData.length - 1].ts).getTime();
    const timeRange = Math.max(endTime - startTime, 1);
    
    const scaleX = (time: number) => padding.left + ((time - startTime) / timeRange) * (width - padding.left - padding.right);
    const scaleY = (gly: number) => padding.top + (height - padding.top - padding.bottom) * (1 - (gly - minGly) / (maxGly - minGly));

    const linePath = chartData
        .map((d, i) => {
            const x = scaleX(new Date(d.ts).getTime());
            const y = scaleY(d.gly);
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ');

    const getPointColor = (gly: number) => {
        if (gly < cibles.gly_min) return 'fill-red-500';
        if (gly > cibles.gly_max) return 'fill-yellow-500';
        return 'fill-green-500';
    }

    const yAxisLabels = Array.from(new Set([minGly, cibles.gly_min, cibles.gly_max, Math.round(maxGly)]));
    
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Glycémie des 24h</h3>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-label="Graphique des glycémies des 24 dernières heures">
                <rect 
                    x={padding.left}
                    y={scaleY(cibles.gly_max)} 
                    width={width - padding.left - padding.right} 
                    height={scaleY(cibles.gly_min) - scaleY(cibles.gly_max)}
                    className="fill-green-500/10"
                />
                {yAxisLabels.map(label => (
                    <g key={label}>
                        <line x1={padding.left} y1={scaleY(label)} x2={width - padding.right} y2={scaleY(label)} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="0.5" />
                        <text x={padding.left - 5} y={scaleY(label) + 3} className="text-[8px] fill-gray-500 dark:fill-gray-400" textAnchor="end">{label.toFixed(2)}</text>
                    </g>
                ))}
                <text x={padding.left} y={height - 5} className="text-[8px] fill-gray-500 dark:fill-gray-400" textAnchor="start">{new Date(startTime).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</text>
                <text x={width - padding.right} y={height - 5} className="text-[8px] fill-gray-500 dark:fill-gray-400" textAnchor="end">{new Date(endTime).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</text>
                <path d={linePath} className="stroke-blue-500 fill-none" strokeWidth="2" />
                {chartData.map(d => (
                    <circle 
                        key={d.id} 
                        cx={scaleX(new Date(d.ts).getTime())} 
                        cy={scaleY(d.gly)} 
                        r="3" 
                        className={getPointColor(d.gly)}
                    >
                      <title>{`Glycémie: ${d.gly.toFixed(2)} g/L à ${new Date(d.ts).toLocaleTimeString('fr-FR')}`}</title>
                    </circle>
                ))}
            </svg>
        </div>
    );
}

const InfoCard: React.FC<{ title: string; data?: Repas | Injection }> = ({ title, data }) => {
    let content = <p className="text-gray-500 dark:text-gray-400 text-sm">Aucune donnée</p>;
    let icon = null;

    if (data) {
        const time = new Date(data.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        if ('total_carbs_g' in data) {
            icon = <Wheat className="w-6 h-6 text-yellow-600" />;
            content = (
                <div>
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{data.total_carbs_g.toFixed(0)} g</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{time} - {MEAL_TIMES[data.moment]}</p>
                </div>
            );
        } else if ('dose_U' in data) {
            icon = <Droplets className="w-6 h-6 text-blue-500" />;
            content = (
                <div>
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{data.dose_U} U</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{time} - {data.type}</p>
                </div>
            );
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
            <div className="flex items-center space-x-3">
                {icon}
                {content}
            </div>
        </div>
    )
}

interface DashboardProps {
  setCurrentPage: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage }) => {
  const { patient, mesures, repas, injections, addInjection } = usePatientStore();
  const [isBolusModalOpen, setIsBolusModalOpen] = useState(false);
  
  const lastMesure = mesures[0];
  const lastRepas = repas[0];
  const lastInjection = injections[0];

  const handleConfirmBolus = async (dose: number, type: InjectionType, ts: string) => {
    await addInjection({
      dose_U: dose,
      type: type,
    }, ts);
    toast.success(`Bolus de ${dose}U (${type}) enregistré !`);
    setIsBolusModalOpen(false);
  };

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <header>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bonjour, {patient?.prenom}</h1>
        <p className="text-gray-500 dark:text-gray-400">Voici votre résumé journalier.</p>
      </header>
      
      <GlucoseCard mesure={lastMesure} />
      
      {patient && patient.cibles && <GlucoseChart mesures={mesures} cibles={patient.cibles} />}

      <div className="text-center">
        <button 
          onClick={() => setCurrentPage('calculator')}
          className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-full shadow-lg hover:bg-blue-700 transition-colors text-lg"
        >
          Calculer ma dose maintenant
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Actions Rapides</h3>
        <button 
          onClick={() => setIsBolusModalOpen(true)}
          className="w-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-bold py-3 px-4 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors flex items-center justify-center gap-2"
        >
          <SyringeIcon className="w-5 h-5" />
          <span>Ajouter un bolus</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InfoCard title="Dernier Repas" data={lastRepas} />
        <InfoCard title="Dernière Dose" data={lastInjection} />
      </div>

      {isBolusModalOpen && (
        <QuickBolusModal
            onClose={() => setIsBolusModalOpen(false)}
            onConfirm={handleConfirmBolus}
        />
      )}
    </div>
  );
};

export default Dashboard;
