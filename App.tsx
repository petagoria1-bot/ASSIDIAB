
import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { usePatientStore } from './store/patientStore';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import DoseCalculator from './pages/DoseCalculator';
import Journal from './pages/Journal';
import FoodLibrary from './pages/FoodLibrary';
import Emergency from './pages/Emergency';
import Pai from './pages/Pai';
import Onboarding from './pages/Onboarding';
import BottomNav from './components/BottomNav';
import { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const { patient, loadInitialData } = usePatientStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadInitialData();
      setIsLoading(false);
    };
    init();
  }, [loadInitialData]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">Chargement...</div>;
  }

  if (!patient) {
    return <Onboarding />;
  }
  
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'journal':
        return <Journal />;
      case 'calculator':
        return <DoseCalculator setCurrentPage={setCurrentPage} />;
      case 'emergency':
        return <Emergency />;
      case 'settings':
        return <Settings />;
      case 'food':
        return <FoodLibrary />;
      case 'pai':
        return <Pai />;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <Toaster position="top-center" />
      <div className="pb-20"> 
        {renderPage()}
      </div>
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default App;
