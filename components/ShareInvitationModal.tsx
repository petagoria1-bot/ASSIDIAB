import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import useTranslations from '../hooks/useTranslations.ts';
import CheckCircleIcon from './icons/CheckCircleIcon.tsx';
import UsersIcon from './icons/UsersIcon.tsx';

interface ShareInvitationModalProps {
  onClose: () => void;
  invitationLink: string;
}

const ShareInvitationModal: React.FC<ShareInvitationModalProps> = ({ onClose, invitationLink }) => {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(invitationLink).then(() => {
      setCopied(true);
      toast.success(t.toast_invitationLinkCopied);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-card-open" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-mint-soft rounded-full mb-3">
                <UsersIcon className="w-8 h-8 text-emerald-main"/>
            </div>
            <h3 className="text-xl font-display font-semibold text-text-title">{t.shareInvite_title}</h3>
            <p className="text-text-muted text-sm mt-2">{t.shareInvite_description}</p>
        </div>

        <div className="mt-4 p-3 bg-input-bg rounded-lg text-emerald-main font-mono text-sm break-all border border-slate-200">
            {invitationLink}
        </div>

        <div className="mt-4">
          <button 
            onClick={handleCopy} 
            className="w-full bg-emerald-main text-white font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {copied ? <CheckCircleIcon /> : null}
            {copied ? t.shareInvite_copied : t.shareInvite_copyLink}
          </button>
        </div>

        <div className="mt-2">
          <button onClick={onClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">{t.shareInvite_done}</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ShareInvitationModal;