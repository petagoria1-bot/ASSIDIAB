import React, { useEffect } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import { useAuthStore } from '../store/authStore.ts';
import useTranslations from '../hooks/useTranslations.ts';
import Card from '../components/Card.tsx';
import LoadingScreen from '../components/LoadingScreen.tsx';
import MealGroupCard from '../components/MealGroupCard.tsx';

const CaregiverDashboard: React.FC = () => {
    const { userProfile, logout } = useAuthStore();
    const { 
        fetchDoctorPatients, 
        doctorPatients, 
        isLoading: storeIsLoading, 
        loadEntriesForDoctorView, 
        doctorViewedPatientEntries,
        error
    } = usePatientStore();
    const t = useTranslations();
    
    const acceptedPatientData = doctorPatients.find(p => p.member.status === 'accepted');

    useEffect(() => {
        if (userProfile?.uid) {
            fetchDoctorPatients(userProfile.uid);
        }
    }, [userProfile?.uid, fetchDoctorPatients]);

    useEffect(() => {
        if (acceptedPatientData && acceptedPatientData.member.rights.read) {
            loadEntriesForDoctorView(acceptedPatientData.patient.id);
        }
    }, [acceptedPatientData, loadEntriesForDoctorView]);

    if (storeIsLoading && doctorPatients.length === 0) {
        return <LoadingScreen />;
    }
    
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-main-gradient text-white text-center">
                 <h1 className="text-2xl font-display font-bold">Erreur de chargement</h1>
                 <p className="mt-4 max-w-md bg-red-800/50 p-3 rounded-lg">{error}</p>
                 <button onClick={logout} className="mt-8 border-2 border-white text-white font-bold py-3 px-8 rounded-pill hover:bg-white/10 transition-colors">
                    {t.settings_logout}
                </button>
            </div>
        )
    }

    if (!acceptedPatientData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-main-gradient text-white text-center">
                <h1 className="text-2xl font-display font-bold">Bienvenue, {userProfile?.prenom}</h1>
                <p className="mt-2">Vous n'avez pas encore d'accès à un dossier patient.</p>
                <p className="mt-1 text-sm opacity-80">Demandez au patient de vous envoyer une invitation ou acceptez une invitation en attente.</p>
                <button onClick={logout} className="mt-8 border-2 border-white text-white font-bold py-3 px-8 rounded-pill hover:bg-white/10 transition-colors">
                    {t.settings_logout}
                </button>
            </div>
        );
    }
    
    const { patient, member } = acceptedPatientData;
    const { rights } = member;
    const birthDate = new Date(patient.naissance).toLocaleDateString(t.locale, { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="p-4 space-y-4 pb-24">
            <header className="py-4 text-center">
                <h1 className="text-3xl font-display font-bold text-white text-shadow">Dossier de {patient.prenom}</h1>
                <p className="text-white/80">Né(e) le {birthDate}</p>
            </header>
            
            <div className="flex gap-2 justify-center">
                {Object.entries(rights).map(([key, value]) => (
                    <span key={key} className={`px-2 py-0.5 text-xs font-bold rounded-full ${value ? 'bg-jade/20 text-jade' : 'bg-slate-200 text-slate-500'}`}>{key}</span>
                ))}
            </div>

            <Card>
                <h2 className="font-bold text-lg">Journal du patient</h2>
                {rights.read ? (
                    <div className="space-y-3 mt-4">
                        {storeIsLoading && doctorViewedPatientEntries.length === 0 && <p className="text-text-muted text-center py-4">Chargement du journal...</p>}
                        {!storeIsLoading && doctorViewedPatientEntries.length === 0 && <p className="text-text-muted text-center py-4">Aucune entrée de journal.</p>}
                        {doctorViewedPatientEntries.length > 0 && (
                            doctorViewedPatientEntries.map(event => (
                                <MealGroupCard key={event.id} event={event.data} />
                            ))
                        )}
                    </div>
                ) : (
                    <p className="text-text-muted text-center py-4">Vous n'avez pas les droits de lecture pour ce dossier.</p>
                )}
            </Card>

            <div className="pt-4">
                <button onClick={logout} className="w-full bg-white text-danger font-bold py-3 rounded-button border border-slate-300 hover:bg-danger-soft/50 transition-colors">
                    {t.settings_logout}
                </button>
            </div>
        </div>
    );
};

export default CaregiverDashboard;