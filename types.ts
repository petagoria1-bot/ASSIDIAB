
export type Page = 'dashboard' | 'glucides' | 'journal' | 'rapports' | 'settings' | 'emergency' | 'pai' | 'food' | 'history' | 'inbox' | 'illustrations';

export type MealTime = 'petit_dej' | 'dejeuner' | 'gouter' | 'diner' | 'collation';

export type InjectionType = 'rapide' | 'lente' | 'correction';

export interface Cibles {
    gly_min: number;
    gly_max: number;
    unit: "gL" | "mgdL";
}

export interface Ratios {
    [key: string]: number;
    petit_dej: number;
    dejeuner: number;
    gouter: number;
    diner: number;
    collation: number;
}

export interface CorrectionRule {
    max: number;
    addU: number;
}

export interface EmergencyContact {
    id: string;
    lien: string;
    nom: string;
    tel: string;
}

export type CaregiverRole = 'owner' | 'parent' | 'health_professional' | 'family' | 'school';
export type CaregiverStatus = 'awaiting_confirmation' | 'active' | 'declined';

export interface CaregiverPermissions {
    canViewJournal: boolean;
    canEditJournal: boolean;
    canEditPAI: boolean;
    canManageFamily: boolean;
}

export interface Caregiver {
    userUid: string | null; // Null until user confirms
    email: string;
    role: CaregiverRole;
    status: CaregiverStatus;
    permissions: CaregiverPermissions;
}

export interface Patient {
    id: string;
    userUid: string; // The owner's UID
    prenom: string;
    naissance: string;
    cibles: Cibles;
    ratios: Ratios;
    corrections: CorrectionRule[];
    maxBolus: number;
    correctionDelayHours: number;
    contacts: EmergencyContact[];
    notes_pai: string;
    caregivers: Caregiver[];
    activeCaregiverUids?: string[];
    pendingEmails?: string[];
}

export interface Mesure {
    id: string;
    ts: string;
    patient_id: string;
    gly: number;
    cetone?: number;
    source: 'doigt' | 'capteur';
}

export interface MealItem {
    listId: string;
    food: Food;
    poids_g: number;
    carbs_g: number;
}

export interface RepasItem {
    nom: string;
    carbs_g: number;
    poids_g?: number;
}

export interface Repas {
    id: string;
    ts: string;
    patient_id: string;
    moment: MealTime;
    items: RepasItem[];
    total_carbs_g: number;
    note?: string;
}

export interface Injection {
    id: string;
    ts: string;
    patient_id: string;
    type: InjectionType;
    dose_U: number;
    calc_details?: string;
    lien_repas_id?: string;
    lien_mesure_id?: string;
}

export interface Food {
    id: string;
    name: string;
    category: string;
    carbs_per_100g_total?: number;
    fiber_per_100g?: number;
    carbs_per_100g_net: number;
    unit_type: 'g' | 'ml';
    source: string;
    quality?: "certaine" | "estimée";
    common_portion_g?: number;
    common_portion_name?: string;
}

export interface FavoriteMeal {
    id: string;
    patient_id: string;
    name: string;
    items: MealItem[];
    total_carbs_g: number;
}

export type EventType = 'rdv' | 'note' | 'activity' | 'other';

export interface Event {
    id: string;
    ts: string;
    patient_id: string;
    type: EventType;
    title: string;
    description?: string;
    status: 'pending' | 'completed';
}

export interface DoseCalculationInput {
    gly_pre: number;
    moment: MealTime;
    carbs_g: number;
    patient: Patient;
    lastCorrection: Injection | null;
}
  
export interface DoseCalculationOutput {
    doseRepas_U: number;
    addCorr_U: number;
    doseTotale: number;
    warning?: string;
}

export interface User {
    id?: number;
    uid: string;
    email: string | null;
}

export interface DailyProgress {
    date: string; // YYYY-MM-DD
    patient_id: string;
    water_ml: number;
    activity_min: number;
    quiz_completed: boolean;
}

export interface FullBolusPayload {
    mesure: Omit<Mesure, 'id' | 'patient_id' | 'ts'>;
    repas: Omit<Repas, 'id' | 'patient_id' | 'ts'>;
    injection: Omit<Injection, 'id' | 'patient_id' | 'ts'>;
}

export interface Message {
    id: string;
    patientId: string;
    fromUid: 'system' | string;
    fromEmail: 'Système' | string;
    toUid: string;
    text: string;
    ts: string;
    read: boolean;
}