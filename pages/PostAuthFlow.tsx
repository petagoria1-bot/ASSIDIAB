import React, { useState } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import { useAuthStore } from '../store/authStore.ts';
import RoleSelectionPage from './RoleSelectionPage.tsx';
import InitialSetup from './InitialSetup.tsx';
import Dashboard from './Dashboard.tsx';
import DoseCalculator from './DoseCalculator.tsx';
import Journal from './Journal.tsx';
import DoctorDashboard from './DoctorDashboard.tsx';
import Settings from './Settings.tsx';
import Emergency from './Emergency.tsx';
import Pai from './Pai.tsx';
import FoodLibrary from './FoodLibrary.tsx';
import Inbox from './Inbox.tsx';
import Illustrations from './Illustrations.tsx';
import DoctorPatientView from './DoctorPatientView.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { Page } from '../types.ts';
import LoadingScreen from '../components/LoadingScreen.tsx';
import useTranslations from '../hooks/useTranslations.ts';
import InvitationResponsePage from './InvitationResponsePage.tsx';
import CaregiverDashboard from './CaregiverDashboard.tsx';
import PatientReports from './PatientReports.tsx';

const PostAuthFlow: React.FC = () => {
  const { userProfile, status } = useAuthStore();
  const { patient, loadStatus, error: patientError } = usePatientStore();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const t = useTranslations();

  if (status === 'loading' || status === 'idle' || !userProfile) {
    return <LoadingScreen />;
  }

  if (status === 'needs_role') {
    return <RoleSelectionPage />;
  }

  // --- PATIENT FLOW ---
  if (userProfile.role === 'patient') {
    if (status === 'needs_patient_profile') {
      return <InitialSetup />;
    }
    if (loadStatus === 'loading') {
      return <LoadingScreen />;
    }
    if (loadStatus === 'error') {
      return <div className="p-4 text-center text-danger">{patientError}</div>;
    }
    if (patient) {
      const renderPage = () => {
        switch (currentPage) {
          case 'dashboard': return <Dashboard setCurrentPage={setCurrentPage} />;
          case 'glucides': return <DoseCalculator setCurrentPage={setCurrentPage} />;
          case 'journal': return <Journal setCurrentPage={setCurrentPage} />;
          case 'rapports': return <PatientReports setCurrentPage={setCurrentPage} />;
          case 'settings': return <Settings setCurrentPage={setCurrentPage} />;
          case 'emergency': return <Emergency />;
          case 'pai': return <Pai />;
          case 'food': return <FoodLibrary />;
          case 'inbox': return <Inbox setCurrentPage={setCurrentPage} />;
          case 'illustrations': return <Illustrations setCurrentPage={setCurrentPage} />;
          default: return <Dashboard setCurrentPage={setCurrentPage} />;
        }
      };

      return (
        <div className="pb-20">
          {renderPage()}
          <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
      );
    }
    return <LoadingScreen />; // Patient exists but not loaded yet
  }

  // --- DOCTOR & OTHER ROLES FLOW ---
  const CaregiverFlow: React.FC = () => {
    switch (userProfile.role) {
        case 'medecin':
        case 'infirmier':
            if (currentPage === 'doctor_patient_view') {
                return <DoctorPatientView setCurrentPage={setCurrentPage} />; // Doctor's view of a single patient
            }
            return <DoctorDashboard setCurrentPage={setCurrentPage} />; // Doctor's multi-patient dashboard
        
        case 'famille':
        case 'autre':
            // This component will show invitations first, then the dashboard.
            return (
                <InvitationResponsePage>
                    <CaregiverDashboard />
                </InvitationResponsePage>
            );

        default:
            return <LoadingScreen message="Rôle non reconnu..." />;
    }
  }

  return <CaregiverFlow />;
};

export default PostAuthFlow;