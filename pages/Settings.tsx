import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { usePatientStore } from '../store/patientStore';
import { useAuthStore } from '../store/authStore';
import { Patient, CorrectionRule, MealTime, Page, EmergencyContact } from '../types';
import toast from 'react-hot-toast';
import { MEAL_TIMES } from '../constants';
import { db } from '../services/db';

const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
    </svg>
);
const ExportIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);
const ImportIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
);
const BookOpen: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
);
const FileText: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
);
const AlertTriangle: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);
const Trash2: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

interface SettingsProps {
  setCurrentPage: (page: Page) => void;
}

const Settings: React.FC<SettingsProps> = ({ setCurrentPage }) => {
  const { patient, updatePatient } = usePatientStore();
  const { logout, login, currentUser } = useAuthStore();
  
  const [formStrings, setFormStrings] = useState<Record<string, string>>({});
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [notesPai, setNotesPai] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  useEffect(() => {
    if (patient) {
      const strings: Record<string, string> = {
        prenom: patient.prenom || '',
        naissance: patient.naissance || '',
        gly_min: (patient.cibles?.gly_min ?? '').toString(),
        gly_max: (patient.cibles?.gly_max ?? '').toString(),
        maxBolus: (patient.maxBolus ?? '').toString(),
        correctionDelayHours: (patient.correctionDelayHours ?? '').toString(),
      };

      for (const moment in MEAL_TIMES) {
        strings[`ratio_${moment}`] = (patient.ratios?.[moment as MealTime] ?? '').toString();
      }

      patient.corrections?.forEach((rule, index) => {
        strings[`correction_max_${index}`] = rule.max === Infinity ? '' : (rule.max ?? '').toString();
        strings[`correction_addU_${index}`] = (rule.addU ?? '').toString();
      });
      
      setFormStrings(strings);
      setContacts(patient.contacts || []);
      setNotesPai(patient.notes_pai || '');
    }
  }, [patient]);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      event.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormStrings(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (index: number, field: keyof EmergencyContact, value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = {...newContacts[index], [field]: value};
    setContacts(newContacts);
  };

  const addContact = () => {
    setContacts([...contacts, { id: uuidv4(), lien: '', nom: '', tel: '' }]);
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };
  
  const handleShare = async () => {
    if (!currentUser?.password) {
        toast.error("Impossible de récupérer le mot de passe.");
        return;
    }

    const shareData = {
        title: "Identifiants Diab'Assistant",
        text: `Voici les identifiants pour accéder au profil Diab'Assistant de ${patient?.prenom}:\n\nPseudo: ${currentUser.username}\nMot de passe: ${currentUser.password}`,
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            if (!(err instanceof DOMException && err.name === 'AbortError')) {
                console.error("Share API error:", err);
                toast.error("Le partage a échoué.");
            }
        }
    } else {
        try {
            await navigator.clipboard.writeText(shareData.text);
            toast.success("Identifiants copiés dans le presse-papiers !");
        } catch (err) {
            console.error("Clipboard API error:", err);
            toast.error("La copie a échoué.");
        }
    }
  };

  const handleExport = async () => {
    try {
        toast.loading("Exportation en cours...", { id: "export-toast" });
        const exportData = {
            users: await db.users.toArray(),
            patients: await db.patients.toArray(),
            mesures: await db.mesures.toArray(),
            repas: await db.repas.toArray(),
            injections: await db.injections.toArray(),
            foodLibrary: await db.foodLibrary.toArray(),
            favoriteMeals: await db.favoriteMeals.toArray(),
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().slice(0, 10);
        a.download = `diab-assistant-backup-${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Données exportées avec succès !", { id: "export-toast" });
    } catch (error) {
        console.error("Export failed:", error);
        toast.error("L'exportation a échoué.", { id: "export-toast" });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
    event.target.value = ''; // Reset file input so the same file can be selected again
  };

  const handleCancelImport = () => {
    setImportFile(null);
  };

  const handleConfirmImport = async () => {
    if (!importFile) return;

    const fileToImport = importFile;
    setImportFile(null); // Close modal and start processing
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        const importToastId = toast.loading("Importation en cours...");
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') throw new Error("Le contenu du fichier n'est pas lisible.");
            
            const data = JSON.parse(text);
            
            const requiredTables = ['users', 'patients', 'mesures', 'repas', 'injections', 'foodLibrary', 'favoriteMeals'];
            if (!requiredTables.every(table => Array.isArray(data[table]))) {
                 // Check for older backup format
                if (Array.isArray(data.foodLibrary) && data.favoriteMeals === undefined) {
                    data.favoriteMeals = []; // Add missing table for older backups
                } else {
                    throw new Error("Fichier de sauvegarde invalide ou corrompu.");
                }
            }
            
            logout();

            await db.transaction('rw', ...requiredTables.map(t => db.table(t)), async () => {
                await Promise.all(requiredTables.map(tableName => db.table(tableName).clear()));
                await Promise.all(requiredTables.map(tableName => db.table(tableName).bulkAdd(data[tableName])));
            });
            
            const firstUser = data.users?.[0];
            if (firstUser?.username && firstUser?.password) {
                await login(firstUser.username, firstUser.password);
                // The login function now handles its own toasts
            } else {
                 toast.success("Données importées. Veuillez vous reconnecter.", { id: importToastId, duration: 2000 });
            }
            
            // Reload to apply the new state cleanly
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error: any) {
            console.error("Import failed:", error);
            toast.error(`L'importation a échoué: ${error.message}`, { id: importToastId });
        }
    };
    reader.readAsText(fileToImport);
  };


  const handleSave = async () => {
    if (!patient) return;
    
    const updatedPatient: Patient = JSON.parse(JSON.stringify(patient));

    updatedPatient.prenom = formStrings.prenom || '';
    updatedPatient.naissance = formStrings.naissance || '';
    updatedPatient.cibles.gly_min = parseFloat(formStrings.gly_min) || 0;
    updatedPatient.cibles.gly_max = parseFloat(formStrings.gly_max) || 0;
    updatedPatient.maxBolus = parseInt(formStrings.maxBolus, 10) || 0;
    updatedPatient.correctionDelayHours = parseInt(formStrings.correctionDelayHours, 10) || 0;

    for (const moment in updatedPatient.ratios) {
        updatedPatient.ratios[moment as MealTime] = parseFloat(formStrings[`ratio_${moment}`]) || 0;
    }

    updatedPatient.corrections = patient.corrections.map((_rule, index) => {
        const maxStr = formStrings[`correction_max_${index}`];
        const addUStr = formStrings[`correction_addU_${index}`];
        return {
            max: maxStr === '' ? Infinity : parseFloat(maxStr) || 0,
            addU: parseInt(addUStr, 10) || 0,
        };
    });
    
    const sortedCorrections = [...updatedPatient.corrections].sort((a, b) => a.max - b.max);
    if (JSON.stringify(sortedCorrections) !== JSON.stringify(updatedPatient.corrections)) {
      toast.error('Les règles de corrections ont été automatiquement ordonnées.');
      updatedPatient.corrections = sortedCorrections;
    }
    
    updatedPatient.contacts = contacts.filter(c => c.lien && c.tel);
    updatedPatient.notes_pai = notesPai;

    await updatePatient(updatedPatient);
    toast.success('Paramètres sauvegardés !');
  };

  if (Object.keys(formStrings).length === 0) {
    return <div className="p-4">Chargement des paramètres...</div>;
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
       {importFile && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
                <AlertTriangle className="w-16 h-16 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Confirmer l'importation</h3>
            <p className="my-4 text-gray-600 dark:text-gray-300">
                Attention ! L'importation de "{importFile.name}" écrasera <strong>toutes les données actuelles</strong> de l'application. Cette action est irréversible.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={handleCancelImport} className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700">Annuler</button>
              <button onClick={handleConfirmImport} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700">Confirmer et Écraser</button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Réglages</h1>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Compte</h2>
            <div className="space-y-2">
                <p>Connecté en tant que: <strong>{currentUser?.username}</strong></p>
                <div>
                  <p className="text-sm">Partage des accès :</p>
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm">
                    <p><strong>Pseudo:</strong> {currentUser?.username}</p>
                    <p><strong>Mot de passe:</strong> {showPassword ? currentUser?.password : '••••••••'}</p>
                  </div>
                   <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-teal-500 mt-1">
                      {showPassword ? 'Cacher' : 'Montrer'} le mot de passe
                   </button>
                   <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                     <strong>Attention:</strong> Partagez ces identifiants uniquement avec des personnes de confiance.
                   </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={handleShare} 
                      className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <ShareIcon className="w-4 h-4" />
                        Partager
                    </button>
                    <button type="button" onClick={logout} className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                        Se déconnecter
                    </button>
                </div>
            </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Personnalisation</h2>
            <div className="space-y-3">
                <button 
                  type="button" 
                  onClick={() => setCurrentPage('food')}
                  className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                    <BookOpen className="w-5 h-5" />
                    Gérer la bibliothèque d'aliments
                </button>
                <button 
                  type="button" 
                  onClick={() => setCurrentPage('pai')}
                  className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                    <FileText className="w-5 h-5" />
                    Voir le PAI Simplifié
                </button>
            </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Personnalisation du PAI</h2>
            <div className="space-y-4">
                <div>
                    <h3 className="font-semibold mb-2">Contacts d'urgence</h3>
                    {contacts.map((contact, index) => (
                        <div key={contact.id} className="grid grid-cols-3 gap-2 mb-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                            <input type="text" value={contact.lien} onChange={(e) => handleContactChange(index, 'lien', e.target.value)} placeholder="Lien (Maman)" className="col-span-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"/>
                            <input type="text" value={contact.nom} onChange={(e) => handleContactChange(index, 'nom', e.target.value)} placeholder="Nom" className="col-span-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"/>
                            <button type="button" onClick={() => removeContact(contact.id)} className="bg-red-100 text-red-700 rounded-md flex items-center justify-center"><Trash2/></button>
                            <input type="tel" value={contact.tel} onChange={(e) => handleContactChange(index, 'tel', e.target.value)} placeholder="Téléphone" className="col-span-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"/>
                        </div>
                    ))}
                    <button type="button" onClick={addContact} className="w-full text-sm text-teal-600 dark:text-teal-400 font-semibold p-2 rounded-md hover:bg-teal-50 dark:hover:bg-teal-900/50">
                        + Ajouter un contact
                    </button>
                </div>
                 <div>
                    <label htmlFor="notes-pai" className="block font-semibold mb-2">Notes additionnelles pour le PAI</label>
                    <textarea 
                        id="notes-pai"
                        rows={4}
                        value={notesPai}
                        onChange={(e) => setNotesPai(e.target.value)}
                        onFocus={handleFocus}
                        placeholder="Instructions spécifiques : allergies, emplacement du matériel, préférences de l'enfant..."
                        className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"
                    ></textarea>
                 </div>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Gestion des données</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Sauvegardez vos données ou restaurez-les à partir d'un fichier. Utile pour changer d'appareil.
            </p>
            <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  onClick={handleExport}
                  className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                    <ExportIcon className="w-4 h-4" />
                    Exporter
                </button>
                <label className="w-full bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <ImportIcon className="w-4 h-4" />
                    Importer
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".json" 
                      onChange={handleFileSelect} 
                    />
                </label>
            </div>
             <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                <strong>Attention:</strong> L'importation remplacera toutes les données existantes.
            </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Profil</h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium">Prénom</label>
              <input type="text" name="prenom" value={formStrings.prenom || ''} onChange={handleInputChange} onFocus={handleFocus} className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium">Date de naissance</label>
              <input type="date" name="naissance" value={formStrings.naissance || ''} onChange={handleInputChange} onFocus={handleFocus} className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Objectifs Glycémiques (g/L)</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">Min</label>
              <input type="number" step="0.01" name="gly_min" value={formStrings.gly_min || ''} onChange={handleInputChange} onFocus={handleFocus} className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium">Max</label>
              <input type="number" step="0.01" name="gly_max" value={formStrings.gly_max || ''} onChange={handleInputChange} onFocus={handleFocus} className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Ratios Insuline/Glucides (1U pour Xg)</h2>
          <div className="space-y-2">
            {Object.keys(MEAL_TIMES).map((moment) => (
              <div key={moment} className="flex justify-between items-center">
                <label className="font-medium">{MEAL_TIMES[moment as MealTime]}</label>
                <input 
                  type="number"
                  name={`ratio_${moment}`}
                  value={formStrings[`ratio_${moment}`] || ''} 
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  className="w-24 p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 text-right" 
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Schéma de Correction</h2>
            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-x-4 font-bold">
                    <span>Si Glycémie &lt;= X g/L</span>
                    <span>Ajouter Y Unités</span>
                </div>
                {patient?.corrections.map((_rule, index) => (
                <div key={index} className="grid grid-cols-2 gap-x-4 items-center">
                    <input
                        type="number"
                        step="0.01"
                        name={`correction_max_${index}`}
                        value={formStrings[`correction_max_${index}`] || ''}
                        placeholder="∞"
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 text-right disabled:bg-gray-200"
                    />
                    <input
                        type="number"
                        step="0.5"
                        name={`correction_addU_${index}`}
                        value={formStrings[`correction_addU_${index}`] || ''}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 text-right"
                    />
                </div>
                ))}
            </div>
        </div>
        
         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Sécurité</h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium">Bolus Maximum (U)</label>
              <input type="number" name="maxBolus" value={formStrings.maxBolus || ''} onChange={handleInputChange} onFocus={handleFocus} className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium">Délai entre corrections (heures)</label>
              <input type="number" name="correctionDelayHours" value={formStrings.correctionDelayHours || ''} onChange={handleInputChange} onFocus={handleFocus} className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors">
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
};

export default Settings;