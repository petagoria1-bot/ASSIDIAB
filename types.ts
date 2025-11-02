export type Unit = "gL" | "mmolL";
export type MealTime = "petit_dej" | "dejeuner" | "gouter" | "diner";
export type InjectionType = "rapide" | "basale" | "correction";
export type MeasurementSource = "doigt" | "capteur";
export type AlertType = "hypo" | "hyper" | "cetone" | "tech";
export type Page = 'dashboard' | 'journal' | 'calculator' | 'emergency' | 'settings' | 'food' | 'pai';

export interface User {
  id?: number;
  username: string;
  // NOTE: Storing passwords in plaintext is acceptable only for a local, offline-first PWA
  // where the data does not leave the user's device. This is not secure for web apps.
  password?: string;
}

export interface CorrectionRule {
  max: number; // in g/L
  addU: number;
}

export interface EmergencyContact {
    id: string;
    lien: string; // e.g., 'Maman', 'Papa', 'Diabétologue'
    nom: string;
    tel: string;
}

export interface Patient {
  id: string; // uuid
  userId: number; // foreign key to User
  prenom: string;
  naissance: string; // YYYY-MM-DD
  cibles: { gly_min: number; gly_max: number; unit: Unit }; // in g/L
  ratios: { [key in MealTime]: number }; // g/U
  corrections: CorrectionRule[];
  maxBolus: number;
  correctionDelayHours: number;
  contacts: EmergencyContact[];
  notes_pai: string;
}

export interface Mesure {
  id: string;
  patient_id: string;
  ts: string; // ISO string
  gly: number; // stored in g/L
  cetone?: number; // mmol/L
  source: MeasurementSource;
}

export interface FoodItem {
  nom: string;
  carbs_g: number;
  poids_g?: number;
}

export interface Repas {
  id: string;
  patient_id: string;
  ts: string; // ISO string
  moment: MealTime;
  items: FoodItem[];
  total_carbs_g: number;
  note?: string;
}

export interface Injection {
  id: string;
  patient_id: string;
  ts: string; // ISO string
  type: InjectionType;
  dose_U: number;
  calc_details?: string;
  lien_mesure_id?: string;
  lien_repas_id?: string;
}

export interface Food {
  id: string;
  name: string;
  category: string;
  carbs_per_100g_total?: number;
  fiber_per_100g?: number;
  carbs_per_100g_net: number; // Net carbs = total - fiber. This is the value to use.
  unit_type: 'g' | 'ml';
  source: string; // e.g., 'CIQUAL', 'OpenFoodFacts', 'GluciCheckManuel'
  quality?: 'certaine' | 'incertaine';
  common_portion_g?: number;
  common_portion_name?: string;
}

export interface DoseCalculationInput {
  gly_pre: number; // g/L
  moment: MealTime;
  carbs_g: number;
  patient: Patient;
  lastCorrection?: Injection;
}

export interface DoseCalculationOutput {
  doseRepas_U: number;
  addCorr_U: number;
  doseTotale: number;
  warning?: string;
}

export interface MealItem {
  listId: string;
  food: Food;
  poids_g: number; // Represents grams for solids, and ml for liquids (base unit)
  carbs_g: number;
}

export interface FavoriteMeal {
    id: string;
    patient_id: string;
    name: string;
    items: FoodItem[];
    total_carbs_g: number;
}