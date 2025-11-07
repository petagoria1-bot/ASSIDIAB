import React from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import { useAuthStore } from '../store/authStore.ts';
import useTranslations from '../hooks/useTranslations.ts';
import Card from '../components/Card.tsx';
import LoadingScreen from '../components/LoadingScreen.tsx';

const CaregiverDashboard: React.FC = () => {
    const { userProfile } = useAuthStore();
    const { patient, isLoading } = usePatientStore();
    const { logout } = useAuthStore();
    const t = useTranslations();

    // This effect will trigger a load if the patient data isn't already in the store
    React.useEffect(() => {
        if (userProfile && !patient) {
            usePatientStore.getState().loadPatientData(userProfile);
        }
    }, [userProfile, patient]);


    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!patient) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-main-gradient text-white text-center">
                <h1 className="text-2xl font-display font-bold">Bienvenue, {userProfile?.prenom}</h1>
                <p className="mt-2">Vous n'êtes actuellement membre d'aucun cercle de soins.</p>
                <p className="mt-1 text-sm opacity-80">Demandez à un patient de vous envoyer une invitation.</p>
                <button onClick={logout} className="mt-8 border-2 border-white text-white font-bold py-3 px-8 rounded-pill hover:bg-white/10 transition-colors">
                    {t.settings_logout}
                </button>
            </div>
        );
    }
    
    // TODO: Check specific permissions from CircleMember data
    const canRead = true; // Placeholder

    return (
        <div className="p-4 space-y-4 pb-24">
            <header className="py-4 text-center">
                <h1 className="text-3xl font-display font-bold text-white text-shadow">Vue Soignant</h1>
                <p className="text-white/80">Profil de {patient.prenom} {patient.nom}</p>
            </header>

            {canRead ? (
                <Card>
                    <h2 className="font-bold text-lg">Journal du patient</h2>
                    <p className="text-sm text-text-muted">Vous avez la permission de voir l'historique.</p>
                    {/* Here you would render the journal/history component */}
                </Card>
            ) : (
                 <Card>
                    <h2 className="font-bold text-lg">Accès Limité</h2>
                    <p className="text-sm text-text-muted">Vous n'avez pas la permission de voir le journal.</p>
                </Card>
            )}

             <div className="pt-4">
                <button onClick={logout} className="w-full bg-white text-danger font-bold py-3 rounded-button border border-slate-300 hover:bg-danger-soft/50 transition-colors">
                {t.settings_logout}
                </button>
            </div>

        </div>
    );
};

export default CaregiverDashboard;
