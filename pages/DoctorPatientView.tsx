import React, { useEffect, useState } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import { useAuthStore } from '../store/authStore.ts';
import { Page, PatientProfile, CircleMember } from '../types.ts';
import useTranslations from '../hooks/useTranslations.ts';
import LoadingScreen from '../components/LoadingScreen.tsx';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon.tsx';
import Card from '../components/Card.tsx';

// Assume patientId is passed via a store or props, for now we mock it
const MOCK_PATIENT_ID_FOR_VIEW = 'demo-patient1'; 

const DoctorPatientView: React.FC<{ setCurrentPage: (page: Page) => void }> = ({ setCurrentPage }) => {
  const { userProfile } = useAuthStore();
  const { 
    loadSpecificPatientData, 
    isLoading,
    getMemberRightsForPatient
  } = usePatientStore();
  
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [rights, setRights] = useState<CircleMember['rights'] | null>(null);
  const t = useTranslations();

  useEffect(() => {
    const fetchData = async () => {
        if(userProfile) {
            // In a real app with routing, patientId would come from the URL
            const patientId = MOCK_PATIENT_ID_FOR_VIEW; 
            const loadedPatient = await loadSpecificPatientData(patientId);
            const memberRights = await getMemberRightsForPatient(patientId, userProfile.uid);
            setPatient(loadedPatient);
            setRights(memberRights);
        }
    };
    fetchData();
  }, [userProfile, loadSpecificPatientData, getMemberRightsForPatient]);


  if (isLoading || !patient || !rights) {
    return <LoadingScreen />;
  }
  
  const birthDate = new Date(patient.naissance).toLocaleDateString(t.locale, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="p-4 space-y-4 pb-24">
      <header className="py-4 text-center relative flex items-center justify-center">
        <button 
          onClick={() => setCurrentPage('doctor_dashboard')} 
          className="absolute left-0 text-white p-2 rounded-full hover:bg-white/20"
        >
          <ArrowLeftIcon />
        </button>
        <div>
            <h1 className="text-3xl font-display font-bold text-white text-shadow">Dossier de {patient.prenom}</h1>
            <p className="text-white/80">Né(e) le {birthDate}</p>
        </div>
      </header>

      <div className="flex gap-2 justify-center">
        {Object.entries(rights).map(([key, value]) => (
            <span key={key} className={`px-2 py-0.5 text-xs font-bold rounded-full ${value ? 'bg-emerald-main/20 text-emerald-main' : 'bg-slate-200 text-slate-500'}`}>{key}</span>
        ))}
      </div>

      <Card>
          <h2 className="font-bold text-lg">Journal</h2>
          {rights.read ? (
              <p>Le contenu du journal du patient s'affichera ici.</p>
          ) : (
              <p className="text-text-muted">Vous n'avez pas les droits de lecture pour ce dossier.</p>
          )}
      </Card>
       <Card>
          <h2 className="font-bold text-lg">Ajouter une entrée</h2>
          {rights.write ? (
              <button className="w-full bg-emerald-main text-white p-2 rounded">Ajouter une mesure (activé)</button>
          ) : (
              <button className="w-full bg-slate-200 text-slate-500 p-2 rounded" disabled>Ajouter une mesure (désactivé)</button>
          )}
      </Card>

    </div>
  );
};

export default DoctorPatientView;