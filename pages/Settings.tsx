import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore.ts';
import { useSettingsStore, Language } from '../store/settingsStore.ts';
import { usePatientStore } from '../store/patientStore.ts';
import Card from '../components/Card.tsx';
import useTranslations from '../hooks/useTranslations.ts';
import { Page, PatientProfile, CircleMember, CircleMemberRights } from '../types.ts';
import ArrowRightIcon from '../components/icons/ArrowRightIcon.tsx';
import LanguageIcon from '../components/icons/LanguageIcon.tsx';
import RatioIcon from '../components/icons/RatioIcon.tsx';
import UserIcon from '../components/icons/UserIcon.tsx';
import StatsIcon from '../components/icons/StatsIcon.tsx';
import EditIcon from '../components/icons/EditIcon.tsx';
import InviteCaregiverModal from '../components/InviteCaregiverModal.tsx';
import PermissionsModal from '../components/PermissionsModal.tsx';
import EditPaiModal from '../components/EditPaiModal.tsx';
import FlagFR from '../components/icons/FlagFR.tsx';
import FlagEN from '../components/icons/FlagEN.tsx';

interface SettingsProps {
  setCurrentPage: (page: Page) => void;
}

const SettingsRow: React.FC<{
  title: string;
  description?: string;
  onClick?: () => void;
  children: React.ReactNode;
  action?: React.ReactNode;
}> = ({ title, description, onClick, children, action }) => (
  <div
    className={`flex items-center justify-between p-4 bg-grey-light/40 rounded-lg transition-colors ${onClick ? 'cursor-pointer hover:bg-grey-light/80' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-mint/50 rounded-full">{children}</div>
      <div>
        <p className="font-semibold text-text-title">{title}</p>
        {description && <p className="text-sm text-text-muted">{description}</p>}
      </div>
    </div>
    {action || (onClick && <ArrowRightIcon className="w-6 h-6 text-text-muted" />)}
  </div>
);

const Settings: React.FC<SettingsProps> = ({ setCurrentPage }) => {
  const t = useTranslations();
  const { logout, userProfile } = useAuthStore();
  const { language, setLanguage } = useSettingsStore();
  const { patient, circleMembers, updateCircleMemberRights, removeCircleMember, updatePatientProfile } = usePatientStore();
  
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CircleMember | null>(null);
  const [isEditPaiModalOpen, setEditPaiModalOpen] = useState(false);

  const handleSavePermissions = (member: CircleMember, rights: CircleMemberRights) => {
    updateCircleMemberRights(member, rights);
    setEditingMember(null);
  };
  
  const handleSavePai = (updatedPatientData: Partial<PatientProfile>) => {
    updatePatientProfile(updatedPatientData);
    setEditPaiModalOpen(false);
  };

  const languages: { code: Language; name: string; flag: React.ReactNode }[] = [
    { code: 'fr', name: 'Français', flag: <FlagFR /> },
    { code: 'en', name: 'English', flag: <FlagEN /> },
  ];

  if (!patient) return null;

  return (
    <div className="p-4 space-y-6 pb-24">
      <header className="py-4 text-center">
        <h1 className="text-3xl font-display font-bold text-white text-shadow">{t.settings_title}</h1>
      </header>
      
      <Card className="flex items-center gap-4">
        <UserIcon className="w-16 h-16 text-jade p-2 bg-mint/40 rounded-full" />
        <div>
            <h2 className="text-2xl font-bold font-display text-text-title">{patient.prenom} {patient.nom}</h2>
            <p className="text-text-muted">{userProfile?.email || ''}</p>
        </div>
      </Card>

      <div className="space-y-2">
        <h2 className="text-sm font-bold uppercase text-text-muted px-2">{t.settings_profile}</h2>
        <SettingsRow title={t.settings_pai} description="Ratios, cibles, corrections..." onClick={() => setEditPaiModalOpen(true)}>
          <RatioIcon className="w-6 h-6 text-jade" />
        </SettingsRow>
         <SettingsRow title={t.settings_food} description="Gérer la bibliothèque d'aliments" onClick={() => setCurrentPage('food')}>
          <StatsIcon className="w-6 h-6 text-jade" />
        </SettingsRow>
      </div>
      
       <div className="space-y-2">
        <h2 className="text-sm font-bold uppercase text-text-muted px-2">{t.settings_caregivers}</h2>
        {circleMembers.filter(m => m.role !== 'owner').map(member => (
           <div key={member.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                    <p className="font-semibold text-text-title">{member.memberEmail}</p>
                    <p className="text-xs text-text-muted">{t[`role_${member.role}` as keyof typeof t]} - <span className={member.status === 'accepted' ? 'text-jade' : 'text-amber-600'}>{member.status}</span></p>
                </div>
                <button onClick={() => setEditingMember(member) } className="text-text-muted hover:text-jade p-1"><EditIcon /></button>
           </div>
        ))}
        <button onClick={() => setInviteModalOpen(true)} className="w-full mt-2 text-jade text-sm font-bold py-2 rounded-button bg-white hover:bg-mint/50 transition-colors">
            + {t.invite_title}
        </button>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-bold uppercase text-text-muted px-2">{t.settings_display}</h2>
        <SettingsRow title={t.settings_language} description={languages.find(l => l.code === language)?.name}>
            <LanguageIcon className="w-6 h-6 text-jade" />
            <select value={language} onChange={e => setLanguage(e.target.value as Language)} className="bg-transparent font-semibold text-text-title focus:outline-none">
                {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
        </SettingsRow>
      </div>

      <div className="pt-4">
        <button onClick={logout} className="w-full bg-white text-coral font-bold py-3 rounded-button border border-slate-300 hover:bg-coral/10 transition-colors">
          {t.settings_logout}
        </button>
      </div>
      
      {isInviteModalOpen && <InviteCaregiverModal onClose={() => setInviteModalOpen(false)} />}
      {editingMember && <PermissionsModal member={editingMember} onClose={() => setEditingMember(null)} onSave={handleSavePermissions} onRemove={removeCircleMember} />}
      {isEditPaiModalOpen && patient && <EditPaiModal patient={patient} onClose={() => setEditPaiModalOpen(false)} onSave={handleSavePai} />}
    </div>
  );
};

export default Settings;