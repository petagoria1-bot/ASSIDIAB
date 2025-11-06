import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore.ts';
import { usePatientStore } from './store/patientStore.ts';
import AuthPage from './pages/AuthPage.tsx';
import PostAuthFlow from './pages/PostAuthFlow.tsx';
import { Toaster } from 'react-hot-toast';
import DynamicBackground from './components/DynamicBackground.tsx';
import LoadingScreen from './components/LoadingScreen.tsx';
import InvitationAcceptancePage from './pages/InvitationAcceptancePage.tsx';

const App: React.FC = () => {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const { clearPatientData } = usePatientStore();
  const [inviteId, setInviteId] = useState<string | null>(null);

  useEffect(() => {
    // Simple routing for invitation links
    const path = window.location.pathname;
    if (path.startsWith('/invite/')) {
        const id = path.split('/invite/')[1];
        if (id) {
            setInviteId(id);
            // Store in session storage to survive auth redirect
            sessionStorage.setItem('pendingInviteId', id);
        }
    }

    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, []);

  // Clear patient data when user logs out.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      clearPatientData();
    }
  }, [isLoading, isAuthenticated, clearPatientData]);


  if (isLoading) {
    return <LoadingScreen />;
  }
  
  const renderContent = () => {
    if (isAuthenticated) {
        return <PostAuthFlow />;
    }
    // If not authenticated AND on an invite link, show the special acceptance page
    if (inviteId) {
        return <InvitationAcceptancePage inviteId={inviteId} />;
    }
    // Default to standard auth page
    return <AuthPage />;
  }

  return (
    <>
      <DynamicBackground />
      <main className="relative z-10 font-sans">
        {renderContent()}
      </main>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'font-sans',
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </>
  );
};

export default App;