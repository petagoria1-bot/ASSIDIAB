// FIX: The original App.tsx file contained placeholder text.
// This new content provides the root component for the application,
// handling authentication state, routing for invitation links,
// and setting up global components like the background and toast notifications.
import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore.ts';
import AuthPage from './pages/AuthPage.tsx';
import PostAuthFlow from './pages/PostAuthFlow.tsx';
import LoadingScreen from './components/LoadingScreen.tsx';
import DynamicBackground from './components/DynamicBackground.tsx';
import InvitationAcceptancePage from './pages/InvitationAcceptancePage.tsx';

const App: React.FC = () => {
  const { initializeAuth, isAuthenticated, isLoading } = useAuthStore();
  const [inviteId, setInviteId] = React.useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/invite/')) {
        const id = hash.substring('#/invite/'.length);
        setInviteId(id);
        // Store in session storage to survive the auth flow (e.g. signup)
        sessionStorage.setItem('pendingInviteId', id);
      } else {
        setInviteId(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check on initial load

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  let content;
  if (isLoading) {
    content = <LoadingScreen />;
  } else if (isAuthenticated) {
    content = <PostAuthFlow />;
  } else if (inviteId) {
    content = <InvitationAcceptancePage inviteId={inviteId} />;
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
