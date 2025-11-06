
import React, { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import AuthPage from './pages/AuthPage';
import PostAuthFlow from './pages/PostAuthFlow';
import { Toaster } from 'react-hot-toast';
import DynamicBackground from './components/DynamicBackground';
import LoadingScreen from './components/LoadingScreen';

const App: React.FC = () => {
  const { isAuthenticated, isLoading, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

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
