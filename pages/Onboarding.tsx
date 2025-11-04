import React, { useState } from 'react';
import { usePatientStore } from '../store/patientStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import useTranslations from '../hooks/useTranslations';

const Onboarding: React.FC = () => {
  const { createPatient, isLoading } = usePatientStore();
  const { currentUser } = useAuthStore();
  const [prenom, setPrenom] = useState('');
  const [naissance, setNaissance] = useState('');
  const t = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prenom || !naissance) {
      toast.error(t.toast_fillAllFields);
      return;
    }
    if (currentUser?.id) {
        await createPatient(prenom, naissance, currentUser.id);
        toast.success(t.toast_profileCreated(prenom));
    } else {
        toast.error(t.toast_userNotFound);
    }
  };

  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150";


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-main-gradient font-sans">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-white">{t.onboarding_welcome}</h1>
          <p className="text-white/80 mt-2">{t.onboarding_subtitle}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white/[.85] rounded-card p-6 shadow-glass border border-black/5 animate-fade-in-lift">
          <div className="space-y-4">
            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-text-muted mb-1">{t.common_firstName}</label>
              <input
                id="prenom"
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
                className={inputClasses}
                placeholder={t.onboarding_firstNamePlaceholder}
              />
            </div>
            <div>
              <label htmlFor="naissance" className="block text-sm font-medium text-text-muted mb-1">{t.common_birthDate}</label>
              <input
                id="naissance"
                type="date"
                value={naissance}
                onChange={(e) => setNaissance(e.target.value)}
                required
                className={inputClasses}
              />
            </div>
          </div>
          
          <button type="submit" disabled={isLoading} className="w-full text-jade-deep font-bold text-lg py-3 rounded-button mt-6 bg-gradient-to-r from-turquoise-light to-mint-soft transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg">
            {isLoading ? t.common_creating : t.onboarding_startButton}
          </button>
        </form>

         <p className="text-center text-xs text-white/70 mt-6 px-4">
            {t.onboarding_helperText}
        </p>
      </div>
    </div>
  );
};

export default Onboarding;