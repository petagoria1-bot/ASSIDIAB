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
import Card from '../components/Card.tsx';
import ErrorIcon from '../components/icons/ErrorIcon.tsx';

const PostAuthFlow: React.FC = () => {
  const { userProfile, status } = useAuthStore();
  const { patient, loadPatientData, loadStatus, error: patientError } = usePatientStore();
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
      return (
          <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-danger-soft">
              <Card className="w-full max-w-sm text-center border-danger">
                  <ErrorIcon className="w-20 h-20 mx-auto" />
                  <h1 className="text-2xl font-display font-bold text-danger-dark mt-4">{t.error_criticalTitle}</h1>
                  <p className="text-sm text-text-muted mt-2">{t.error_loadDataBody}</p>
                  <p className="text-xs bg-red-100 p-2 rounded-md mt-2 text-red-800 break-words">{patientError}</p>
                  <button onClick={() => loadPatientData(userProfile)} className="mt-6 w-full bg-danger text-white font-bold py-3 rounded-button hover:bg-danger-dark transition-colors shadow-sm">{t.error_retry}</button>
              </Card>
          </div>
      );
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