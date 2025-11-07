import React, { useEffect, useState } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import { useAuthStore } from '../store/authStore.ts';
import InitialSetup from './InitialSetup.tsx';
import Dashboard from './Dashboard.tsx';
import DoseCalculator from './DoseCalculator.tsx';
import Journal from './Journal.tsx';
import Reports from './Reports.tsx';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import Settings from './Settings.tsx';
import Emergency from './Emergency.tsx';
import Pai from './Pai.tsx';
import FoodLibrary from './FoodLibrary.tsx';
import Inbox from './Inbox.tsx';
import Illustrations from './Illustrations.tsx';
import History from './History.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { Page } from '../types.ts';
import LoadingScreen from '../components/LoadingScreen.tsx';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';
import ErrorIcon from '../components/icons/ErrorIcon.tsx';

const DataLoadError: React.FC = () => {
    const { logout, currentUser } = useAuthStore();
    const { loadPatientData } = usePatientStore();
    const t = useTranslations();

    const handleRetry = () => {
        if (currentUser) {
            loadPatientData(currentUser);
        }
    };
    
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-5 bg-gradient-to-b from-emerald-main to-jade-deep-dark text-white text-center">
            <ErrorIcon className="w-20 h-20 mb-4" />
            <h1 className="text-3xl font-display font-bold mb-2">{t.error_criticalTitle}</h1>
            <p className="mb-8 max-w-sm opacity-90">{t.error_loadDataBody}</p>
            <div className="flex flex-col gap-4 w-full max-w-xs">
                <button onClick={handleRetry} className="w-full bg-white text-jade-deep-dark font-bold py-3 rounded-pill hover:bg-slate-100 transition-colors shadow-lg">
                    {t.error_retry}
                </button>
                <button onClick={logout} className="w-full border-2 border-white text-white font-bold py-3 rounded-pill hover:bg-white/10 transition-colors">
                    {t.settings_logout}
                </button>
            </div>
        </div>
    );
};


const PostAuthFlow: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { patient, isLoading, loadPatientData, error } = usePatientStore();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  useEffect(() => {
    if (currentUser && !patient) {
      loadPatientData(currentUser);
    }
  }, [currentUser, patient, loadPatientData]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
      return <DataLoadError />;
  }
  
  if (!patient) {
    return <InitialSetup />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'glucides':
        return <DoseCalculator setCurrentPage={setCurrentPage} />;
      case 'journal':
        return <Journal setCurrentPage={setCurrentPage} />;
      case 'history':
        return <History setCurrentPage={setCurrentPage} />;
      case 'rapports':
        return <Reports setCurrentPage={setCurrentPage} />;
      case 'settings':
        return <Settings setCurrentPage={setCurrentPage} />;
      case 'emergency':
        return <Emergency />;
      case 'pai':
        return <Pai />;
      case 'food':
        return <FoodLibrary />;
      case 'inbox':
        return <Inbox setCurrentPage={setCurrentPage} />;
      case 'illustrations':
          return <Illustrations setCurrentPage={setCurrentPage} />;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="pb-20">
      {renderPage()}
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default PostAuthFlow;
