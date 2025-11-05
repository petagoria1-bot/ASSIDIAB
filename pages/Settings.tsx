

import React, { useState } from 'react';
import { usePatientStore } from '../store/patientStore';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore, Language } from '../store/settingsStore';
import Card from '../components/Card';
import useTranslations from '../hooks/useTranslations';
import { Page, Patient, EmergencyContact } from '../types';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

import CustomSelect from '../components/CustomSelect';
import LanguageIcon from '../components/icons/LanguageIcon';
import UserIcon from '../components/icons/UserIcon';
import TargetIcon from '../components/icons/TargetIcon';
import RatioIcon from '../components/icons/RatioIcon';
import EmergencyIcon from '../components/icons/EmergencyIcon';
import CloseIcon from '../components/icons/CloseIcon';
import ToggleSwitch from '../components/ToggleSwitch';

import FlagFR from '../components/icons/FlagFR';
import FlagEN from '../components/icons/FlagEN';
import FlagTR from '../components/icons/FlagTR';
import FlagAR from '../components/icons/FlagAR';
import FlagUR from '../components/icons/FlagUR';
import FlagPS from '../components/icons/FlagPS';
import FlagUK from '../components/icons/FlagUK';

interface SettingsProps {
  setCurrentPage: (page: Page) => void;
}

