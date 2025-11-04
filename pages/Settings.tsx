import React, { useState, useEffect, useRef } from 'react';
import { usePatientStore } from '../store/patientStore';
import { useAuthStore } from '../store/authStore';
import { Page, Patient, CorrectionRule, EmergencyContact } from '../types';
import { MEAL_TIMES } from '../constants';
import Card from '../components/Card';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import AddFoodModal from '../components/AddFoodModal';
import { db } from '../services/db';


interface SettingsProps {
  setCurrentPage: (page: Page) => void;
}

const Settings: React.FC<SettingsProps> = ({ setCurrentPage }) => {
  const { patient, updatePatient } = usePatientStore();
  const { logout } = useAuthStore();
  const [formData, setFormData] = useState<Patient | null>(null);
  const [isAddFoodModalOpen, setAddFoodModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (patient) {
      // Deep copy to avoid direct mutation of zustand state
      setFormData(JSON.parse(JSON.stringify(patient)));
    }
  }, [patient]);
  
  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150";

  if (!formData) {
    return <div className="p-4">Chargement...</div>;
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleNestedInputChange = (section: keyof Patient, name: string, value: string | number) => {
    setFormData(prev => {
      if (!prev) return null;
      const sectionData = prev[section];
      if (typeof sectionData === 'object' && sectionData !== null && !Array.isArray(sectionData)) {
        return {
          ...prev,
          [section]: {
            ...(sectionData as object),
            [name]: value,
          },
        };
      }
      return prev;
    });
  };

  const handleCorrectionChange = (index: number, field: keyof CorrectionRule, value: number) => {
    if (isNaN(value) && field !== 'max') return;
    const newCorrections = [...formData.corrections];
    const originalRule = patient?.corrections.find((r, i) => i === index);
    if (originalRule) {
        newCorrections[index] = { ...newCorrections[index], [field]: value };
        setFormData({ ...formData, corrections: newCorrections });
    }
  };
  
  const handleContactChange = (index: number, field: keyof Omit<EmergencyContact, 'id'>, value: string) => {
    const newContacts = [...formData.contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setFormData({ ...formData, contacts: newContacts });
  };
  
  const addContact = () => {
    const newContacts = [...formData.contacts, {id: uuidv4(), lien: '', nom: '', tel: ''}];
    setFormData({...formData, contacts: newContacts});
  }

  const removeContact = (id: string) => {
    const newContacts = formData.contacts.filter(c => c.id !== id);
    setFormData({...formData, contacts: newContacts});
  }

  const handleSave = () => {
    if (formData) {
      // Simple validation
      if (!formData.prenom || !formData.naissance) {
        toast.error("Le prénom et la date de naissance sont requis.");
        return;
      }
      updatePatient(formData);
      toast.success('Réglages enregistrés !');
    }
  };

  const handleExportData = async () => {
    try {
      const users = await db.users.toArray();
      const patients = await db.patients.toArray();
      const mesures = await db.mesures.toArray();
      const repas = await db.repas.toArray();
      const injections = await db.injections.toArray();
      const foodLibrary = await db.foodLibrary.toArray();
      const favoriteMeals = await db.favoriteMeals.toArray();
      
      const exportData = {
        version: 2,
        exportedAt: new Date().toISOString(),
        data: { users, patients, mesures, repas, injections, foodLibrary, favoriteMeals }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diab-assistant-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Données exportées avec succès !");
    } catch (error) {
      console.error("Failed to export data:", error);
      toast.error("L'exportation des données a échoué.");
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') throw new Error("File is not a valid text file.");
            const imported = JSON.parse(text);

            if (!imported.data || !imported.data.patients || !imported.data.users) {
                throw new Error("Fichier de sauvegarde invalide ou corrompu.");
            }

            if (!window.confirm("Êtes-vous sûr ? L'importation écrasera toutes les données existantes. Cette action est irréversible.")) {
                return;
            }
            
            await db.transaction('rw', db.users, db.patients, db.mesures, db.repas, db.injections, db.foodLibrary, db.favoriteMeals, async () => {
                // Fix: Iterate over db.tables directly. Using Object.values() confuses TypeScript's type inference.
                await Promise.all(db.tables.map(table => table.clear()));
                await db.users.bulkAdd(imported.data.users);
                await db.patients.bulkAdd(imported.data.patients);
                await db.mesures.bulkAdd(imported.data.mesures);
                await db.repas.bulkAdd(imported.data.repas);
                await db.injections.bulkAdd(imported.data.injections);
                await db.foodLibrary.bulkAdd(imported.data.foodLibrary);
                await db.favoriteMeals.bulkAdd(imported.data.favoriteMeals);
            });
            
            toast.success("Données importées ! L'application va redémarrer.");
            setTimeout(() => window.location.reload(), 1500);

        } catch (error) {
            console.error("Failed to import data:", error);
            toast.error(`Erreur d'importation: ${error instanceof Error ? error.message : 'Fichier invalide.'}`);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };
  
  const triggerImport = () => fileInputRef.current?.click();

  return (
    <div className="p-5 space-y-4">
      <header className="py-4">
        <h1 className="text-3xl font-display font-bold text-white text-shadow text-center">Réglages</h1>
      </header>
      
      <Card>
          <h2 className="text-xl font-display font-semibold text-text-title mb-3">Profil</h2>
          <div className="space-y-3">
            <div>
                <label className="text-sm font-medium text-text-muted">Prénom</label>
                <input type="text" name="prenom" value={formData.prenom} onChange={handleInputChange} className={inputClasses}/>
            </div>
            <div>
                <label className="text-sm font-medium text-text-muted">Date de naissance</label>
                <input type="date" name="naissance" value={formData.naissance} onChange={handleInputChange} className={inputClasses}/>
            </div>
          </div>
      </Card>
      
      <Card>
          <h2 className="text-xl font-display font-semibold text-text-title mb-3">Cibles Glycémiques (g/L)</h2>
          <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="text-sm font-medium text-text-muted">Min</label>
                  <input type="number" step="0.01" value={formData.cibles.gly_min} onChange={e => handleNestedInputChange('cibles', 'gly_min', parseFloat(e.target.value) || 0)} className={inputClasses}/>
              </div>
              <div>
                  <label className="text-sm font-medium text-text-muted">Max</label>
                  <input type="number" step="0.01" value={formData.cibles.gly_max} onChange={e => handleNestedInputChange('cibles', 'gly_max', parseFloat(e.target.value) || 0)} className={inputClasses}/>
              </div>
          </div>
      </Card>
      
      <Card>
          <h2 className="text-xl font-display font-semibold text-text-title mb-3">Ratios (g pour 1U)</h2>
          <div className="grid grid-cols-2 gap-4">
              {Object.keys(formData.ratios).map((key) => (
                  <div key={key}>
                      <label className="text-sm font-medium text-text-muted">{MEAL_TIMES[key as keyof typeof MEAL_TIMES]}</label>
                      <input type="number" value={formData.ratios[key as keyof typeof MEAL_TIMES]} onChange={e => handleNestedInputChange('ratios', key, parseInt(e.target.value, 10) || 0)} className={inputClasses}/>
                  </div>
              ))}
          </div>
      </Card>
      
       <Card>
        <h2 className="text-xl font-display font-semibold text-text-title mb-3">Schéma de Correction</h2>
        <div className="space-y-2">
          {formData.corrections.sort((a,b) => a.max - b.max).map((rule, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-text-muted">Si &le;</span>
              <input type="number" step="0.01" value={rule.max === Infinity ? '' : rule.max} placeholder="∞" onChange={e => handleCorrectionChange(index, 'max', parseFloat(e.target.value) || Infinity)} className={`${inputClasses} w-20 text-center`}/>
              <span className="text-sm text-text-muted">, +</span>
              <input type="number" value={rule.addU} onChange={e => handleCorrectionChange(index, 'addU', parseInt(e.target.value, 10))} className={`${inputClasses} w-16 text-center`}/>
              <span className="text-sm text-text-muted">U</span>
            </div>
          ))}
           <div className="flex items-center gap-2 mt-3 pt-3 border-t border-black/10">
            <label className="text-sm font-medium text-text-muted">Délai re-correction (h)</label>
            <input type="number" name="correctionDelayHours" value={formData.correctionDelayHours} onChange={e => setFormData({...formData, correctionDelayHours: parseInt(e.target.value) || 0})} className={`${inputClasses} w-20`}/>
           </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-display font-semibold text-text-title mb-3">Contacts d'Urgence</h2>
        {formData.contacts.map((contact, index) => (
          <div key={contact.id} className="grid grid-cols-3 gap-2 mb-2 p-2 border rounded-lg border-black/5">
            <input value={contact.nom} onChange={e => handleContactChange(index, 'nom', e.target.value)} placeholder="Nom" className={`${inputClasses} col-span-1`}/>
            <input value={contact.lien} onChange={e => handleContactChange(index, 'lien', e.target.value)} placeholder="Lien (Maman...)" className={`${inputClasses} col-span-1`}/>
            <input type="tel" value={contact.tel} onChange={e => handleContactChange(index, 'tel', e.target.value)} placeholder="Téléphone" className={`${inputClasses} col-span-2`}/>
            <button onClick={() => removeContact(contact.id)} className="col-span-1 bg-danger/20 text-danger rounded-button text-sm font-semibold">Retirer</button>
          </div>
        ))}
        <button onClick={addContact} className="w-full text-emerald-main font-semibold py-2 rounded-button bg-emerald-main/10 hover:bg-emerald-main/20 transition-colors mt-2">+ Ajouter contact</button>
      </Card>
      
      <Card>
        <h2 className="text-xl font-display font-semibold text-text-title mb-3">Notes pour le PAI</h2>
        <textarea name="notes_pai" value={formData.notes_pai} onChange={handleInputChange} rows={4} className={inputClasses}></textarea>
      </Card>

      <button onClick={handleSave} className="w-full bg-emerald-main text-white font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors shadow-lg">
        Enregistrer les modifications
      </button>
      
      <Card>
        <h2 className="text-xl font-display font-semibold text-text-title mb-3">Gestion des Données</h2>
        <div className="space-y-2">
            <button onClick={() => setAddFoodModalOpen(true)} className="w-full text-left font-semibold py-3 px-4 rounded-button bg-white border border-slate-300 hover:bg-slate-50 transition-colors text-text-main">
                Ajouter un aliment
            </button>
            <button onClick={handleExportData} className="w-full text-left font-semibold py-3 px-4 rounded-button bg-white border border-slate-300 hover:bg-slate-50 transition-colors text-text-main">
                Exporter les données (.json)
            </button>
            <button onClick={triggerImport} className="w-full text-left font-semibold py-3 px-4 rounded-button bg-white border border-slate-300 hover:bg-slate-50 transition-colors text-text-main">
                Importer des données (.json)
            </button>
            <input type="file" accept=".json" onChange={handleImportData} ref={fileInputRef} className="hidden" />
        </div>
      </Card>

      <div className="mt-6 flex flex-col items-center gap-4">
          <button onClick={() => setCurrentPage('pai')} className="text-white/80 hover:text-white font-semibold">
              Voir le PAI complet
          </button>
          <button onClick={logout} className="w-full bg-white/20 text-white font-bold py-3 rounded-button hover:bg-white/30 transition-colors">
              Déconnexion
          </button>
      </div>
      
      {isAddFoodModalOpen && <AddFoodModal onClose={() => setAddFoodModalOpen(false)} />}
    </div>
  );
};

export default Settings;