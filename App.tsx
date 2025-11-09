import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore.ts';
import AuthPage from './pages/AuthPage.tsx';
import PostAuthFlow from './pages/PostAuthFlow.tsx';
import LoadingScreen from './components/LoadingScreen.tsx';
import DynamicBackground from './components/DynamicBackground.tsx';
import PasswordResetHandlerPage from './pages/PasswordResetHandlerPage.tsx';
import InvitationAcceptancePage from './pages/InvitationAcceptancePage.tsx';

const App: React.FC = () => {
  const { initializeAuth, isAuthenticated, status } = useAuthStore();
  const [action, setAction] = useState<{ mode: string; code: string } | null>(null);
  const [inviteId, setInviteId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');

    // Handle invitation links first, e.g., /invitation/xyz
    const path = window.location.pathname;
    const inviteMatch = path.match(/\/invitation\/([^/]+)/);
    if (inviteMatch && inviteMatch[1]) {
      setInviteId(inviteMatch[1]);
      // Clean up the URL
      window.history.replaceState({}, document.title, '/');
      return; // Stop further processing to show invite page
    }

    if (mode === 'resetPassword' && oobCode) {
      setAction({ mode, code: oobCode });
      // Clean up the URL to prevent the action from being re-triggered on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const unsubscribe = initializeAuth();
      return () => unsubscribe();
    }
  }, [initializeAuth]);

  let content;
  if (inviteId) {
    content = <InvitationAcceptancePage inviteId={inviteId} />;
  }
  else if (action?.mode === 'resetPassword') {
    content = <PasswordResetHandlerPage oobCode={action.code} />;
  } else if (status === 'loading' || status === 'idle') {
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