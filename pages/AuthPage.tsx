import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore.ts';
import useTranslations from '../hooks/useTranslations.ts';
import DropletLogoIcon from '../components/icons/DropletLogoIcon.tsx';
import GoogleIcon from '../components/icons/GoogleIcon.tsx';
import toast from 'react-hot-toast';

const AuthPage: React.FC = () => {
  const { isLoading, login, signup, loginWithGoogle, error, clearError } = useAuthStore();
  const t = useTranslations();

  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (isLoginView) {
      if (!email || !password) {
        toast.error(t.toast_fillAllFields);
        return;
      }
      await login(email, password);
    } else {
      if (!email || !password || !confirmPassword) {
        toast.error(t.toast_fillAllFields);
        return;
      }
      if (password !== confirmPassword) {
        toast.error(t.toast_passwordsDoNotMatch);
        return;
      }
      await signup(email, password);
    }
  };
  
  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150";

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
            {isLoginView ? t.auth_loginTitle : t.auth_signupTitle}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
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
            {!isLoginView && (
              <input
                type="password"
                placeholder={t.auth_confirmPasswordPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClasses}
                required
              />
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-interactive group flex items-center justify-center text-lg font-bold py-3 px-6 rounded-button bg-emerald-main text-white transition-all duration-300 ease-fast disabled:opacity-60"
            >
              {isLoading ? t.common_loading : (isLoginView ? t.auth_loginButton : t.auth_signupButton)}
            </button>
          </form>

          <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-slate-300"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-sm font-semibold">{t.auth_or}</span>
              <div className="flex-grow border-t border-slate-300"></div>
          </div>
          
          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={isLoading}
            className="w-full btn-interactive group flex items-center justify-center text-md font-semibold py-3 px-6 rounded-button bg-white border border-slate-300 text-text-main transition-all duration-300 ease-fast hover:shadow-md disabled:opacity-60"
          >
            <GoogleIcon className="w-6 h-6 mr-3" />
            {t.auth_googleSignIn}
          </button>
          
          <p className="text-center text-sm text-text-muted mt-6">
            {isLoginView ? t.auth_noAccount : t.auth_hasAccount}
            <button onClick={() => { setIsLoginView(!isLoginView); clearError(); }} className="font-semibold text-emerald-main hover:underline ml-1">
              {isLoginView ? t.auth_signupNow : t.auth_loginNow}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;