// types.ts
export type Page = 'dashboard' | 'glucides' | 'journal' | 'rapports' | 'settings' | 'emergency' | 'pai' | 'food' | 'history' | 'inbox' | 'illustrations' | 'doctor_dashboard' | 'doctor_patient_view';

export type MealTime = 'petit_dej' | 'dejeuner' | 'gouter' | 'diner' | 'collation';
export type InjectionType = 'rapide' | 'lente' | 'correction';

// --- NOUVEAU SYSTÈME DE RÔLES UNIFIÉ ---
export type UserRole = 'patient' | 'famille' | 'medecin' | 'infirmier' | 'autre' | 'undetermined';

export interface UserProfile {
    uid: string;
    email: string | null;
    nom: string;
    prenom: string;
    role: UserRole;
}

export type User = UserProfile; // Alias for consistency

export interface PatientProfile {
    id: string; // Same as User UID for simplicity
    userUid: string;
    prenom: string;
    nom: string;
    naissance: string;
    cibles: Cibles;
    ratios: Ratios;
    corrections: CorrectionRule[];
    maxBolus: number;
    correctionDelayHours: number;
    contacts: EmergencyContact[];
    notes_pai: string;
}

export type CircleMemberRole = 'famille' | 'medecin' | 'infirmier' | 'autre' | 'owner';
export type CircleMemberStatus = 'pending' | 'accepted' | 'refused';

export interface CircleMemberRights {
    read: boolean;
    write: boolean;
    alerts: boolean;
}

export interface CircleMember {
    id: string; // Firestore document ID
    patientId: string; // UID of the patient
    patientName: string; // Denormalized for doctor dashboard
    memberUserId: string; // UID of the caregiver/doctor
    memberEmail: string; // Denormalized for easy lookup & invites
    role: CircleMemberRole;
    rights: CircleMemberRights;
    status: CircleMemberStatus;
    invitedAt: any; // Firestore Timestamp
    respondedAt?: any; // Firestore Timestamp
}

export interface AuditLog {
    id?: string;
    userId: string; // Who performed the action
    patientId: string; // On which patient's circle
    action: 'invitation_sent' | 'invitation_accepted' | 'invitation_refused' | 'rights_changed' | 'member_removed';
    details: any;
    ts: any; // Firestore Timestamp
}


// --- STRUCTURES DE DONNÉES PATIENT ---
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
    collation?: number;
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

export type Patient = PatientProfile;

export interface Mesure {
    id: string;
    ts: string;
    patient_id: string;
    gly: number;
    cetone?: number;
    source: 'doigt' | 'capteur';
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
export interface MealItem {
    listId: string;
    food: Food;
    poids_g: number;
    carbs_g: number;
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
