import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db';
import { Patient, Mesure, Repas, Injection, Food, InjectionType } from '../types';
import { DEFAULT_PATIENT_SETTINGS } from '../constants';
import { initialFoodData } from '../data/foodLibrary';

interface PatientState {
  patient: Patient | null;
  mesures: Mesure[];
  repas: Repas[];
  injections: Injection[];
  foodLibrary: Food[];
  isLoading: boolean;
  loadInitialData: (userId: number) => Promise<void>;
  createPatient: (prenom: string, naissance: string, userId: number) => Promise<void>;
  updatePatient: (patientData: Partial<Patient>) => Promise<void>;
  addMesure: (mesure: Omit<Mesure, 'id' | 'patient_id' | 'ts'>, ts?: string) => Promise<void>;
  addRepas: (repas: Omit<Repas, 'id' | 'patient_id' | 'ts'>, ts?: string) => Promise<Repas>;
  addInjection: (injection: Omit<Injection, 'id' | 'patient_id' | 'ts'>, ts?: string) => Promise<void>;
  addFullBolus: (data: {mesure: Mesure, repas: Repas, injection: Injection}, ts?: string) => Promise<void>;
  getLastCorrection: () => Promise<Injection | undefined>;
  addOrUpdateFood: (food: Food) => Promise<void>;
  clearPatientData: () => void;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patient: null,
  mesures: [],
  repas: [],
  injections: [],
  foodLibrary: [],
  isLoading: true,
  
  loadInitialData: async (userId) => {
    set({ isLoading: true });
    let patient = await db.patients.where({ userId }).first();
    
    // Always load food library
    let foodLibrary = await db.foodLibrary.toArray();
    if (foodLibrary.length === 0) {
        await db.foodLibrary.bulkAdd(initialFoodData);
        foodLibrary = await db.foodLibrary.toArray();
    }
    
    if (patient) {
      const [mesures, repas, injections] = await Promise.all([
        db.mesures.where('patient_id').equals(patient.id).sortBy('ts'),
        db.repas.where('patient_id').equals(patient.id).sortBy('ts'),
        db.injections.where('patient_id').equals(patient.id).sortBy('ts'),
      ]);
      set({ patient, mesures: mesures.reverse(), repas: repas.reverse(), injections: injections.reverse(), foodLibrary, isLoading: false });
    } else {
        set({ patient: null, mesures: [], repas: [], injections: [], foodLibrary, isLoading: false });
    }
  },

  createPatient: async (prenom, naissance, userId) => {
    const newPatient: Patient = {
      ...DEFAULT_PATIENT_SETTINGS,
      id: uuidv4(),
      userId,
      prenom,
      naissance
    };
    await db.patients.add(newPatient);
    set({ patient: newPatient, isLoading: false });
  },

  updatePatient: async (patientData) => {
    const currentPatient = get().patient;
    if (currentPatient) {
      const updatedPatient = { ...currentPatient, ...patientData };
      await db.patients.put(updatedPatient);
      set({ patient: updatedPatient });
    }
  },

  addMesure: async (mesureData, ts) => {
    const patient = get().patient;
    if (!patient) return;
    const newMesure: Mesure = {
      ...mesureData,
      id: uuidv4(),
      patient_id: patient.id,
      ts: ts || new Date().toISOString(),
    };
    await db.mesures.add(newMesure);
    set(state => ({ mesures: [newMesure, ...state.mesures] }));
  },

  addRepas: async (repasData, ts) => {
    const patient = get().patient;
    if (!patient) throw new Error("Patient not found");
    const newRepas: Repas = {
      ...repasData,
      id: uuidv4(),
      patient_id: patient.id,
      ts: ts || new Date().toISOString(),
    };
    await db.repas.add(newRepas);
    set(state => ({ repas: [newRepas, ...state.repas] }));
    return newRepas;
  },

  addInjection: async (injectionData, ts) => {
    const patient = get().patient;
    if (!patient) return;
    const newInjection: Injection = {
      ...injectionData,
      id: uuidv4(),
      patient_id: patient.id,
      ts: ts || new Date().toISOString(),
    };
    await db.injections.add(newInjection);
    set(state => ({ injections: [newInjection, ...state.injections] }));
  },

  addFullBolus: async ({ mesure, repas, injection }, ts) => {
    const patient = get().patient;
    if (!patient) return;
    
    const timestamp = ts || new Date().toISOString();
    const patient_id = patient.id;

    const newMesure: Mesure = { ...mesure, id: uuidv4(), patient_id, ts: timestamp };
    const newRepas: Repas = { ...repas, id: uuidv4(), patient_id, ts: timestamp };
    const newInjection: Injection = {
      ...injection,
      id: uuidv4(),
      patient_id,
      ts: timestamp,
      lien_mesure_id: newMesure.id,
      lien_repas_id: newRepas.id,
    };
    
    await db.transaction('rw', db.mesures, db.repas, db.injections, async () => {
        await db.mesures.add(newMesure);
        await db.repas.add(newRepas);
        await db.injections.add(newInjection);
    });
    
    set(state => ({
        mesures: [newMesure, ...state.mesures],
        repas: [newRepas, ...state.repas],
        injections: [newInjection, ...state.injections]
    }));
  },

  getLastCorrection: async () => {
    const patient = get().patient;
    if (!patient) return undefined;

    const lastCorrection = await db.injections
      .where({ patient_id: patient.id })
      .filter(inj => inj.type === 'correction' || (inj.type === 'rapide' && (inj.calc_details?.includes('Correction') ?? false)))
      .last();
      
    return lastCorrection;
  },

  addOrUpdateFood: async (food) => {
    await db.foodLibrary.put(food);
    const updatedLibrary = await db.foodLibrary.toArray();
    set({ foodLibrary: updatedLibrary });
  },

  clearPatientData: () => {
    set({ patient: null, mesures: [], repas: [], injections: [], isLoading: false });
  }
}));
