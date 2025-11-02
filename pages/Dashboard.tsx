
import React from 'react';
import { usePatientStore } from '../store/patientStore';
import { Page, Mesure } from '../types';

interface DashboardProps {
  setCurrentPage: (page: Page) => void;
}

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
                <p className="text-xs text-gray-400">{mesure ? new Date(mesure.ts).toLocaleTimeString('fr-FR') : 'Pas de mesure'}</p>
            </div>
            <div className="text-4xl">{getTrendArrow()}</div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage }) => {
  const { patient, mesures } = usePatientStore();
  const lastMesure = mesures[0];

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <header>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bonjour, {patient?.prenom}</h1>
        <p className="text-gray-500 dark:text-gray-400">Voici votre résumé journalier.</p>
      </header>
      
      <GlucoseCard mesure={lastMesure} />

      <div className="text-center">
        <button 
          onClick={() => setCurrentPage('calculator')}
          className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-full shadow-lg hover:bg-blue-700 transition-colors text-lg"
        >
          Calculer ma dose maintenant
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Dernier Repas</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">--</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Dernière Dose</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">--</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
