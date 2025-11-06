
import React, { useEffect, useState } from 'react';
import { usePatientStore } from '../store/patientStore';
import { useAuthStore } from '../store/authStore';
import Onboarding from './Onboarding';
import Dashboard from './Dashboard';
import DoseCalculator from './DoseCalculator';
import Journal from './Journal';
import Reports from './Reports';
import Settings from './Settings';
import Emergency from './Emergency';
import Pai from './Pai';
import FoodLibrary from './FoodLibrary';
import Inbox from './Inbox';
import Illustrations from './Illustrations';
import BottomNav from '../components/BottomNav';
import { Page } from '../types';
import RoleConfirmationModal from '../components/RoleConfirmationModal';
import LoadingScreen from '../components/LoadingScreen';

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
