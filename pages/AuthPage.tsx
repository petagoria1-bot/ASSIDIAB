import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import useTranslations from '../hooks/useTranslations';
import DropletLogoIcon from '../components/icons/DropletLogoIcon';
import ArrowRightIcon from '../components/icons/ArrowRightIcon';
import GoogleIcon from '../components/icons/GoogleIcon';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, signup, isLoading, loginWithGoogle } = useAuthStore();
  const t = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password);
    } else {
      if (password !== confirmPassword) {
        toast.error(t.toast_passwordsDoNotMatch);
        return;
      }
      await signup(email, password);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }
  
  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-main-gradient font-sans">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-6">
          <DropletLogoIcon className="w-24 h-24 mx-auto" />
          <h1 className="text-3xl font-display font-bold text-white mt-2">{t.auth_appTitle}</h1>
        </div>
        
        <div className="bg-white/[.85] rounded-card p-6 shadow-glass border border-black/5 animate-card-open">
          <h2 className="text-xl font-display font-semibold text-center text-text-title mb-5">
            {isLogin ? t.auth_loginTitle : t.auth_signupTitle}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-1">{t.auth_username}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-muted mb-1">{t.auth_password}</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClasses}
              />
            </div>
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-muted mb-1">{t.auth_confirmPassword}</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={inputClasses}
                />
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={isLoading} 
              className={`w-full btn-interactive group flex items-center justify-center text-lg font-bold py-3.5 px-6 rounded-button mt-4 transition-all duration-300 ease-fast disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl transform hover:-translate-y-1 ${
                isLogin 
                ? 'bg-gradient-to-r from-jade-deep-dark to-emerald-main text-white' 
                : 'bg-gradient-to-r from-turquoise-light to-mint-soft text-jade-deep'
              }`}
            >
              <span className="flex-1 text-center">{isLoading ? t.common_loading : (isLogin ? t.auth_loginButton : t.auth_signupButton)}</span>
              {!isLoading && <ArrowRightIcon className="w-6 h-6 transition-all duration-300 -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />}
            </button>
          </form>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-sm font-medium">{t.auth_or}</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>
          
          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={isLoading}
            className="w-full btn-interactive group flex items-center justify-center text-md font-semibold py-3 px-6 rounded-button bg-white border border-slate-300 text-text-main transition-all duration-300 ease-fast hover:shadow-md disabled:opacity-60"
          >
            <GoogleIcon className="w-6 h-6 mr-3" />
            {t.auth_continueWithGoogle}
          </button>

        </div>

        <div className="text-center mt-6">
            <p className="text-sm text-white/90">
                {isLogin ? t.auth_noAccount : t.auth_hasAccount}
            </p>
            <button onClick={toggleForm} className="font-semibold text-white py-2 px-5 rounded-pill transition-all duration-300 hover:bg-white/20 transform hover:scale-105 mt-2 btn-interactive">
                {isLogin ? t.auth_signupLink : t.auth_loginLink}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;