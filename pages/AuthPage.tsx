import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore.ts';
import useTranslations from '../hooks/useTranslations.ts';
import DropletLogoIcon from '../components/icons/DropletLogoIcon.tsx';
import toast from 'react-hot-toast';
import PaperPlaneIcon from '../components/icons/PaperPlaneIcon.tsx';
import EmailExistsModal from '../components/EmailExistsModal.tsx';

const AuthPage: React.FC = () => {
  const { isLoading, login, signup, resetPassword, error, clearError } = useAuthStore();
  const t = useTranslations();
  
  const [view, setView] = useState<'login' | 'signup' | 'reset' | 'reset-success'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showEmailExistsModal, setShowEmailExistsModal] = useState(false);

  useEffect(() => {
    if (error === 'auth/email-already-in-use') {
      setShowEmailExistsModal(true);
    }
  }, [error]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t.toast_fillAllFields);
      return;
    }
    await login(email, password);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast.error(t.toast_fillAllFields);
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t.toast_passwordsDoNotMatch);
      return;
    }
    await signup(email, password);
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(t.toast_invalidEmail);
      return;
    }
    try {
      await resetPassword(email);
      setView('reset-success');
    } catch (err) {
      // Error is handled by the store's toast
    }
  };

  const switchView = (targetView: 'login' | 'signup') => {
    if (view !== targetView) {
        setView(targetView);
        // Do not clear email when switching, it's a common UX pattern
        setPassword('');
        setConfirmPassword('');
    }
  }

  const handleCloseEmailExistsModal = () => {
    setShowEmailExistsModal(false);
    clearError();
  };

  const handleGoToLoginFromModal = () => {
      handleCloseEmailExistsModal();
      setView('login');
      setPassword('');
      setConfirmPassword('');
  };

  const handleGoToResetFromModal = () => {
      handleCloseEmailExistsModal();
      setView('reset');
      setPassword('');
      setConfirmPassword('');
  };
  
  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150";

  const renderLoginSignup = () => (
    <div key="login-signup">
      <div className="flex justify-center bg-slate-200/60 rounded-pill p-1 mb-6">
        <button 
          onClick={() => switchView('login')}
          className={`w-1/2 py-2 rounded-pill font-semibold transition-all duration-300 ${view === 'login' ? 'bg-white shadow-md text-emerald-main' : 'text-text-muted'}`}
        >
          {t.auth_loginTitle}
        </button>
        <button 
          onClick={() => switchView('signup')}
          className={`w-1/2 py-2 rounded-pill font-semibold transition-all duration-300 ${view === 'signup' ? 'bg-white shadow-md text-emerald-main' : 'text-text-muted'}`}
        >
          {t.auth_signupTitle}
        </button>
      </div>

      <form onSubmit={view === 'login' ? handleLogin : handleSignup} className="space-y-4">
        <input
          type="email"
          placeholder={t.auth_emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClasses}
          required
        />
        <input
          type="password"
          placeholder={t.auth_passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClasses}
          required
        />
        {view === 'signup' && (
          <input
            type="password"
            placeholder={t.auth_confirmPasswordPlaceholder}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClasses}
            required
          />
        )}
        
        {view === 'login' && (
            <div className="text-right">
                <button type="button" onClick={() => { setView('reset'); }} className="text-sm font-semibold text-emerald-main hover:underline">
                    {t.auth_forgotPassword}
                </button>
            </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-interactive group flex items-center justify-center text-lg font-bold py-3 px-6 rounded-button bg-emerald-main text-white transition-all duration-300 ease-fast disabled:opacity-60"
        >
          {isLoading ? t.common_loading : (view === 'login' ? t.auth_loginButton : t.auth_signupButton)}
        </button>
      </form>
    </div>
  );

  const renderReset = () => (
    <div key="reset" className="animate-fade-in-fast">
        <h2 className="text-xl font-display font-bold text-center text-text-title mb-2">{t.auth_resetTitle}</h2>
        <p className="text-sm text-center text-text-muted mb-6">{t.auth_resetSubtitle}</p>

        <form onSubmit={handlePasswordReset} className="space-y-4">
            <input
              type="email"
              placeholder={t.auth_emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
              required
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-interactive group flex items-center justify-center text-lg font-bold py-3 px-6 rounded-button bg-emerald-main text-white transition-all duration-300 ease-fast disabled:opacity-60"
            >
              {isLoading ? t.common_loading : t.auth_resetButton}
            </button>
        </form>
        <div className="text-center mt-4">
            <button type="button" onClick={() => setView('login')} className="text-sm font-semibold text-emerald-main hover:underline">
                {t.auth_backToLogin}
            </button>
        </div>
    </div>
  );

  const renderResetSuccess = () => (
    <div key="reset-success" className="animate-fade-in-fast text-center">
        <div className="w-20 h-20 flex items-center justify-center bg-mint-soft rounded-full mx-auto mb-4">
            <PaperPlaneIcon className="w-10 h-10 text-emerald-main"/>
        </div>
        <h2 className="text-xl font-display font-bold text-text-title mb-2">{t.auth_resetSuccessTitle}</h2>
        <p 
            className="text-sm text-text-muted mb-6"
            dangerouslySetInnerHTML={{ __html: t.auth_resetSuccessSubtitle(email) }}
        />
        <button type="button" onClick={() => setView('login')} className="text-sm font-semibold text-emerald-main hover:underline">
            {t.auth_backToLogin}
        </button>
    </div>
  );


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-main-gradient font-sans">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-6">
          <DropletLogoIcon className="w-24 h-24 mx-auto" />
          <h1 className="text-3xl font-display font-bold text-white mt-2">{t.auth_appTitle}</h1>
          <p className="text-white/80 mt-2">{t.auth_subtitle}</p>
        </div>
        
        <div className="bg-white/[.85] rounded-card p-6 shadow-glass border border-black/5">
          {view === 'reset' && renderReset()}
          {view === 'reset-success' && renderResetSuccess()}
          {(view === 'login' || view === 'signup') && renderLoginSignup()}
        </div>
      </div>
      
      {showEmailExistsModal && (
        <EmailExistsModal 
            onClose={handleCloseEmailExistsModal}
            onGoToLogin={handleGoToLoginFromModal}
            onGoToReset={handleGoToResetFromModal}
        />
      )}
    </div>
  );
};

export default AuthPage;
