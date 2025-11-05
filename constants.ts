import { Patient } from './types';

// This is now a template of settings, not a full patient object.
export const DEFAULT_PATIENT_SETTINGS: Omit<Patient, 'id' | 'userUid' | 'prenom' | 'naissance'> = {
    cibles: { gly_min: 0.80, gly_max: 1.60, unit: "gL" },
    ratios: {
      petit_dej: 7,
      dejeuner: 9,
      gouter: 10,
      diner: 8,
      collation: 10, // Default for snacks
    },
    corrections: [
      { max: 1.60, addU: 0 },
      { max: 2.00, addU: 1 },
      { max: 3.00, addU: 2 },
      { max: Infinity, addU: 3 },
    ],
    maxBolus: 15,
    correctionDelayHours: 3,
    contacts: [],
    notes_pai: "",
    caregivers: [],
};