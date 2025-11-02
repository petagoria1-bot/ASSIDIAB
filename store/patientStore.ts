import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db';
import { Patient, Mesure, Repas, Injection, Food, InjectionType } from '../types';
import { DEFAULT_PATIENT } from '../constants';
import { initialFoodData } from '../data/foodLibrary';

interface PatientState {
  patient: Patient | null;
  mesures: Mesure[];
  repas: Repas[];
  injections: Injection[];
  foodLibrary: Food[];
  loadInitialData: () => Promise<void>;
  createPatient: (prenom: string, naissance: string) => Promise<void>;
  updatePatient: (patientData: Partial<Patient>) => Promise<void>;
  addMesure: (mesure: Omit<Mesure, 'id' | 'patient_id' | 'ts'>) => Promise<void>;
  addRepas: (repas: Omit<Repas, 'id' | 'patient_id' | 'ts'>) => Promise<Repas>;
  addInjection: (injection: Omit<Injection, 'id' | 'patient_id' | 'ts'>) => Promise<void>;
  addFullBolus: (data: {mesure: Mesure, repas: Repas, injection: Injection}) => Promise<void>;
  getLastCorrection: () => Promise<Injection | undefined>;
  addOrUpdateFood: (food: Food) => Promise<void>;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patient: null,
  mesures: [],
  repas: [],
  injections: [],
  foodLibrary: [],
  
  loadInitialData: async () => {
    let patient = await db.patients.get('default-patient');
    if (patient) {
      const [mesures, repas, injections, foodLibrary] = await Promise.all([
        db.mesures.where('patient_id').equals(patient.id).sortBy('ts'),
        db.repas.where('patient_id').equals(patient.id).sortBy('ts'),
        db.injections.where('patient_id').equals(patient.id).sortBy('ts'),
        db.foodLibrary.toArray(),
      ]);

      let finalFoodLibrary = foodLibrary;
      if(foodLibrary.length === 0) {
        // Simple migration check: if old food items don't have 'source', reload.
        const needsMigration = foodLibrary.length > 0 && !foodLibrary[0].source;
        if (needsMigration) {
            await db.foodLibrary.clear();
            await db.foodLibrary.bulkAdd(initialFoodData);
            finalFoodLibrary = await db.foodLibrary.toArray();
        } else if (foodLibrary.length === 0) {
            await db.foodLibrary.bulkAdd(initialFoodData);
            finalFoodLibrary = await db.foodLibrary.toArray();
        }
      }

      set({ patient, mesures: mesures.reverse(), repas, injections, foodLibrary: finalFoodLibrary });
    } else {
        await db.foodLibrary.bulkAdd(initialFoodData);
        const finalFoodLibrary = await db.foodLibrary.toArray();
        set({foodLibrary: finalFoodLibrary});
    }
  },

  createPatient: async (prenom, naissance) => {
    const newPatient: Patient = { ...DEFAULT_PATIENT, prenom, naissance };
    await db.patients.add(newPatient);
    set({ patient: newPatient });
  },

  updatePatient: async (patientData) => {
    const currentPatient = get().patient;
    if (currentPatient) {
      const updatedPatient = { ...currentPatient, ...patientData };
      await db.patients.put(updatedPatient);
      set({ patient: updatedPatient });
    }
  },

  addMesure: async (mesureData) => {
    const patient = get().patient;
    if (!patient) return;
    const newMesure: Mesure = {
      ...mesureData,
      id: uuidv4(),
      patient_id: patient.id,
      ts: new Date().toISOString(),
    };
    await db.mesures.add(newMesure);
    set(state => ({ mesures: [newMesure, ...state.mesures] }));
  },

  addRepas: async (repasData) => {
    const patient = get().patient;
    if (!patient) throw new Error("Patient not found");
    const newRepas: Repas = {
      ...repasData,
      id: uuidv4(),
      patient_id: patient.id,
      ts: new Date().toISOString(),
    };
    await db.repas.add(newRepas);
    set(state => ({ repas: [...state.repas, newRepas] }));
    return newRepas;
  },

  addInjection: async (injectionData) => {
    const patient = get().patient;
    if (!patient) return;
    const newInjection: Injection = {
      ...injectionData,
      id: uuidv4(),
      patient_id: patient.id,
      ts: new Date().toISOString(),
    };
    await db.injections.add(newInjection);
    set(state => ({ injections: [newInjection, ...state.injections] }));
  },

  addFullBolus: async ({ mesure, repas, injection }) => {
    const patient = get().patient;
    if (!patient) return;
    
    const ts = new Date().toISOString();
    const patient_id = patient.id;

    const newMesure: Mesure = { ...mesure, id: uuidv4(), patient_id, ts };
    const newRepas: Repas = { ...repas, id: uuidv4(), patient_id, ts };
    const newInjection: Injection = {
      ...injection,
      id: uuidv4(),
      patient_id,
      ts,
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
        repas: [...state.repas, newRepas],
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
}));