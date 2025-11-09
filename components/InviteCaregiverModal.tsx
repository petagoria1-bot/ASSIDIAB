import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { usePatientStore } from '../store/patientStore.ts';
import { CircleMemberRole, CircleMemberRights } from '../types.ts';
import useTranslations from '../hooks/useTranslations.ts';
import ToggleSwitch from './ToggleSwitch.tsx';
import ShareInvitationModal from './ShareInvitationModal.tsx';

const InviteCaregiverModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { inviteToCircle } = usePatientStore();
  const t = useTranslations();
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CircleMemberRole>('famille');
  const [rights, setRights] = useState<CircleMemberRights>({ read: true, write: false, alerts: false });
  const [isLoading, setIsLoading] = useState(false);
  const [invitationId, setInvitationId] = useState<string | null>(null);

  const caregiverRoles: CircleMemberRole[] = ['famille', 'medecin', 'infirmier', 'autre'];

  const handleToggle = (right: keyof CircleMemberRights) => {
    setRights(prev => ({ ...prev, [right]: !prev[right] }));
  };

  const handleInvite = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error(t.toast_invalidEmail);
      return;
    }
    setIsLoading(true);
    try {
      const newInvitationId = await inviteToCircle(email, role, rights);
      if (newInvitationId) {
        setInvitationId(newInvitationId);
      }
    } catch (error: any) {
      toast.error(error.message || t.toast_inviteError);
    }
    setIsLoading(false);
  };
  
  const handleFinalClose = () => {
    setInvitationId(null);
    onClose();
  }
  
  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-jade focus:ring-2 focus:ring-jade/30 transition-all duration-150";

  if (invitationId) {
    const invitationLink = `${window.location.origin}/invitation/${invitationId}`;
    return <ShareInvitationModal onClose={handleFinalClose} invitationLink={invitationLink} />;
  }

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-card-open" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-display font-semibold text-text-title mb-4 text-center">{t.invite_title}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">{t.invite_email_label}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} placeholder={t.invite_email_placeholder} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">{t.invite_role_label}</label>
            <select value={role} onChange={e => setRole(e.target.value as CircleMemberRole)} className={inputClasses}>
                {caregiverRoles.map(r => (
                    <option key={r} value={r}>{t.roles[r as keyof typeof t.roles]}</option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Permissions</label>
            <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <label>Lecture des données</label>
                    <ToggleSwitch isOn={rights.read} onToggle={() => handleToggle('read')} ariaLabel="Lecture" />
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <label>Écriture / Commentaires</label>
                    <ToggleSwitch isOn={rights.write} onToggle={() => handleToggle('write')} ariaLabel="Écriture" />
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <label>Alertes en temps réel</label>
                    <ToggleSwitch isOn={rights.alerts} onToggle={() => handleToggle('alerts')} ariaLabel="Alertes" />
                </div>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">{t.common_cancel}</button>
          <button onClick={handleInvite} disabled={isLoading} className="w-full bg-jade text-white font-bold py-3 rounded-button hover:opacity-90 transition-colors shadow-sm disabled:opacity-50">
            {isLoading ? t.common_loading : t.invite_button}
          </button>
        </div>
      </div>
    </div>
  );
  
  return createPortal(modalContent, document.body);
};

export default InviteCaregiverModal;