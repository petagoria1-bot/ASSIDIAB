import React, { useState, useMemo, useEffect } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import { useAuthStore } from '../store/authStore.ts';
import { Page, CircleMember, CircleMemberStatus, PatientProfile } from '../types.ts';
import Card from '../components/Card.tsx';
import useTranslations from '../hooks/useTranslations.ts';
import LoadingScreen from '../components/LoadingScreen.tsx';

interface DoctorDashboardProps {
  setCurrentPage: (page: Page) => void;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ setCurrentPage }) => {
  const { userProfile } = useAuthStore();
  const { fetchDoctorPatients, respondToInvitation, doctorPatients, isLoading } = usePatientStore();
  const t = useTranslations();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CircleMemberStatus | 'all'>('all');

  useEffect(() => {
    if (userProfile?.uid) {
        fetchDoctorPatients(userProfile.uid);
    }
  }, [userProfile, fetchDoctorPatients]);

  const filteredPatients = useMemo(() => {
    return doctorPatients
      .filter(p => statusFilter === 'all' || p.member.status === statusFilter)
      .filter(p => `${p.patient.prenom} ${p.patient.nom}`.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [doctorPatients, searchTerm, statusFilter]);

  const handleResponse = (invitationId: string, status: 'accepted' | 'refused') => {
      if (!userProfile) return;
      respondToInvitation(invitationId, status, userProfile.uid);
  }

  const openPatientRecord = (patient: PatientProfile) => {
    // In a real router, you would navigate to `/medecin/patient/${patient.id}`
    // Here we'll just switch the page and rely on state to pass the patient ID
    // TODO: A better state management for the currently viewed patient by the doctor
    setCurrentPage('doctor_patient_view');
  }
  
  if (isLoading && doctorPatients.length === 0) return <LoadingScreen />;

  return (
    <div className="p-4 space-y-4 pb-24">
      <header className="py-4 text-center">
        <h1 className="text-3xl font-display font-bold text-white text-shadow">Tableau de bord Médecin</h1>
        <p className="text-white/80">{userProfile?.email}</p>
      </header>
      
      <Card>
          <input
              type="text"
              placeholder="Rechercher un patient..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-3 bg-input-bg rounded-input border border-black/10"
          />
          <div className="flex justify-center bg-slate-200/60 rounded-pill p-1 mt-4">
              {(['all', 'accepted', 'pending', 'refused'] as const).map(status => (
                  <button 
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`w-1/4 py-2 rounded-pill font-semibold text-sm transition-all duration-300 ${statusFilter === status ? 'bg-white shadow-md text-emerald-main' : 'text-text-muted'}`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
              ))}
          </div>
      </Card>
      
      <div className="space-y-3">
          {filteredPatients.length === 0 && (
              <Card><p className="text-center text-text-muted">Aucun patient trouvé. Rappel: seuls les patients peuvent vous inviter.</p></Card>
          )}
          {filteredPatients.map(({ member, patient }) => (
              <Card key={member.id}>
                  <div className="flex justify-between items-center">
                      <div>
                          <p className="font-bold text-lg">{patient.prenom} {patient.nom}</p>
                          <p className="text-sm text-text-muted">Invité le {member.invitedAt?.toDate().toLocaleDateString() || 'N/A'}</p>
                      </div>
                       <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                           member.status === 'accepted' ? 'bg-emerald-main/20 text-emerald-main' : 
                           member.status === 'pending' ? 'bg-amber-500/20 text-amber-600' : 'bg-danger/20 text-danger'
                       }`}>
                           {member.status}
                       </span>
                  </div>
                  {member.status === 'pending' && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                          <button onClick={() => handleResponse(member.id, 'refused')} className="w-full bg-white text-danger font-bold py-2 rounded-button border border-slate-300">Refuser</button>
                          <button onClick={() => handleResponse(member.id, 'accepted')} className="w-full bg-emerald-main text-white font-bold py-2 rounded-button">Accepter</button>
                      </div>
                  )}
                  {member.status === 'accepted' && (
                       <div className="mt-4">
                           <div className="text-sm">Droits: {Object.entries(member.rights).filter(([,v]) => v).map(([k])=>k).join(', ')}</div>
                           <button onClick={() => openPatientRecord(patient)} className="w-full mt-2 bg-info text-white font-bold py-2 rounded-button">Ouvrir le dossier</button>
                       </div>
                  )}
              </Card>
          ))}
      </div>
    </div>
  );
};

export default DoctorDashboard;
