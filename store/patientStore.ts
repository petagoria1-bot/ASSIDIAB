import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db';
import { Patient, Mesure, Repas, Injection, Food, InjectionType, FavoriteMeal, MealItem, FoodItem, Event, EventStatus } from '../types';
import { DEFAULT_PATIENT_SETTINGS } from '../constants';
import { initialFoodData } from '../data/foodLibrary';

const sortEvents = (events: Event[]) => {
    return events.sort((a, b) => {
        if (a.status === b.status) {
            return new Date(a.ts).getTime() - new Date(b.ts).getTime();
        }
        return a.status === 'pending' ? -1 : 1;
    });
};

interface PatientState {
  patient: Patient | null;
  mesures: Mesure[];
  repas: Repas[];
  injections: Injection[];
  foodLibrary: Food[];
  favoriteMeals: FavoriteMeal[];
  events: Event[];
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
  addFavoriteMeal: (name: string, items: MealItem[]) => Promise<void>;
  deleteFavoriteMeal: (id: string) => Promise<void>;
  addEvent: (eventData: Omit<Event, 'id' | 'patient_id' | 'status'>) => Promise<void>;
  updateEventStatus: (eventId: string, status: EventStatus) => Promise<void>;
  clearPatientData: () => void;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patient: null,
  mesures: [],
  repas: [],
  injections: [],
  foodLibrary: [],
  favoriteMeals: [],
  events: [],
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
      const [mesures, repas, injections, favoriteMeals, events] = await Promise.all([
        db.mesures.where('patient_id').equals(patient.id).sortBy('ts'),
        db.repas.where('patient_id').equals(patient.id).sortBy('ts'),
        db.injections.where('patient_id').equals(patient.id).sortBy('ts'),
        db.favoriteMeals.where('patient_id').equals(patient.id).toArray(),
        db.events.where('patient_id').equals(patient.id).toArray(),
      ]);
      const sortedEvents = sortEvents(events);
      set({ patient, mesures: mesures.reverse(), repas: repas.reverse(), injections: injections.reverse(), foodLibrary, favoriteMeals, events: sortedEvents, isLoading: false });
    } else {
        set({ patient: null, mesures: [], repas: [], injections: [], foodLibrary, favoriteMeals: [], events: [], isLoading: false });
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

  addFavoriteMeal: async (name, items) => {
    const patient = get().patient;
    if (!patient) return;

    const foodItems: FoodItem[] = items.map(item => ({
        nom: item.food.name,
        carbs_g: item.carbs_g,
        poids_g: item.poids_g,
    }));
    
    const total_carbs_g = items.reduce((sum, item) => sum + item.carbs_g, 0);

    const newFavorite: FavoriteMeal = {
        id: uuidv4(),
        patient_id: patient.id,
        name,
        items: foodItems,
        total_carbs_g
    };

    await db.favoriteMeals.add(newFavorite);
    set(state => ({ favoriteMeals: [...state.favoriteMeals, newFavorite]}));
  },

  deleteFavoriteMeal: async (id: string) => {
    await db.favoriteMeals.delete(id);
    set(state => ({ favoriteMeals: state.favoriteMeals.filter(fm => fm.id !== id) }));
  },

  addEvent: async (eventData) => {
    const patient = get().patient;
    if (!patient) return;
    const newEvent: Event = {
      ...eventData,
      id: uuidv4(),
      patient_id: patient.id,
      status: 'pending',
    };
    await db.events.add(newEvent);
    set(state => ({ events: sortEvents([...state.events, newEvent]) }));
  },

  updateEventStatus: async (eventId, status) => {
    await db.events.update(eventId, { status });
    const updatedEvents = get().events.map(event => 
        event.id === eventId ? { ...event, status } : event
    );
    set({ events: sortEvents(updatedEvents) });
  },

  clearPatientData: () => {
    set({ patient: null, mesures: [], repas: [], injections: [], favoriteMeals: [], events: [], isLoading: false });
  }
}));