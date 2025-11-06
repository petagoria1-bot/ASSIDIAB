import React, { useEffect } from 'react';
import { useAuthStore } from './store/authStore.ts';
import { usePatientStore } from './store/patientStore.ts';
import AuthPage from './pages/AuthPage.tsx';
import PostAuthFlow from './pages/PostAuthFlow.tsx';
import { Toaster } from 'react-hot-toast';
import DynamicBackground from './components/DynamicBackground.tsx';
import LoadingScreen from './components/LoadingScreen.tsx';

const App: React.FC = () => {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const { clearPatientData } = usePatientStore();

  useEffect(() => {
    // initializeAuth now returns an unsubscribe function.
    // We call it here and useEffect will handle cleanup on component unmount.
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

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