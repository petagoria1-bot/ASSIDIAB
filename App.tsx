import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { usePatientStore } from './store/patientStore';
import { useAuthStore } from './store/authStore';
import { useSettingsStore, Language } from './store/settingsStore';

// Fix: Corrected import paths
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import DoseCalculator from './pages/DoseCalculator';
import Journal from './pages/Journal';
import FoodLibrary from './pages/FoodLibrary';
import Emergency from './pages/Emergency';
import Pai from './pages/Pai';
import Onboarding from './pages/Onboarding';
import BottomNav from './components/BottomNav';
import AuthPage from './pages/AuthPage';
import { Page } from './types';
import Reports from './pages/Reports';
import useTranslations from './hooks/useTranslations';
import DropletLogoIcon from './components/icons/DropletLogoIcon';

const Loader: React.FC = () => (
    <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-jade-deep rounded-full animate-[loader-spin_1.5s_cubic-bezier(.25,.8,.25,1)_infinite]"></div>
        <div className="absolute inset-0 flex items-center justify-center animate-[loader-beat_2.5s_ease-in-out_infinite]">
            <DropletLogoIcon className="w-12 h-12" />
        </div>
        <div className="absolute inset-[-10px] border-2 border-turquoise-light rounded-full opacity-50 animate-[halo-pulse_2.5s_ease-in-out_infinite]"></div>
    </div>
);


const LoadingScreen: React.FC = () => {
  const t = useTranslations();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-off-white font-sans text-text-muted space-y-4">
        <Loader />
        <p>{t.common_loading}...</p>
    </div>
  );
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  
  const { isAuthenticated, isLoading: isAuthLoading, checkSession, currentUser } = useAuthStore();
  const { patient, isLoading: isPatientLoading, loadInitialData, clearPatientData } = usePatientStore();
  const { language } = useSettingsStore();
  const rtlLangs: Language[] = ['ar', 'ur', 'ps'];
  
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (currentUser && currentUser.uid) {
      loadInitialData(currentUser.uid);
    } else {
      clearPatientData();
    }
  }, [currentUser, loadInitialData, clearPatientData]);
  
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = rtlLangs.includes(language) ? 'rtl' : 'ltr';
  }, [language]);

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }
  
  if (isPatientLoading) {
    return <LoadingScreen />;
  }

  if (!patient) {
    return <Onboarding />;
  }
  
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'journal':
        return <Journal setCurrentPage={setCurrentPage} />;
      case 'glucides':
        return <DoseCalculator setCurrentPage={setCurrentPage} />;
      case 'emergency':
        return <Emergency />;
      case 'settings':
        return <Settings setCurrentPage={setCurrentPage} />;
      case 'food':
        return <FoodLibrary />;
      case 'pai':
        return <Pai />;
      case 'rapports':
        return <Reports setCurrentPage={setCurrentPage} />;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen text-text-main font-sans bg-main-gradient">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'rgba(249, 250, 251, 0.8)', // off-white with opacity
            color: '#1E293B',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0,0,0,0.05)',
            borderRadius: '14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          },
        }}
      />
      <main className="max-w-lg mx-auto relative">
        <div className="pb-28" key={currentPage}> 
          <div className="animate-page-slide-in">
            {renderPage()}
          </div>
        </div>
      </main>
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default App;