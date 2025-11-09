import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import useTranslations from '../hooks/useTranslations.ts';
import { CircleMember, CircleMemberRights } from '../types.ts';
import ToggleSwitch from './ToggleSwitch.tsx';
import ConfirmDeleteModal from './ConfirmDeleteModal.tsx';

interface PermissionsModalProps {
  onClose: () => void;
  onSave: (member: CircleMember, rights: CircleMemberRights) => void;
  onRemove: (member: CircleMember) => void;
  member: CircleMember;
}

const PermissionRow: React.FC<{
    label: string;
    isOn: boolean;
    onToggle: () => void;
}> = ({ label, isOn, onToggle }) => (
    <div className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center">
        <label className="font-semibold text-text-main cursor-pointer" onClick={onToggle}>{label}</label>
        <ToggleSwitch isOn={isOn} onToggle={onToggle} ariaLabel={label} />
    </div>
);

const PermissionsModal: React.FC<PermissionsModalProps> = ({ onClose, onSave, onRemove, member }) => {
  const t = useTranslations();
  const [rights, setRights] = useState<CircleMemberRights>(member.rights);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleToggle = (right: keyof CircleMemberRights) => {
    setRights(prev => ({ ...prev, [right]: !prev[right] }));
  };
  
  const handleSave = () => {
    onSave(member, rights);
  };

  const handleDelete = () => {
    onRemove(member);
    onClose();
  };

  const modalContent = (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
        <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-md border border-slate-200/75 animate-card-open" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-xl font-display font-semibold text-text-title mb-1 text-center">{t.permissions_title(member.memberEmail)}</h3>
          <p className="text-center text-text-muted text-sm mb-4">{t.roles[member.role as keyof typeof t.roles]}</p>

          <div className="space-y-3">
              <PermissionRow label="Lecture des données" isOn={rights.read} onToggle={() => handleToggle('read')} />
              <PermissionRow label="Écriture / Commentaires" isOn={rights.write} onToggle={() => handleToggle('write')} />
              <PermissionRow label="Alertes en temps réel" isOn={rights.alerts} onToggle={() => handleToggle('alerts')} />
          </div>
          
          <div className="mt-6 border-t pt-4 space-y-2">
            <button onClick={handleSave} className="w-full bg-jade text-white font-bold py-3 rounded-button hover:opacity-90 transition-colors shadow-sm">{t.common_save}</button>
            <button onClick={() => setConfirmDeleteOpen(true)} className="w-full bg-transparent text-danger font-bold py-2 rounded-button hover:bg-danger-soft/50 transition-colors">Retirer l'accès</button>
            <button onClick={onClose} className="w-full text-text-muted font-semibold py-2 rounded-button hover:bg-slate-100 transition-colors">{t.common_cancel}</button>
          </div>
        </div>
      </div>
      {isConfirmDeleteOpen && (
          <ConfirmDeleteModal
              onClose={() => setConfirmDeleteOpen(false)}
              onConfirm={handleDelete}
              title="Retirer l'accès ?"
              message={`Cette action est irréversible. ${member.memberEmail} n'aura plus accès aux données.`}
              confirmText="Retirer"
          />
      )}
    </>
  );

  return createPortal(modalContent, document.body);
};

export default PermissionsModal;
