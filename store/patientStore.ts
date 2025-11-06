import { create } from 'zustand';
import { db } from '../services/db';
import {
    Patient, Mesure, Repas, Injection, Food, FavoriteMeal, User, Event, EventStatus, DailyProgress
} from '../types';
import { initialFoodData } from '../data/foodLibrary';
// Fix: Import DEFAULT_PATIENT_SETTINGS to resolve 'Cannot find name' error.
import { DEFAULT_PATIENT_SETTINGS } from '../constants';
import { liveQuery } from 'dexie';
import { firestore } from '../services/firebase';
import { 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    writeBatch, 
    Timestamp,
    orderBy,
    limit,
    getDocs,
    updateDoc,
    where
} from 'firebase/firestore';
import toast from 'react-hot-toast';

interface PatientState {
  patient: Patient | null;
  mesures: Mesure[];
  repas: Repas[];
  injections: Injection[];
  foodLibrary: Food[];
  favoriteMeals: FavoriteMeal[];
  events: Event[];
  todayProgress: DailyProgress | null;
  isLoading: boolean;

  loadInitialData: (userUid: string) => void;
  clearPatientData: () => void;
  createPatient: (prenom: string, naissance: string, user: User) => Promise<void>;
  updatePatient: (patientData: Patient) => Promise<void>;
  
  addMesure: (mesureData: Omit<Mesure, 'id' | 'patient_id' | 'ts'>, ts: string) => Promise<void>;
  addRepas: (repasData: Omit<Repas, 'id' | 'patient_id' | 'ts'>, ts: string) => Promise<void>;
  addInjection: (injectionData: Omit<Injection, 'id' | 'patient_id' | 'ts'>, ts: string) => Promise<void>;
  addFullBolus: (data: { 
    mesure: Omit<Mesure, 'id' | 'patient_id' | 'ts'>;
    repas: Omit<Repas, 'id' | 'patient_id' | 'ts'>;
    injection: Omit<Injection, 'id' | 'patient_id' | 'ts'>;
  }, ts: string) => Promise<void>;

  addOrUpdateFood: (food: Food) => Promise<void>;
  
  addEvent: (eventData: Omit<Event, 'id' | 'patient_id' | 'status'>) => Promise<void>;
  updateEventStatus: (eventId: string, status: EventStatus) => Promise<void>;

  getLastCorrection: () => Promise<Injection | undefined>;

