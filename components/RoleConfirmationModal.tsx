import React from 'react';
import { createPortal } from 'react-dom';
import useTranslations from '../hooks/useTranslations.ts';
import { usePatientStore } from '../store/patientStore.ts';
import { useAuthStore } from '../store/authStore.ts';
import UsersIcon from './icons/UsersIcon.tsx';

const RoleConfirmationModal: React.FC = () => {
  const { pendingInvitation, handleInvitation } = usePatientStore();
  const { currentUser, logout } = useAuthStore();
  const t = useTranslations();

  if (!pendingInvitation || !currentUser) {
    logout(); // Safety logout if state is inconsistent
    return null;
  }
  
  const handleConfirm = () => {
    handleInvitation(pendingInvitation, true, currentUser);
  };
  
  const handleDecline = () => {
    const declineStrings = {
        messageText: t.message_invitationDeclined(currentUser.email!, pendingInvitation.patientName),
        fromSystem: t.inbox_fromSystem
    };
    handleInvitation(pendingInvitation, false, currentUser, declineStrings);
  };
  
  const roleLabel = t[`role_${pendingInvitation.caregiver.role}` as keyof typeof t] || pendingInvitation.caregiver.role;

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-card-open">
        <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-mint-soft rounded-full mb-3">
                <UsersIcon className="w-8 h-8 text-emerald-main"/>
            </div>
            <h3 className="text-xl font-display font-semibold text-text-title">{t.roleConfirmation_title}</h3>
            <p className="text-text-muted mt-2" dangerouslySetInnerHTML={{ __html: t.roleConfirmation_message(pendingInvitation.patientName, roleLabel as string).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            <p className="text-text-main mt-4 font-semibold">{t.roleConfirmation_isThisCorrect}</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={handleDecline} className="w-full bg-white text-danger font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">{t.roleConfirmation_decline}</button>
          <button onClick={handleConfirm} className="w-full bg-emerald-main text-white font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors shadow-sm">{t.roleConfirmation_confirmAndAccess}</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RoleConfirmationModal;