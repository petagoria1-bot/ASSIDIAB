import React, { useEffect, useState } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import { useAuthStore } from '../store/authStore.ts';
import { Page, PatientProfile, CircleMember, MealTime, CorrectionRule } from '../types.ts';
import useTranslations from '../hooks/useTranslations.ts';
import LoadingScreen from '../components/LoadingScreen.tsx';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon.tsx';
import Card from '../components/Card.tsx';
import MealGroupCard from '../components/MealGroupCard.tsx';

const DoctorPatientView: React.FC<{ setCurrentPage: (page: Page) => void }> = ({ setCurrentPage }) => {
  const { userProfile } = useAuthStore();
  const { 
    loadSpecificPatientData, 
    isLoading,
    getMemberRightsForPatient,
    doctorViewedPatientId,
    setDoctorViewedPatient,
    doctorViewedPatientEntries,
    loadEntriesForDoctorView,
  } = usePatientStore();
  
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [rights, setRights] = useState<CircleMember['rights'] | null>(null);
  const t = useTranslations();

  useEffect(() => {
    const fetchData = async () => {
        if(userProfile && doctorViewedPatientId) {
            const patientId = doctorViewedPatientId; 
            const loadedPatient = await loadSpecificPatientData(patientId);
            const memberRights = await getMemberRightsForPatient(patientId, userProfile.uid);
            setPatient(loadedPatient);
            setRights(memberRights);
            if (memberRights?.read) {
                await loadEntriesForDoctorView(patientId);
            }
        }
    };
    fetchData();
  }, [userProfile, doctorViewedPatientId, loadSpecificPatientData, getMemberRightsForPatient, loadEntriesForDoctorView]);
  
  const handleGoBack = () => {
    setDoctorViewedPatient(null);
    setCurrentPage('doctor_dashboard');
  };


  if (isLoading || !patient || !rights) {
    return <LoadingScreen />;
  }
  
  const birthDate = new Date(patient.naissance).toLocaleDateString(t.locale, { year: 'numeric', month: 'long', day: 'numeric' });

  const getCorrectionRuleText = (rule: CorrectionRule, index: number) => {
    const sortedCorrections = [...patient.corrections].sort((a,b) => a.max - b.max);
    if (index === 0) {
      return t.pai_correctionRuleFirst(rule.max);
    }
    const prevMax = sortedCorrections[index - 1].max;
    if (rule.max === Infinity) {
        return `Si > ${prevMax.toFixed(2)} g/L`;
    }
    return t.pai_correctionRuleNext(prevMax, rule.max);
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      <header className="py-4 text-center relative flex items-center justify-center">
        <button 
          onClick={handleGoBack} 
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
            <span key={key} className={`px-2 py-0.5 text-xs font-bold rounded-full ${value ? 'bg-jade/20 text-jade' : 'bg-slate-200 text-slate-500'}`}>{key}</span>
        ))}
      </div>

      <Card>
          <h2 className="font-bold text-lg">Journal du patient</h2>
          {rights.read ? (
              <div className="space-y-3 mt-4">
                  {isLoading && <p>Chargement du journal...</p>}
                  {!isLoading && doctorViewedPatientEntries.length > 0 ? (
                      doctorViewedPatientEntries.map(event => (
                          <MealGroupCard key={event.id} event={event.data} />
                      ))
                  ) : (
                      <p className="text-text-muted text-center py-4">Aucune entrée de journal pour ce patient.</p>
                  )}
              </div>
          ) : (
              <p className="text-text-muted">Vous n'avez pas les droits de lecture pour ce dossier.</p>
          )}
      </Card>
      <Card>
        <h2 className="text-lg font-semibold text-text-title mb-2">{t.pai_title(patient.prenom)}</h2>
        
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-text-title mb-1">{t.pai_glycemicTargets}</h3>
                <div className="text-center bg-mint/50 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-text-muted">{t.pai_target}</p>
                    <p className="text-2xl font-bold text-jade">{patient.cibles.gly_min.toFixed(2)} - {patient.cibles.gly_max.toFixed(2)} g/L</p>
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-text-title mb-1">{t.pai_ratios}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(patient.ratios).map(([moment, ratio]) => (
                    <div key={moment} className="bg-input-bg p-2 rounded-md">
                      <p className="font-semibold text-text-main">{t.mealTimes[moment as MealTime]}</p>
                      <p className="text-text-muted">{ratio} g / 1U</p>
                    </div>
                  ))}
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-text-title mb-1">{t.pai_correctionSchema}</h3>
                 <div className="space-y-2">
                    {patient.corrections.sort((a,b) => a.max - b.max).map((rule, index) => (
                        <div key={index} className="flex justify-between items-center bg-input-bg p-2 rounded-md text-sm">
                            <p className="text-text-main">{getCorrectionRuleText(rule, index)}</p>
                            <p className="font-bold text-jade">+{rule.addU} U</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default DoctorPatientView;