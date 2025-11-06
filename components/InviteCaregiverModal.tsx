import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { usePatientStore } from '../store/patientStore';
import { CaregiverRole } from '../types';
import useTranslations from '../hooks/useTranslations';

interface InviteCaregiverModalProps {
  onClose: () => void;
}

const InviteCaregiverModal: React.FC<InviteCaregiverModalProps> = ({ onClose }) => {
  const { inviteCaregiver } = usePatientStore();
  const t = useTranslations();
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CaregiverRole>('family');

  const handleInvite = async () => {
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Veuillez entrer une adresse e-mail valide.");
      return;
    }

    try {
      await inviteCaregiver(email, role);
      toast.success(t.toast_invitationSent);
      onClose();
    } catch (error) {
      console.error("Failed to invite caregiver:", error);
      toast.error("Erreur lors de l'envoi de l'invitation.");
    }
  };
  
  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150";

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-card-open" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-display font-semibold text-text-title mb-4 text-center">{t.invite_title}</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="invite-email" className="block text-sm font-medium text-text-muted mb-1">{t.invite_email_label}</label>
            <input
              type="email"
              id="invite-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
              placeholder="exemple@email.com"
              autoFocus
            />
          </div>
          
          <div>
            <label htmlFor="invite-role" className="block text-sm font-medium text-text-muted mb-1">{t.invite_role_label}</label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as CaregiverRole)}
              className={inputClasses}
            >
              <option value="parent">{t.role_parent}</option>
              <option value="health_professional">{t.role_health_professional}</option>
              <option value="family">{t.role_family}</option>
              <option value="school">{t.role_school}</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">{t.common_cancel}</button>
          <button onClick={handleInvite} className="w-full bg-emerald-main text-white font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors shadow-sm">{t.invite_button}</button>
        </div>
      </div>
    </div>
  );
  
  return createPortal(modalContent, document.body);
};

export default InviteCaregiverModal;