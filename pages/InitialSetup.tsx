import React, { useState } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import { useAuthStore } from '../store/authStore.ts';
import toast from 'react-hot-toast';
import useTranslations from '../hooks/useTranslations.ts';
import ArrowRightIcon from '../components/icons/ArrowRightIcon.tsx';
import UserIcon from '../components/icons/UserIcon.tsx';
import UsersIcon from '../components/icons/UsersIcon.tsx';

const InitialSetup: React.FC = () => {
  const { createPatient, isLoading } = usePatientStore();
  const { currentUser } = useAuthStore();
  const t = useTranslations();

  const [step, setStep] = useState<'identity' | 'role' | 'details'>('identity');
  const [prenom, setPrenom] = useState('');
  const [naissance, setNaissance] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prenom || !naissance) {
      toast.error(t.toast_fillAllFields);
      return;
    }
    if (currentUser) {
      await createPatient(prenom, naissance, currentUser);
      toast.success(t.toast_profileCreated(prenom));
    } else {
      toast.error(t.toast_userNotFound);
    }
  };

  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150";

  const renderIdentityStep = () => (
    <div className="bg-white/[.85] rounded-card p-6 shadow-glass border border-black/5">
      <h2 className="text-xl font-display font-bold text-center text-text-title mb-6">{t.initialSetup_whoAreYou}</h2>
      <div className="space-y-4">
        <button onClick={() => setStep('details')} className="w-full btn-interactive group flex flex-col items-center justify-center p-6 rounded-card bg-white hover:shadow-lg transition-shadow duration-300 border border-slate-200">
          <UserIcon className="w-10 h-10 text-emerald-main mb-2"/>
          <span className="font-semibold text-text-title">{t.initialSetup_iAmPatient}</span>
        </button>
        <button onClick={() => setStep('role')} className="w-full btn-interactive group flex flex-col items-center justify-center p-6 rounded-card bg-white hover:shadow-lg transition-shadow duration-300 border border-slate-200">
          <UsersIcon className="w-10 h-10 text-info mb-2"/>
          <span className="font-semibold text-text-title">{t.initialSetup_iAmCaregiver}</span>
        </button>
      </div>
    </div>
  );
  
  const RoleButton: React.FC<{ label: string; onClick: () => void; }> = ({ label, onClick }) => (
    <button onClick={onClick} className="w-full btn-interactive p-3 rounded-button bg-white hover:bg-slate-100 transition-colors border border-slate-200 text-sm font-semibold text-text-main">
        {label}
    </button>
  );

  const renderRoleStep = () => (
     <div className="bg-white/[.85] rounded-card p-6 shadow-glass border border-black/5">
      <h2 className="text-xl font-display font-bold text-center text-text-title mb-6">{t.initialSetup_yourRole}</h2>
      <div className="grid grid-cols-2 gap-3">
        <RoleButton label={t.initialSetup_role_mom} onClick={() => setStep('details')} />
        <RoleButton label={t.initialSetup_role_dad} onClick={() => setStep('details')} />
        <RoleButton label={t.initialSetup_role_sister} onClick={() => setStep('details')} />
        <RoleButton label={t.initialSetup_role_brother} onClick={() => setStep('details')} />
        <RoleButton label={t.initialSetup_role_doctor} onClick={() => setStep('details')} />
        <RoleButton label={t.initialSetup_role_endo} onClick={() => setStep('details')} />
        <RoleButton label={t.initialSetup_role_diet} onClick={() => setStep('details')} />
        <RoleButton label={t.initialSetup_role_other} onClick={() => setStep('details')} />
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <form onSubmit={handleSubmit} className="bg-white/[.85] rounded-card p-6 shadow-glass border border-black/5">
        <h2 className="text-xl font-display font-bold text-center text-text-title mb-1">{t.initialSetup_patientInfoTitle}</h2>
        <p className="text-center text-sm text-text-muted mb-6">{t.initialSetup_patientInfoSubtitle}</p>
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
                autoFocus
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
        
        <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-interactive group flex items-center justify-center text-lg font-bold py-3.5 px-6 rounded-button mt-6 bg-emerald-main text-white transition-all duration-300 ease-fast disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
        >
            <span className="flex-1 text-center">{isLoading ? t.common_creating : t.initialSetup_createProfileButton}</span>
            {!isLoading && <ArrowRightIcon className="w-6 h-6 transition-transform duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-2" />}
        </button>
    </form>
  );

  const renderStep = () => {
    switch (step) {
      case 'identity': return renderIdentityStep();
      case 'role': return renderRoleStep();
      case 'details': return renderDetailsStep();
      default: return null;
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-main-gradient font-sans">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-white">{t.onboarding_welcome}</h1>
          <p className="text-white/80 mt-2">{t.initialSetup_title}</p>
        </div>
        <div key={step} className="animate-card-open">
             {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default InitialSetup;
