
import { MealTime, Patient } from './types';

export const MEAL_TIMES: Record<MealTime, string> = {
  petit_dej: "Petit-déjeuner",
  dejeuner: "Déjeuner",
  gouter: "Goûter",
  diner: "Dîner",
};

export const DEFAULT_PATIENT: Patient = {
    id: 'default-patient',
    prenom: '',
    naissance: '',
    cibles: { gly_min: 0.80, gly_max: 1.60, unit: "gL" },
    ratios: {
      petit_dej: 7,
      dejeuner: 9,
      gouter: 10,
      diner: 8,
    },
    corrections: [
      { max: 1.60, addU: 0 },
      { max: 2.00, addU: 1 },
      { max: 3.00, addU: 2 },
      { max: Infinity, addU: 3 },
    ],
    maxBolus: 15,
    correctionDelayHours: 3
};