const Settings: React.FC<SettingsProps> = ({ setCurrentPage }) => {
  const { patient, updatePatient } = usePatientStore();
  const { logout } = useAuthStore();
  const { language, setLanguage, translateFood, toggleTranslateFood } = useSettingsStore();
  const t = useTranslations();

  const [localPatient, setLocalPatient] = useState<Patient | null>(patient);

  if (!localPatient) return null;
  
  const handleSave = () => {
      if (!localPatient.prenom || !localPatient.naissance) {
          toast.error(t.toast_nameAndBirthdateRequired);
          return;
      }
      updatePatient(localPatient);
      toast.success(t.toast_settingsSaved);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalPatient(p => p ? { ...p, [name]: value } : null);
  };

  const handleNestedChange = (path: (string|number)[], value: any) => {
    setLocalPatient(p => {
      if (!p) return null;
      const newPatient = JSON.parse(JSON.stringify(p)); // Deep copy
      let current: any = newPatient;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newPatient;
    });
  };

  const handleAddContact = () => {
    const newContact: EmergencyContact = { id: uuidv4(), lien: '', nom: '', tel: '' };
    handleNestedChange(['contacts', localPatient.contacts.length], newContact);
  };

  const handleRemoveContact = (id: string) => {
     handleNestedChange(['contacts'], localPatient.contacts.filter(c => c.id !== id));
  };
  
  const languageOptions = [
    { value: 'fr', label: 'Français', icon: <FlagFR /> },
    { value: 'en', label: 'English', icon: <FlagEN /> },
    { value: 'ar', label: 'العربية', icon: <FlagAR /> },
    { value: 'tr', label: 'Türkçe', icon: <FlagTR /> },
    { value: 'ur', label: 'اردو', icon: <FlagUR /> },
    { value: 'ps', label: 'پښتو', icon: <FlagPS /> },
    { value: 'uk', label: 'Українська', icon: <FlagUK /> },
  ];
  
  const inputClasses = "w-full p-2 bg-input-bg rounded-md border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-1 focus:ring-emerald-main/30";
  const iconClasses = "w-5 h-5 text-text-muted";
  
  return (
    <div className="p-4 space-y-4 pb-24">
      <header className="py-4 text-center">
        <h1 className="text-3xl font-display font-bold text-white text-shadow">{t.settings_title}</h1>
      </header>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <LanguageIcon className={iconClasses} />
          <h2 className="text-lg font-semibold text-text-title">{t.settings_language}</h2>
        </div>
        <CustomSelect options={languageOptions} value={language} onChange={(val) => setLanguage(val as Language)} />
        
        <div className="mt-4 pt-4 border-t border-slate-200/80">
          <div className="flex justify-between items-center">
            <label htmlFor="translate-toggle" className="font-medium text-text-main cursor-pointer" onClick={toggleTranslateFood}>
              {t.settings_translateFood}
            </label>
            <ToggleSwitch 
              isOn={translateFood}
              onToggle={toggleTranslateFood}
              ariaLabel={t.settings_translateFood}
            />
          </div>
          <p className="text-xs text-text-muted mt-1 pr-14">{t.settings_translateFood_description}</p>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <UserIcon className={iconClasses} />
          <h2 className="text-lg font-semibold text-text-title">{t.settings_profile}</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-text-muted">{t.common_firstName}</label>
            <input name="prenom" value={localPatient.prenom} onChange={handleInputChange} className={inputClasses} />
          </div>
          <div>
            <label className="text-sm font-medium text-text-muted">{t.common_birthDate}</label>
            <input name="naissance" type="date" value={localPatient.naissance} onChange={handleInputChange} className={inputClasses} />
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <TargetIcon className={iconClasses} />
          <h2 className="text-lg font-semibold text-text-title">{t.settings_glycemicTargets}</h2>
        </div>
        <div className="flex gap-4 items-center justify-center">
          <div>
            <label className="text-sm font-medium text-text-muted">{t.common_min} (g/L)</label>
            <input type="number" step="0.01" value={localPatient.cibles.gly_min} onChange={e => handleNestedChange(['cibles', 'gly_min'], parseFloat(e.target.value))} className={inputClasses}/>
          </div>
          <div>
            <label className="text-sm font-medium text-text-muted">{t.common_max} (g/L)</label>
            <input type="number" step="0.01" value={localPatient.cibles.gly_max} onChange={e => handleNestedChange(['cibles', 'gly_max'], parseFloat(e.target.value))} className={inputClasses}/>
          </div>
        </div>
      </Card>

      <Card>
         <div className="flex items-center gap-2 mb-3">
          <RatioIcon className={iconClasses} />
          <h2 className="text-lg font-semibold text-text-title">{t.settings_ratios}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
           {Object.keys(localPatient.ratios).map(moment => (
             <div key={moment}>
                <label className="text-sm font-medium text-text-muted">{t.mealTimes[moment as keyof typeof t.mealTimes]}</label>
                <input type="number" value={localPatient.ratios[moment as keyof typeof localPatient.ratios]} onChange={e => handleNestedChange(['ratios', moment], parseInt(e.target.value, 10))} className={inputClasses}/>
             </div>
           ))}
        </div>
      </Card>
      
      <Card>
        <div className="flex items-center gap-2 mb-3">
            <EmergencyIcon className={iconClasses} />
            <h2 className="text-lg font-semibold text-text-title">{t.settings_emergencyContacts}</h2>
        </div>
        <div className="space-y-3">
            {localPatient.contacts.map((contact, index) => (
                <div key={contact.id} className="grid grid-cols-12 gap-2 items-center">
                    <input placeholder={t.settings_contactRelation} value={contact.lien} onChange={e => handleNestedChange(['contacts', index, 'lien'], e.target.value)} className={`${inputClasses} col-span-4`} />
                    <input placeholder={t.common_name} value={contact.nom} onChange={e => handleNestedChange(['contacts', index, 'nom'], e.target.value)} className={`${inputClasses} col-span-4`} />
                    <input type="tel" placeholder={t.settings_contactPhone} value={contact.tel} onChange={e => handleNestedChange(['contacts', index, 'tel'], e.target.value)} className={`${inputClasses} col-span-3`} />
                    <button onClick={() => handleRemoveContact(contact.id)} className="text-danger hover:text-danger-dark col-span-1"><CloseIcon /></button>
                </div>
            ))}
            <button onClick={handleAddContact} className="text-sm font-semibold text-emerald-main hover:underline">{t.settings_addContact}</button>
        </div>
      </Card>

      <Card>
        <button onClick={() => setCurrentPage('pai')} className="w-full text-center text-lg font-semibold text-emerald-main hover:bg-mint-soft p-3 rounded-lg transition-colors">{t.settings_viewPai}</button>
      </Card>
      
      <div className="mt-6 flex flex-col space-y-2">
         <button onClick={handleSave} className="w-full bg-emerald-main text-white font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors shadow-sm">{t.common_saveChanges}</button>
        <button onClick={logout} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">{t.settings_logout}</button>
      </div>

    </div>
  );
};

export default Settings;