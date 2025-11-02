
import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { usePatientStore } from './store/patientStore';
import { useAuthStore } from './store/authStore';

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

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">Chargement...</div>
);

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  
  const { isAuthenticated, isLoading: isAuthLoading, checkSession, currentUser } = useAuthStore();
  const { patient, isLoading: isPatientLoading, loadInitialData, clearPatientData } = usePatientStore();
  
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (currentUser && typeof currentUser.id === 'number') {
      loadInitialData(currentUser.id);
    } else {
      clearPatientData();
    }
  }, [currentUser, loadInitialData, clearPatientData]);

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
        return <Journal />;
      case 'calculator':
        return <DoseCalculator setCurrentPage={setCurrentPage} />;
      case 'emergency':
        return <Emergency />;
      case 'settings':
        return <Settings setCurrentPage={setCurrentPage} />;
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
