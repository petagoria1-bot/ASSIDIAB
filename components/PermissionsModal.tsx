import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import useTranslations from '../hooks/useTranslations';
import { Caregiver, CaregiverPermissions } from '../types';
import ToggleSwitch from './ToggleSwitch';
import EmergencyIcon from './icons/EmergencyIcon';

interface PermissionsModalProps {
  onClose: () => void;
  onSave: (caregiverUid: string, permissions: CaregiverPermissions) => void;
  caregiver: Caregiver;
}

const PermissionRow: React.FC<{
    label: string;
    description: string;
    warning?: string;
    isOn: boolean;
    onToggle: () => void;
}> = ({ label, description, warning, isOn, onToggle }) => (
    <div className="bg-white p-3 rounded-lg border border-slate-200">
        <div className="flex justify-between items-start">
            <div>
                <label className="font-semibold text-text-main cursor-pointer" onClick={onToggle}>{label}</label>
                <p className="text-xs text-text-muted pr-4">{description}</p>
            </div>
            <ToggleSwitch isOn={isOn} onToggle={onToggle} ariaLabel={label} />
        </div>
        {warning && isOn && (
            <div className="mt-2 p-2 bg-danger-soft text-danger-dark text-xs font-semibold rounded-md flex items-start gap-2">
                <EmergencyIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{warning}</span>
            </div>
        )}
    </div>
);


const PermissionsModal: React.FC<PermissionsModalProps> = ({ onClose, onSave, caregiver }) => {
  const t = useTranslations();
  const [permissions, setPermissions] = useState<CaregiverPermissions>(caregiver.permissions);

  const handleToggle = (permission: keyof CaregiverPermissions) => {
    setPermissions(prev => ({ ...prev, [permission]: !prev[permission] }));
  };
  
  const handleSave = () => {
    onSave(caregiver.userUid, permissions);
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-md border border-slate-200/75 animate-card-open" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-display font-semibold text-text-title mb-1 text-center">{t.permissions_title(caregiver.email)}</h3>
        <p className="text-center text-text-muted text-sm mb-4">{t.role_parent}</p>

        <div className="space-y-3">
            <PermissionRow 
                label={t.permissions_permission_canViewJournal}
                description={t.permissions_permission_canViewJournal_desc}
                isOn={permissions.canViewJournal}
                onToggle={() => handleToggle('canViewJournal')}
            />
            <PermissionRow 
                label={t.permissions_permission_canEditJournal}
                description={t.permissions_permission_canEditJournal_desc}
                isOn={permissions.canEditJournal}
                onToggle={() => handleToggle('canEditJournal')}
            />
            <PermissionRow 
                label={t.permissions_permission_canEditPAI}
                description={t.permissions_permission_canEditPAI_desc}
                warning={t.permissions_warning_critical}
                isOn={permissions.canEditPAI}
                onToggle={() => handleToggle('canEditPAI')}
            />
            <PermissionRow 
                label={t.permissions_permission_canManageFamily}
                description={t.permissions_permission_canManageFamily_desc}
                warning={t.permissions_warning_admin}
                isOn={permissions.canManageFamily}
                onToggle={() => handleToggle('canManageFamily')}
            />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">{t.common_cancel}</button>
          <button onClick={handleSave} className="w-full bg-emerald-main text-white font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors shadow-sm">{t.common_save}</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PermissionsModal;