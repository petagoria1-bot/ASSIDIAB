import React, { useState } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import { useAuthStore } from '../store/authStore.ts';
import toast from 'react-hot-toast';
import useTranslations from '../hooks/useTranslations.ts';
import ArrowRightIcon from '../components/icons/ArrowRightIcon.tsx';
import DropletLogoIcon from '../components/icons/DropletLogoIcon.tsx';

const InitialSetup: React.FC = () => {
  const { createPatientProfile, isLoading } = usePatientStore();
  const { userProfile } = useAuthStore();
  const t = useTranslations();

  const [naissance, setNaissance] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naissance) {
      toast.error(t.toast_fillAllFields);
      return;
    }
    if (!userProfile) {
        toast.error(t.toast_userNotFound);
        return;
    }

    try {
      await createPatientProfile(naissance, userProfile);
      toast.success(t.toast_profileCreated(userProfile.prenom));
    } catch (error) {
        // Error is already handled in the store
    }
  };
  
  const inputClasses = "w-full p-4 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-jade focus:ring-2 focus:ring-jade/30 transition-all duration-150 text-lg";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-main-gradient font-sans animate-fade-in">
      <div className="w-full max-w-sm mx-auto text-center">
        <DropletLogoIcon className="w-24 h-24 mx-auto" />
        <h1 className="text-3xl font-display font-bold text-white mt-2 text-shadow">{t.onboarding_welcome}, {userProfile?.prenom} !</h1>
        <p className="text-white/80 mt-1">{t.initialSetup_title}</p>
      </div>

      <div className="w-full max-w-sm mx-auto mt-8">
        <div className="bg-white/[.85] rounded-card p-6 shadow-glass border border-black/5">
            <h2 className="text-xl font-display font-bold text-center text-text-title mb-2">{t.initialSetup_patientInfoTitle}</h2>
            <p className="text-sm text-center text-text-muted mb-6">{t.initialSetup_patientInfoSubtitle}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">{t.common_birthDate}</label>
                    <input id="naissance" type="date" value={naissance} onChange={(e) => setNaissance(e.target.value)} className={inputClasses} required />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-interactive group flex items-center justify-center text-lg font-bold py-4 px-6 rounded-button bg-jade text-white shadow-button-jade hover:shadow-button-jade-hover transform hover:-translate-y-1 transition-all duration-300 ease-fast disabled:opacity-60"
                >
                    {isLoading ? t.common_creating : t.initialSetup_createProfileButton}
                    {!isLoading && <ArrowRightIcon className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default InitialSetup;