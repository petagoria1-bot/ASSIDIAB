

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
import BottomNav from '../components/BottomNav.tsx';
import { Page } from '../types.ts';
import RoleConfirmationModal from '../components/RoleConfirmationModal.tsx';
import LoadingScreen from '../components/LoadingScreen.tsx';

const PostAuthFlow: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { patient, pendingInvitation, isLoading, loadPatientData } = usePatientStore();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  useEffect(() => {
    if (currentUser) {
      loadPatientData(currentUser);
    }
  }, [currentUser, loadPatientData]);

  if (isLoading) {
    return <LoadingScreen />;
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