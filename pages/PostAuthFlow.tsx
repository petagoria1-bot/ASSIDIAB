import React, { useEffect, useState } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import { useAuthStore } from '../store/authStore.ts';
import Onboarding from './Onboarding.tsx';
import Dashboard from './Dashboard.tsx';
import DoseCalculator from './DoseCalculator.tsx';
import Journal from './Journal.tsx';
import Reports from './Reports.tsx';
import Settings from './Settings.tsx';
import Emergency from './Emergency.tsx';
import Pai from './Pai.tsx';
import FoodLibrary from './FoodLibrary.tsx';
import Inbox from './Inbox.tsx';
import Illustrations from './Illustrations.tsx';
import History from './History.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { Page } from '../types.ts';
import RoleConfirmationModal from '../components/RoleConfirmationModal.tsx';
import LoadingScreen from '../components/LoadingScreen.tsx';
import useTranslations from '../hooks/useTranslations.ts';
import EmergencyIcon from '../components/icons/EmergencyIcon.tsx';

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
        <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-main-gradient text-white text-center">
            <EmergencyIcon className="w-16 h-16 text-white mb-4" />
            <h1 className="text-2xl font-bold mb-4">{t.error_criticalTitle}</h1>
            <p className="mb-6 max-w-sm">{t.error_loadDataBody}</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                <button onClick={handleRetry} className="w-full bg-white text-emerald-main font-bold py-3 rounded-button hover:bg-slate-100 transition-colors shadow-md">
                    {t.error_retry}
                </button>
                <button onClick={logout} className="w-full border-2 border-white text-white font-bold py-3 rounded-button hover:bg-white/10 transition-colors">
                    {t.settings_logout}
                </button>
            </div>
        </div>
    );
};


const PostAuthFlow: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { patient, pendingInvitation, isLoading, loadPatientData, error } = usePatientStore();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  useEffect(() => {
    if (currentUser) {
      loadPatientData(currentUser);
    }
  }, [currentUser, loadPatientData]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
      return <DataLoadError />;
  }

  if (pendingInvitation) {
    return <RoleConfirmationModal />;
  }
  
  if (!patient) {
    return <Onboarding />;
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