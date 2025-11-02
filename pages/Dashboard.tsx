
import React from 'react';
import { usePatientStore } from '../store/patientStore';
import { Page, Mesure, Repas, Injection } from '../types';
import { MEAL_TIMES } from '../constants';
import { Droplets, Wheat } from 'lucide-react';

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

// FIX: Added DashboardProps interface to define props for the Dashboard component.
interface DashboardProps {
  setCurrentPage: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage }) => {
  const { patient, mesures, repas, injections } = usePatientStore();
  
  const lastMesure = mesures[0];
  const lastRepas = [...repas].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())[0];
  const lastInjection = [...injections].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())[0];

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <header>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bonjour, {patient?.prenom}</h1>
        <p className="text-gray-500 dark:text-gray-400">Voici votre résumé journalier.</p>
      </header>
      
      <GlucoseCard mesure={lastMesure} />
      
      {patient && <GlucoseChart mesures={mesures} cibles={patient.cibles} />}

      <div className="text-center">
        <button 
          onClick={() => setCurrentPage('calculator')}
          className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-full shadow-lg hover:bg-blue-700 transition-colors text-lg"
        >
          Calculer ma dose maintenant
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InfoCard title="Dernier Repas" data={lastRepas} />
        <InfoCard title="Dernière Dose" data={lastInjection} />
      </div>
    </div>
  );
};

export default Dashboard;