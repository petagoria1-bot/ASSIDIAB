import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore.ts';
import AuthPage from './pages/AuthPage.tsx';
import PostAuthFlow from './pages/PostAuthFlow.tsx';
import LoadingScreen from './components/LoadingScreen.tsx';
import DynamicBackground from './components/DynamicBackground.tsx';

const App: React.FC = () => {
  const { initializeAuth, isAuthenticated, status } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  let content;
  if (status === 'loading' || status === 'idle') {
    content = <LoadingScreen />;
  } else if (isAuthenticated) {
    content = <PostAuthFlow />;
  } else {
    content = <AuthPage />;
  }

  return (
    <>
      <DynamicBackground />
      <div className="font-sans text-text-main">
        {content}
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '9999px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 600,
          },
        }}
      />
    </>
  );
};

export default App;
