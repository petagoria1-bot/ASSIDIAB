import React from 'react';
import { useAuthStore } from '../store/authStore.ts';
import useTranslations from '../hooks/useTranslations.ts';
import DropletLogoIcon from '../components/icons/DropletLogoIcon.tsx';
import GoogleIcon from '../components/icons/GoogleIcon.tsx';

const AuthPage: React.FC = () => {
  const { isLoading, loginWithGoogle } = useAuthStore();
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-main-gradient font-sans">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-6">
          <DropletLogoIcon className="w-24 h-24 mx-auto" />
          <h1 className="text-3xl font-display font-bold text-white mt-2">{t.auth_appTitle}</h1>
          <p className="text-white/80 mt-2">{t.auth_subtitle}</p>
        </div>
        
        <div className="bg-white/[.85] rounded-card p-6 sm:p-8 shadow-glass border border-black/5 animate-card-open">
          <h2 className="text-2xl font-display font-bold text-center text-text-title mb-6">
            {t.auth_welcomeTitle}
          </h2>
          
          <div className="space-y-4">
              <button
                type="button"
                onClick={loginWithGoogle}
                disabled={isLoading}
                className="w-full btn-interactive group flex items-center justify-center text-md font-semibold py-3 px-6 rounded-button bg-white border border-slate-300 text-text-main transition-all duration-300 ease-fast hover:shadow-md disabled:opacity-60"
              >
                <GoogleIcon className="w-6 h-6 mr-3" />
                {t.auth_googleSignIn}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
