import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import useTranslations from '../hooks/useTranslations.ts';
import { Caregiver } from '../types.ts';
import { usePatientStore } from '../store/patientStore.ts';
import UsersIcon from './icons/UsersIcon.tsx';
import CheckCircleIcon from './icons/CheckCircleIcon.tsx';
import ConfirmDeleteModal from './ConfirmDeleteModal.tsx';

interface ViewInvitationModalProps {
  onClose: () => void;
  caregiver: Caregiver;
}

const ViewInvitationModal: React.FC<ViewInvitationModalProps> = ({ onClose, caregiver }) => {
  const t = useTranslations();
  const { getInvitationLinkForPendingCaregiver, removeCaregiver } = usePatientStore();
  
  const [copied, setCopied] = useState(false);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const canShare = typeof navigator.share === 'function';

  // The link is now fetched synchronously from the patient state
  const invitationLink = getInvitationLinkForPendingCaregiver(caregiver.email);

  const handleCopy = () => {
    if (!invitationLink) return;
    navigator.clipboard.writeText(invitationLink).then(() => {
      setCopied(true);
      toast.success(t.toast_invitationLinkCopied);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = async () => {
    if (!invitationLink || !canShare) return;
    try {
      await navigator.share({
        title: t.shareInvite_title,
        text: t.shareInvite_description,
        url: invitationLink,
      });
    } catch (error) {
      console.error('Error sharing invitation:', error);
    }
  };

  const handleDelete = async () => {
    try {
        await removeCaregiver(caregiver);
        toast.success(t.toast_invitationDeleted);
        onClose();
    } catch (error) {
        toast.error(t.toast_caregiverRemoveError);
    }
    setConfirmDeleteOpen(false);
  };
  
  const getRoleLabel = (role: string) => {
    const key = `role_${role}` as keyof typeof t;
    return t[key] || role;
  }

  const modalContent = (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
        <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-card-open" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-amber-100 rounded-full mb-3">
              <UsersIcon className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-display font-semibold text-text-title">{t.viewInvite_pendingTitle(caregiver.email)}</h3>
            <p className="text-text-muted text-sm mt-2">{t.viewInvite_pendingDesc}</p>
          </div>

          {invitationLink ? (
            <>
              <div className="mt-4 p-3 bg-input-bg rounded-lg text-emerald-main font-mono text-sm break-all border border-slate-200">
                  {invitationLink}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={handleCopy} className="w-full bg-emerald-main text-white font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors shadow-sm flex items-center justify-center gap-2">
                    {copied ? <CheckCircleIcon /> : null}
                    {copied ? t.shareInvite_copied : t.shareInvite_copyLink}
                </button>
                {canShare && (
                    <button onClick={handleShare} className="w-full bg-white text-text-main font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">
                        Partager
                    </button>
                )}
              </div>
            </>
          ) : (
            <div className="mt-4 p-3 bg-danger-soft text-danger-dark rounded-lg text-center font-semibold">Lien non trouvé. Veuillez renvoyer l'invitation.</div>
          )}

          <div className="mt-6 flex flex-col space-y-3">
              <button onClick={() => setConfirmDeleteOpen(true)} className="w-full bg-transparent text-danger font-bold py-2 rounded-button hover:bg-danger-soft/50 transition-colors">{t.viewInvite_delete}</button>
              <button onClick={onClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">{t.shareInvite_done}</button>
          </div>
        </div>
      </div>
      {isConfirmDeleteOpen && (
          <ConfirmDeleteModal
              onClose={() => setConfirmDeleteOpen(false)}
              onConfirm={handleDelete}
              title={t.viewInvite_delete_confirm_title}
              message={t.viewInvite_delete_confirm_message}
              confirmText={t.viewInvite_delete}
          />
      )}
    </>
  );
  
  return createPortal(modalContent, document.body);
};

export default ViewInvitationModal;
