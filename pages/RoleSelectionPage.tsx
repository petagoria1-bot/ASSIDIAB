import React from 'react';
import { useAuthStore } from '../store/authStore.ts';
import { UserRole } from '../types.ts';
import useTranslations from '../hooks/useTranslations.ts';
import DropletLogoIcon from '../components/icons/DropletLogoIcon.tsx';
import UserIcon from '../components/icons/UserIcon.tsx';
import UsersIcon from '../components/icons/UsersIcon.tsx';

const RoleSelectionPage: React.FC = () => {
    const { setUserRole, userProfile } = useAuthStore();
    const t = useTranslations();

    const handleRoleSelect = (role: UserRole) => {
        setUserRole(role);
    };

    const roles: { role: UserRole; label: string; description: string; icon: React.ReactNode }[] = [
        { role: 'patient', label: 'Patient', description: "Je suis le patient et je souhaite gérer mon suivi.", icon: <UserIcon className="w-10 h-10 text-emerald-main"/> },
        { role: 'famille', label: 'Famille / Proche', description: "Je souhaite rejoindre le cercle d'un patient.", icon: <UsersIcon className="w-10 h-10 text-info"/> },
        { role: 'medecin', label: 'Médecin', description: "Je suis un professionnel de santé.", icon: <UsersIcon className="w-10 h-10 text-info"/> },
        { role: 'infirmier', label: 'Infirmier', description: "Je suis un professionnel de santé.", icon: <UsersIcon className="w-10 h-10 text-info"/> },
        { role: 'autre', label: 'Autre', description: "Personnel scolaire, etc.", icon: <UsersIcon className="w-10 h-10 text-info"/> },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-main-gradient font-sans animate-fade-in">
            <div className="w-full max-w-sm mx-auto text-center">
                <DropletLogoIcon className="w-24 h-24 mx-auto" />
                <h1 className="text-3xl font-display font-bold text-white mt-2 text-shadow">{t.onboarding_welcome}, {userProfile?.prenom} !</h1>
            </div>

            <div className="w-full max-w-md mx-auto mt-8">
                <div className="bg-white/[.85] rounded-card p-6 shadow-glass border border-black/5 animate-fade-in-fast">
                    <h2 className="text-xl font-display font-bold text-center text-text-title mb-2">Êtes-vous...</h2>
                    <div className="space-y-3 mt-4">
                        {roles.filter(r => r.role !== 'undetermined').map(({ role, label, description, icon }) => (
                            <button 
                                key={role}
                                onClick={() => handleRoleSelect(role)}
                                className="w-full flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-all transform hover:-translate-y-0.5 border border-slate-200 text-left"
                            >
                                <div className="mr-4">{icon}</div>
                                <div>
                                    <span className="font-bold text-text-title">{label}</span>
                                    <p className="text-sm text-text-muted">{description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionPage;