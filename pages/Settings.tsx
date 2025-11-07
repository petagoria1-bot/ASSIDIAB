import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore.ts';
import { useSettingsStore, Language } from '../store/settingsStore.ts';
import { usePatientStore } from '../store/patientStore.ts';
import Card from '../components/Card.tsx';
import useTranslations from '../hooks/useTranslations.ts';
// FIX: Imported the 'Patient' type to resolve a 'Cannot find name' error.
import { Page, Patient, Caregiver, CaregiverPermissions } from '../types.ts';
import ArrowRightIcon from '../components/icons/ArrowRightIcon.tsx';
import LanguageIcon from '../components/icons/LanguageIcon.tsx';
import ToggleSwitch from '../components/ToggleSwitch.tsx';
import FlagFR from '../components/icons/FlagFR.tsx';
import FlagEN from '../components/icons/FlagEN.tsx';
import FlagTR from '../components/icons/FlagTR.tsx';
import FlagAR from '../components/icons/FlagAR.tsx';
import FlagUR from '../components/icons/FlagUR.tsx';
import FlagPS from '../components/icons/FlagPS.tsx';
import FlagUK from '../components/icons/FlagUK.tsx';
import RatioIcon from '../components/icons/RatioIcon.tsx';
import UsersIcon from '../components/icons/UsersIcon.tsx';
import UserIcon from '../components/icons/UserIcon.tsx';
import StatsIcon from '../components/icons/StatsIcon.tsx';
import EditIcon from '../components/icons/EditIcon.tsx';
import InviteCaregiverModal from '../components/InviteCaregiverModal.tsx';
import PermissionsModal from '../components/PermissionsModal.tsx';
import ViewInvitationModal from '../components/ViewInvitationModal.tsx';
import EditPaiModal from '../components/EditPaiModal.tsx';

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
    className={`flex items-center justify-between p-4 bg-white rounded-lg transition-colors ${onClick ? 'cursor-pointer hover:bg-slate-50' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-input-bg rounded-full">{children}</div>
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
  const { logout, currentUser } = useAuthStore();
  const { language, setLanguage, showRatioReminder, toggleShowRatioReminder } = useSettingsStore();
  const { patient, updatePatient, updateCaregiverPermissions } = usePatientStore();
  
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState<Caregiver | null>(null);
  const [viewingInvitation, setViewingInvitation] = useState<Caregiver | null>(null);
  const [isEditPaiModalOpen, setEditPaiModalOpen] = useState(false);

  const handleSavePermissions = (email: string, permissions: CaregiverPermissions) => {
    updateCaregiverPermissions(email, permissions);
    setEditingPermissions(null);
  };
  
  const handleSavePai = (updatedPatient: Patient) => {
    updatePatient(updatedPatient);
    setEditPaiModalOpen(false);
  };

  const languages: { code: Language; name: string; flag: React.ReactNode }[] = [
    { code: 'fr', name: 'Français', flag: <FlagFR /> },
    { code: 'en', name: 'English', flag: <FlagEN /> },
    { code: 'tr', name: 'Türkçe', flag: <FlagTR /> },
    { code: 'ar', name: 'العربية', flag: <FlagAR /> },
    { code: 'ur', name: 'اردو', flag: <FlagUR /> },
    { code: 'ps', name: 'پښتو', flag: <FlagPS /> },
    { code: 'uk', name: 'Українська', flag: <FlagUK /> },
  ];

  if (!patient) return null;

  const owner = patient.caregivers.find(c => c.role === 'owner');

  return (
    <div className="p-4 space-y-6 pb-24">
      <header className="py-4 text-center">
        <h1 className="text-3xl font-display font-bold text-white text-shadow">{t.settings_title}</h1>
      </header>

      <div className="space-y-2">
        <h2 className="text-sm font-bold uppercase text-text-muted px-2">{t.settings_profile}</h2>
        <SettingsRow title={patient.prenom} description={currentUser?.email || ''} onClick={() => setCurrentPage('pai')}>
          <UserIcon className="w-6 h-6 text-emerald-main" />
        </SettingsRow>
        <SettingsRow title={t.settings_pai} description="Ratios, cibles, corrections..." onClick={() => setEditPaiModalOpen(true)}>
          <RatioIcon className="w-6 h-6 text-emerald-main" />
        </SettingsRow>
         <SettingsRow title={t.settings_food} description="Gérer la bibliothèque d'aliments" onClick={() => setCurrentPage('food')}>
          <StatsIcon className="w-6 h-6 text-emerald-main" />
        </SettingsRow>
      </div>
      
       <div className="space-y-2">
        <h2 className="text-sm font-bold uppercase text-text-muted px-2">{t.settings_caregivers}</h2>
        {patient.caregivers.map(c => (
           <div key={c.email} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                    <p className="font-semibold text-text-title">{c.email}</p>
                    <p className="text-xs text-text-muted">{t[`role_${c.role}` as keyof typeof t]} - <span className={c.status === 'active' ? 'text-emerald-main' : 'text-amber-600'}>{c.status}</span></p>
                </div>
                {owner?.userUid === currentUser?.uid && c.role !== 'owner' && (
                    <button onClick={() => c.status === 'active' ? setEditingPermissions(c) : setViewingInvitation(c) } className="text-text-muted hover:text-emerald-main p-1"><EditIcon /></button>
                )}
           </div>
        ))}
         {owner?.userUid === currentUser?.uid && (
            <button onClick={() => setInviteModalOpen(true)} className="w-full mt-2 text-emerald-main text-sm font-bold py-2 rounded-button bg-white hover:bg-mint-soft transition-colors">
                + {t.invite_title}
            </button>
         )}
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-bold uppercase text-text-muted px-2">{t.settings_display}</h2>
        <SettingsRow title={t.settings_language} description={languages.find(l => l.code === language)?.name}>
            <LanguageIcon className="w-6 h-6 text-emerald-main" />
            <select value={language} onChange={e => setLanguage(e.target.value as Language)} className="bg-transparent font-semibold text-text-title focus:outline-none">
                {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
        </SettingsRow>
        <SettingsRow title={t.settings_animations} description={t.settings_animations_desc} onClick={() => setCurrentPage('illustrations')}>
            <StatsIcon className="w-6 h-6 text-emerald-main" />
        </SettingsRow>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-bold uppercase text-text-muted px-2">{t.settings_notifications}</h2>
        <SettingsRow title={t.settings_ratioReminder} description={t.settings_ratioReminder_desc}>
          <RatioIcon className="w-6 h-6 text-emerald-main" />
          <ToggleSwitch isOn={showRatioReminder} onToggle={toggleShowRatioReminder} ariaLabel={t.settings_ratioReminder} />
        </SettingsRow>
      </div>
      
      <div className="pt-4">
        <button onClick={logout} className="w-full bg-white text-danger font-bold py-3 rounded-button border border-slate-300 hover:bg-danger-soft/50 transition-colors">
          {t.settings_logout}
        </button>
      </div>
      
      {isInviteModalOpen && <InviteCaregiverModal onClose={() => setInviteModalOpen(false)} />}
      {editingPermissions && <PermissionsModal caregiver={editingPermissions} onClose={() => setEditingPermissions(null)} onSave={handleSavePermissions} />}
      {viewingInvitation && <ViewInvitationModal caregiver={viewingInvitation} onClose={() => setViewingInvitation(null)} />}
      {isEditPaiModalOpen && <EditPaiModal patient={patient} onClose={() => setEditPaiModalOpen(false)} onSave={handleSavePai} />}
    </div>
  );
};

export default Settings;