  logWater: (amount_ml: number) => Promise<void>;
  logActivity: (minutes: number) => Promise<void>;
  logQuizCompleted: () => Promise<void>;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

// Global unsubscribe functions
let unsubPatient: (() => void) | null = null;
let unsubMesures: (() => void) | null = null;
let unsubRepas: (() => void) | null = null;
let unsubInjections: (() => void) | null = null;
let unsubEvents: (() => void) | null = null;
let unsubDailyProgress: (() => void) | null = null;

const unsubscribeAll = () => {
    unsubPatient?.();
    unsubMesures?.();
    unsubRepas?.();
    unsubInjections?.();
    unsubEvents?.();
    unsubDailyProgress?.();
    unsubPatient = unsubMesures = unsubRepas = unsubInjections = unsubEvents = unsubDailyProgress = null;
};

// Function to convert Firestore Timestamps to ISO strings in nested objects
const convertTimestampsToISO = (data: any) => {
    if (!data) return data;
    const newData = { ...data };
    for (const key in newData) {
        if (newData[key] instanceof Timestamp) {
            newData[key] = newData[key].toDate().toISOString();
        } else if (typeof newData[key] === 'object' && newData[key] !== null && !Array.isArray(newData[key])) {
            newData[key] = convertTimestampsToISO(newData[key]);
        } else if (Array.isArray(newData[key])) {
            newData[key] = newData[key].map(item => convertTimestampsToISO(item));
        }
    }
    return newData;
};

export const usePatientStore = create<PatientState>((set, get) => ({
  patient: null,
  mesures: [],
  repas: [],
  injections: [],
  foodLibrary: [],
  favoriteMeals: [],
  events: [],
  todayProgress: null,
  isLoading: true,

  loadInitialData: async (userUid) => {
    set({ isLoading: true });
    unsubscribeAll(); 
    try {
      const patientRef = doc(firestore, 'patients', userUid);
      
      unsubPatient = onSnapshot(patientRef, async (docSnap) => {
          if (docSnap.exists()) {
              const patientData = convertTimestampsToISO({ ...docSnap.data(), id: docSnap.id }) as Patient;
              await db.patients.put(patientData);
              set({ patient: patientData, isLoading: false }); // Set patient immediately

              // Only setup sub-collection listeners after confirming patient exists
              if (!unsubMesures) { // Check if listeners are already setup
                  const setupCollectionListener = <T extends { id: string }>(collectionName: string, tableName: keyof typeof db) => {
                      const collRef = collection(firestore, 'patients', userUid, collectionName);
                      return onSnapshot(query(collRef), (snapshot) => {
                          if (snapshot.empty) {
                              // @ts-ignore
                              db[tableName].clear();
                              return;
                          };
                          const items = snapshot.docs.map(d => convertTimestampsToISO({ ...d.data(), id: d.id })) as T[];
                          // @ts-ignore
                          db[tableName].bulkPut(items);
                      });
                  };
                  unsubMesures = setupCollectionListener<Mesure>('mesures', 'mesures');
                  unsubRepas = setupCollectionListener<Repas>('repas', 'repas');
                  unsubInjections = setupCollectionListener<Injection>('injections', 'injections');
                  unsubEvents = setupCollectionListener<Event>('events', 'events');
                  // Fix: Replace generic listener with a specific one for DailyProgress
                  // because its type does not have an 'id' property, which the generic listener requires.
                  // The primary key for DailyProgress is 'date'.
                  const dailyProgressCollRef = collection(firestore, 'patients', userUid, 'dailyProgress');
                  unsubDailyProgress = onSnapshot(query(dailyProgressCollRef), (snapshot) => {
                    if (snapshot.empty) {
                        db.dailyProgress.clear();
                        return;
                    };
                    const items = snapshot.docs.map(d => convertTimestampsToISO(d.data())) as DailyProgress[];
                    db.dailyProgress.bulkPut(items);
                  });
              }
          } else {
              set({ patient: null, isLoading: false }); // No patient, trigger onboarding
          }
      });
      
      // Setup live queries from Dexie to feed the UI reactively
      liveQuery(() => db.patients.get(userUid)).subscribe(patient => set({ patient }));
      liveQuery(() => db.mesures.where('patient_id').equals(userUid).reverse().sortBy('ts')).subscribe(mesures => set({ mesures }));
      liveQuery(() => db.repas.where('patient_id').equals(userUid).reverse().sortBy('ts')).subscribe(repas => set({ repas }));
      liveQuery(() => db.injections.where('patient_id').equals(userUid).reverse().sortBy('ts')).subscribe(injections => set({ injections }));
      liveQuery(() => db.events.where('patient_id').equals(userUid).sortBy('ts')).subscribe(events => set({ events }));

      const todayStr = getTodayDateString();
      liveQuery(() => db.dailyProgress.where({ date: todayStr, patient_id: userUid }).first()).subscribe(progress => {
        set({ todayProgress: progress || null });
      });

      // Food library remains local
      const foodCount = await db.foodLibrary.count();
      if (foodCount === 0) await db.foodLibrary.bulkAdd(initialFoodData);
      liveQuery(() => db.foodLibrary.toArray()).subscribe(foodLibrary => set({ foodLibrary }));

    } catch (error) {
      console.error("Failed to load initial data from Firestore", error);
      set({ isLoading: false });
    }
  },

  clearPatientData: () => {
    unsubscribeAll();
    set({
      patient: null,
      mesures: [],
      repas: [],
      injections: [],
      favoriteMeals: [],
      events: [],
      todayProgress: null,
      isLoading: false,
    });
  },

  createPatient: async (prenom, naissance, user) => {
    set({ isLoading: true });
    try {
        const newPatient: Patient = {
            id: user.uid,
            userUid: user.uid,
            prenom,
            naissance,
            ...DEFAULT_PATIENT_SETTINGS,
            caregivers: [{ userUid: user.uid, email: user.email || '', role: 'owner', status: 'active' }]
        };
        const patientRef = doc(firestore, 'patients', user.uid);
        await setDoc(patientRef, newPatient);
        
        // Explicitly update the local state to navigate away from Onboarding.
        // The existing onSnapshot listener will simply receive this same update, which is fine.
        set({ patient: newPatient, isLoading: false });

    } catch (error) {
        console.error("Error creating patient profile:", error);
        toast.error("Une erreur est survenue lors de la création du profil.");
        // Ensure we don't stay in a loading state on error
        set({ isLoading: false });
    }
  },
  
  updatePatient: async (patientData) => {
    const patientRef = doc(firestore, 'patients', patientData.id);
    // Remove id before writing to firestore to avoid redundancy
    const { id, ...dataToUpdate } = patientData;
    await updateDoc(patientRef, dataToUpdate);
  },

  addDocToSubcollection: async (collectionName: string, data: any) => {
    const patientId = get().patient?.id;
    if (!patientId) return;
    const collRef = collection(firestore, 'patients', patientId, collectionName);
    await addDoc(collRef, data);
  },

  addMesure: async (mesureData, ts) => {
    const patientId = get().patient?.id;
    if (!patientId) return;
    const newMesure = { ...mesureData, patient_id: patientId, ts: Timestamp.fromDate(new Date(ts)) };
    await get().addDocToSubcollection('mesures', newMesure);
  },

  addRepas: async (repasData, ts) => {
    const patientId = get().patient?.id;
    if (!patientId) return;
    const newRepas = { ...repasData, patient_id: patientId, ts: Timestamp.fromDate(new Date(ts)) };
    await get().addDocToSubcollection('repas', newRepas);
  },

  addInjection: async (injectionData, ts) => {
    const patientId = get().patient?.id;
    if (!patientId) return;
    const newInjection = { ...injectionData, patient_id: patientId, ts: Timestamp.fromDate(new Date(ts)) };
    await get().addDocToSubcollection('injections', newInjection);
  },
  
  addFullBolus: async (data, ts) => {
    const patientId = get().patient?.id;
    if (!patientId) return;
    
    const timestamp = Timestamp.fromDate(new Date(ts));
    const batch = writeBatch(firestore);

    const mesureRef = doc(collection(firestore, 'patients', patientId, 'mesures'));
    const repasRef = doc(collection(firestore, 'patients', patientId, 'repas'));
    const injectionRef = doc(collection(firestore, 'patients', patientId, 'injections'));
    
    batch.set(mesureRef, { ...data.mesure, patient_id: patientId, ts: timestamp });
    batch.set(repasRef, { ...data.repas, patient_id: patientId, ts: timestamp });
    batch.set(injectionRef, { 
      ...data.injection, 
      patient_id: patientId, 
      ts: timestamp,
      lien_mesure_id: mesureRef.id,
      lien_repas_id: repasRef.id,
    });
    
    await batch.commit();
  },

  addOrUpdateFood: async (food) => {
    await db.foodLibrary.put(food);
  },

  addEvent: async (eventData) => {
    const patientId = get().patient?.id;
    if (!patientId) return;
    const newEvent = { 
      ...eventData, 
      patient_id: patientId, 
      status: 'pending' as EventStatus,
      ts: Timestamp.fromDate(new Date(eventData.ts))
    };
    await get().addDocToSubcollection('events', newEvent);
  },

  updateEventStatus: async (eventId, status) => {
    const patientId = get().patient?.id;
    if (!patientId) return;
    const eventRef = doc(firestore, 'patients', patientId, 'events', eventId);
    await updateDoc(eventRef, { status });
  },

  getLastCorrection: async () => {
    const patientId = get().patient?.id;
    if (!patientId) return undefined;
    const q = query(
        collection(firestore, 'patients', patientId, 'injections'), 
        where('type', '==', 'correction'),
        orderBy('ts', 'desc'),
        limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return convertTimestampsToISO({ ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id }) as Injection;
    }
    return undefined;
  },

  updateDailyProgress: async (update: Partial<DailyProgress>) => {
      const { patient } = get();
      const todayStr = getTodayDateString();
      if (!patient) return;
      const progressRef = doc(firestore, 'patients', patient.id, 'dailyProgress', todayStr);
      
      try {
        const currentProgressSnap = await getDoc(progressRef);
        if (currentProgressSnap.exists()) {
            await updateDoc(progressRef, update);
        } else {
            const newProgress: DailyProgress = { date: todayStr, patient_id: patient.id, water_ml: 0, activity_min: 0, quiz_completed: false, ...update };
            await setDoc(progressRef, newProgress);
        }
      } catch (e) {
        console.error("Error updating daily progress", e)
      }
  },

  logWater: async (amount_ml) => {
      const { todayProgress } = get();
      const currentAmount = todayProgress?.water_ml || 0;
      await get().updateDailyProgress({ water_ml: currentAmount + amount_ml });
  },
  
  logActivity: async (minutes) => {
      const { todayProgress } = get();
      const currentMinutes = todayProgress?.activity_min || 0;
      await get().updateDailyProgress({ activity_min: currentMinutes + minutes });
  },

  logQuizCompleted: async () => {
      const { todayProgress } = get();
      if (todayProgress?.quiz_completed) return;
      await get().updateDailyProgress({ quiz_completed: true });
  },

}));