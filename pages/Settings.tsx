import React, { useState, useEffect } from 'react';
import { usePatientStore } from '../store/patientStore';
import { Patient, CorrectionRule, MealTime } from '../types';
import toast from 'react-hot-toast';
import { MEAL_TIMES } from '../constants';

const Settings: React.FC = () => {
  const { patient, updatePatient } = usePatientStore();
  
  // This state will hold all form values as strings to allow empty inputs during editing
  const [formStrings, setFormStrings] = useState<Record<string, string>>({});

  // Effect to initialize or update the string-based form state when patient data changes
  useEffect(() => {
    if (patient) {
      const strings: Record<string, string> = {
        prenom: patient.prenom,
        naissance: patient.naissance,
        gly_min: patient.cibles.gly_min.toString(),
        gly_max: patient.cibles.gly_max.toString(),
        maxBolus: patient.maxBolus.toString(),
        correctionDelayHours: patient.correctionDelayHours.toString(),
      };

      for (const moment in patient.ratios) {
        strings[`ratio_${moment}`] = patient.ratios[moment as MealTime].toString();
      }

      patient.corrections.forEach((rule, index) => {
        strings[`correction_max_${index}`] = rule.max === Infinity ? '' : rule.max.toString();
        strings[`correction_addU_${index}`] = rule.addU.toString();
      });
      
      setFormStrings(strings);
    }
  }, [patient]);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      event.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormStrings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!patient) return;
    
    // Create a deep copy to modify safely
    const updatedPatient: Patient = JSON.parse(JSON.stringify(patient));

    // Parse and validate string values back into the patient object structure
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
    
    // Sort corrections to ensure they are in the correct order before saving
    const sortedCorrections = [...updatedPatient.corrections].sort((a, b) => a.max - b.max);
    if (JSON.stringify(sortedCorrections) !== JSON.stringify(updatedPatient.corrections)) {
      toast.error('Les règles de corrections ont été automatiquement ordonnées.');
      updatedPatient.corrections = sortedCorrections;
    }

    await updatePatient(updatedPatient);
    toast.success('Paramètres sauvegardés !');
  };

  // Render a loading state until the form strings are initialized
  if (Object.keys(formStrings).length === 0) {
    return <div className="p-4">Chargement des paramètres...</div>;
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Réglages</h1>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Profil</h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium">Prénom</label>
              <input type="text" name="prenom" value={formStrings.prenom} onChange={handleInputChange} onFocus={handleFocus} className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium">Date de naissance</label>
              <input type="date" name="naissance" value={formStrings.naissance} onChange={handleInputChange} onFocus={handleFocus} className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Objectifs Glycémiques (g/L)</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">Min</label>
              <input type="number" step="0.01" name="gly_min" value={formStrings.gly_min} onChange={handleInputChange} onFocus={handleFocus} className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium">Max</label>
              <input type="number" step="0.01" name="gly_max" value={formStrings.gly_max} onChange={handleInputChange} onFocus={handleFocus} className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
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
                        value={formStrings[`correction_max_${index}`]}
                        placeholder="∞"
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 text-right disabled:bg-gray-200"
                    />
                    <input
                        type="number"
                        step="0.5"
                        name={`correction_addU_${index}`}
                        value={formStrings[`correction_addU_${index}`]}
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
              <input type="number" name="maxBolus" value={formStrings.maxBolus} onChange={handleInputChange} onFocus={handleFocus} className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium">Délai entre corrections (heures)</label>
              <input type="number" name="correctionDelayHours" value={formStrings.correctionDelayHours} onChange={handleInputChange} onFocus={handleFocus} className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
};

export default Settings;