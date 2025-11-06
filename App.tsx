

import React, { useEffect } from 'react';
import { useAuthStore } from './store/authStore.ts';
import { usePatientStore } from './store/patientStore.ts';
import AuthPage from './pages/AuthPage.tsx';
import PostAuthFlow from './pages/PostAuthFlow.tsx';
import { Toaster } from 'react-hot-toast';
import DynamicBackground from './components/DynamicBackground.tsx';
import LoadingScreen from './components/LoadingScreen.tsx';

const App: React.FC = () => {
  const { isAuthenticated, isLoading, checkSession } = useAuthStore();
  const { clearPatientData } = usePatientStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Clear patient data when user logs out.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      clearPatientData();
    }
  }, [isLoading, isAuthenticated, clearPatientData]);


  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <DynamicBackground />
      <main className="relative z-10 font-sans">
        {isAuthenticated ? <PostAuthFlow /> : <AuthPage />}
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