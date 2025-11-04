import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const DropletIcon: React.FC = () => (
    <svg viewBox="0 0 24 24" className="w-16 h-16 mx-auto text-white" fill="currentColor">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </svg>
);


const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, signup, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login(username, password);
    } else {
      if (password !== confirmPassword) {
        toast.error("Les mots de passe ne correspondent pas.");
        return;
      }
      await signup(username, password);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  }
  
  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-main-gradient font-sans">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-6">
          <DropletIcon />
          <h1 className="text-3xl font-display font-bold text-white mt-2">Diab'Assistant</h1>
        </div>
        
        <div className="bg-white/[.85] rounded-card p-6 shadow-glass border border-black/5 animate-fade-in-lift">
          <h2 className="text-xl font-display font-semibold text-center text-text-title mb-5">
            {isLogin ? 'Connectez-vous' : 'Créez votre profil'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-muted mb-1">Pseudo</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-muted mb-1">Mot de passe</label>
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-muted mb-1">Confirmer le mot de passe</label>
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
              className={`w-full text-white font-bold text-lg py-3 rounded-button mt-2 transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg ${
                isLogin 
                ? 'bg-gradient-to-r from-jade-deep-dark to-emerald-main' 
                : 'bg-gradient-to-r from-turquoise-light to-mint-soft text-jade-deep'
              }`}
            >
              {isLoading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'Créer mon profil')}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/90 mt-6">
          {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
          <button onClick={toggleForm} className="font-semibold hover:underline ml-1">
            {isLogin ? 'Inscrivez-vous' : 'Connectez-vous'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;