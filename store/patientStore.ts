import { create } from 'zustand';
import { db } from '../services/db';
import { Patient, Mesure, Repas, Injection, Food, FullBolusPayload, Event, DailyProgress, User, Caregiver, CaregiverRole, CaregiverPermissions, Message } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { initialFoodData } from '../data/foodLibrary';
import { DEFAULT_PATIENT_SETTINGS } from '../constants';
import { firestore } from '../services/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, query, where, getDocs, onSnapshot, Unsubscribe, addDoc, orderBy, writeBatch } from "firebase/firestore";
import { useAuthStore } from './authStore';
// FIX: Import useSettingsStore and translations to get translation data outside of a React component.
import { useSettingsStore } from './settingsStore';
import { translations } from '../hooks/useTranslations';

// Define a type for the pending invitation check
export interface PendingInvitation {
    patientId: string;
    patientName: string;
    caregiver: Caregiver;
}

interface PatientState {
  patient: Patient | null;
  pendingInvitation: PendingInvitation | null;
  mesures: Mesure[];
  repas: Repas[];
  injections: Injection[];
  events: Event[];
  foodLibrary: Food[];
  todayProgress: DailyProgress | null;
  messages: Message[];
  unreadMessagesCount: number;
  isLoading: boolean;
  unsubscribePatient: Unsubscribe | null;
  unsubscribeMessages: Unsubscribe | null;
  clearPatientData: () => void;
  loadPatientData: (user: User) => Promise<boolean>;
  checkForPendingInvitation: (user: User) => Promise<boolean>;
  handleInvitation: (invitation: PendingInvitation, accept: boolean, user: User) => Promise<void>;
  createPatient: (prenom: string, naissance: string, user: User) => Promise<void>;
  updatePatient: (patientData: Patient) => Promise<void>;
  addMesure: (mesure: Omit<Mesure, 'id' | 'patient_id' | 'ts'>, ts: string) => Promise<void>;
  addRepas: (repas: Omit<Repas, 'id' | 'patient_id' | 'ts'>, ts: string) => Promise<void>;
  addInjection: (injection: Omit<Injection, 'id' | 'patient_id' | 'ts'>, ts: string) => Promise<void>;
  addFullBolus: (payload: FullBolusPayload, ts: string) => Promise<void>;
  addOrUpdateFood: (food: Food) => Promise<void>;
  getLastCorrection: () => Promise<Injection | null>;
  addEvent: (eventData: Omit<Event, 'id' | 'patient_id' | 'status'>) => Promise<void>;
  updateEventStatus: (eventId: string, status: 'pending' | 'completed') => Promise<void>;
  logWater: (amount_ml: number) => Promise<void>;
  logActivity: (duration_min: number) => Promise<void>;
  logQuizCompleted: () => Promise<void>;
  inviteCaregiver: (email: string, role: CaregiverRole) => Promise<void>;
  removeCaregiver: (caregiver: Caregiver) => Promise<void>;
  updateCaregiverPermissions: (caregiverEmail: string, permissions: CaregiverPermissions) => Promise<void>;
  markMessagesAsRead: () => Promise<void>;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patient: null,
  pendingInvitation: null,
  mesures: [],
  repas: [],
  injections: [],
  events: [],
  foodLibrary: [],
  todayProgress: null,
  messages: [],
  unreadMessagesCount: 0,
  isLoading: true,
  unsubscribePatient: null,
  unsubscribeMessages: null,

  clearPatientData: () => {
    get().unsubscribePatient?.();
    get().unsubscribeMessages?.();
    set({
      patient: null,
      pendingInvitation: null,
      mesures: [],
      repas: [],
      injections: [],
      events: [],
      todayProgress: null,
      messages: [],
      unreadMessagesCount: 0,
      isLoading: false,
      unsubscribePatient: null,
      unsubscribeMessages: null,
    });
  },
  
  checkForPendingInvitation: async (user: User) => {
    const q = query(collection(firestore, "patients"));
    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
        const patientData = doc.data() as Patient;
        const pendingCaregiver = patientData.caregivers.find(c => c.email === user.email && c.status === 'awaiting_confirmation');
        if (pendingCaregiver) {
            set({
                pendingInvitation: {
                    patientId: patientData.id,
                    patientName: patientData.prenom,
                    caregiver: pendingCaregiver
                }
            });
            return true;
        }
    }
    return false;
  },

  loadPatientData: async (user: User) => {
    set({ isLoading: true });
    get().clearPatientData();

    const querySnapshot = await getDocs(collection(firestore, "patients"));
    let patientDoc;
    querySnapshot.forEach((doc) => {
        const patientData = doc.data() as Patient;
        if (patientData.caregivers.some(c => c.userUid === user.uid && c.status === 'active')) {
            patientDoc = doc;
        }
    });

    if (patientDoc) {
      const patientId = patientDoc.id;
      
      const unsubPatient = onSnapshot(doc(firestore, "patients", patientId), (doc) => {
          const patientData = doc.data() as Patient;
          set({ patient: patientData });
      });

      const unsubMessages = onSnapshot(query(collection(firestore, `patients/${patientId}/messages`), where("toUid", "==", user.uid), orderBy("ts", "desc")), (snapshot) => {
          const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
          const unreadCount = messages.filter(m => !m.read).length;
          set({ messages, unreadMessagesCount: unreadCount });
      });

      set({ unsubscribePatient: unsubPatient, unsubscribeMessages: unsubMessages });

      const foodCount = await db.foodLibrary.count();
      if(foodCount === 0) await db.foodLibrary.bulkAdd(initialFoodData);
      
      const [foodLib, allMesures, allRepas, allInjections, allEvents] = await Promise.all([
          db.foodLibrary.toArray(),
          db.mesures.where('patient_id').equals(patientId).reverse().sortBy('ts'),
          db.repas.where('patient_id').equals(patientId).reverse().sortBy('ts'),
          db.injections.where('patient_id').equals(patientId).reverse().sortBy('ts'),
          db.events.where({ patient_id: patientId, status: 'pending' }).sortBy('ts')
      ]);

      const todayStr = new Date().toISOString().split('T')[0];
      let progress = await db.dailyProgress.get(todayStr);
      if (!progress) {
          progress = { date: todayStr, patient_id: patientId, water_ml: 0, activity_min: 0, quiz_completed: false };
          await db.dailyProgress.put(progress);
      }

      set({ foodLibrary: foodLib, mesures: allMesures, repas: allRepas, injections: allInjections, events: allEvents, todayProgress: progress, isLoading: false });
      return true;
    } else {
      const hasInvitation = await get().checkForPendingInvitation(user);
      set({ isLoading: false });
      return hasInvitation ? true : false; // It's not a profile, but there's a next step
    }
  },
  
  handleInvitation: async (invitation, accept, user) => {
    const patientRef = doc(firestore, "patients", invitation.patientId);
    const patientSnap = await getDoc(patientRef);
    if (!patientSnap.exists()) return;

    const patientData = patientSnap.data() as Patient;
    const owner = patientData.caregivers.find(c => c.role === 'owner');

    let updatedCaregivers = [...patientData.caregivers];
    const caregiverIndex = updatedCaregivers.findIndex(c => c.email === user.email && c.status === 'awaiting_confirmation');
    
    if (caregiverIndex !== -1) {
        if (accept) {
            updatedCaregivers[caregiverIndex].status = 'active';
            updatedCaregivers[caregiverIndex].userUid = user.uid;
            await updateDoc(patientRef, { caregivers: updatedCaregivers });
            set({ pendingInvitation: null });
            await get().loadPatientData(user); // Reload to get patient access
        } else {
            updatedCaregivers[caregiverIndex].status = 'declined';
            await updateDoc(patientRef, { caregivers: updatedCaregivers });
            if (owner && owner.userUid) {
                 // FIX: Replaced useTranslations hook with Zustand's getState to access translations outside of a component.
                 const lang = useSettingsStore.getState().language;
                 const t = translations[lang] || translations.fr;
                 const messageText = t.message_invitationDeclined(user.email!, invitation.patientName);
                 await addDoc(collection(firestore, `patients/${invitation.patientId}/messages`), {
                    patientId: invitation.patientId,
                    fromUid: 'system',
                    fromEmail: t.inbox_fromSystem,
                    toUid: owner.userUid,
                    text: messageText,
                    ts: new Date().toISOString(),
                    read: false
                 });
            }
            set({ pendingInvitation: null });
            useAuthStore.getState().logout();
        }
    }
  },

  createPatient: async (prenom, naissance, user) => {
    set({ isLoading: true });
    const patientId = uuidv4();
    const newPatient: Patient = {
      id: patientId,
      userUid: user.uid,
      prenom,
      naissance,
      ...DEFAULT_PATIENT_SETTINGS,
      caregivers: [{
          userUid: user.uid,
          email: user.email!,
          role: 'owner',
          status: 'active',
          permissions: { canViewJournal: true, canEditJournal: true, canEditPAI: true, canManageFamily: true }
      }]
    };
    await setDoc(doc(firestore, "patients", patientId), newPatient);
    // set({ patient: newPatient, isLoading: false }); // Removed to prevent race condition
    await get().loadPatientData(user);
  },
  
  updatePatient: async (patientData) => {
    const { patient } = get();
    if (!patient) return;
    const patientRef = doc(firestore, "patients", patient.id);
    await setDoc(patientRef, patientData, { merge: true });
  },

  addMesure: async (mesureData, ts) => {
      const { patient } = get();
      if (!patient) return;
      const newMesure: Mesure = { ...mesureData, id: uuidv4(), patient_id: patient.id, ts };
      await db.mesures.add(newMesure);
      set(state => ({ mesures: [newMesure, ...state.mesures].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()) }));
  },

  addRepas: async (repasData, ts) => {
      const { patient } = get();
      if (!patient) return;
      const newRepas: Repas = { ...repasData, id: uuidv4(), patient_id: patient.id, ts };
      await db.repas.add(newRepas);
      set(state => ({ repas: [newRepas, ...state.repas].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()) }));
  },
  
  addInjection: async (injectionData, ts) => {
      const { patient } = get();
      if (!patient) return;
      const newInjection: Injection = { ...injectionData, id: uuidv4(), patient_id: patient.id, ts };
      await db.injections.add(newInjection);
      set(state => ({ injections: [newInjection, ...state.injections].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()) }));
  },
  
  addFullBolus: async (payload, ts) => {
      const { patient } = get();
      if (!patient) return;
      const mesureId = uuidv4();
      const repasId = uuidv4();
      const injectionId = uuidv4();
      const newMesure: Mesure = { ...payload.mesure, id: mesureId, patient_id: patient.id, ts };
      const newRepas: Repas = { ...payload.repas, id: repasId, patient_id: patient.id, ts };
      const newInjection: Injection = { ...payload.injection, id: injectionId, patient_id: patient.id, ts, lien_mesure_id: mesureId, lien_repas_id: repasId };
      await db.transaction('rw', db.mesures, db.repas, db.injections, async () => {
          await db.mesures.add(newMesure);
          await db.repas.add(newRepas);
          await db.injections.add(newInjection);
      });
      set(state => ({
          mesures: [newMesure, ...state.mesures].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()),
          repas: [newRepas, ...state.repas].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()),
          injections: [newInjection, ...state.injections].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()),
      }));
  },
  
  addOrUpdateFood: async (food) => {
      await db.foodLibrary.put(food);
      const foodLib = await db.foodLibrary.toArray();
      set({ foodLibrary: foodLib });
  },

  getLastCorrection: async () => {
    const { patient } = get();
    if (!patient) return null;
    return await db.injections
        .where({ patient_id: patient.id })
        .filter(inj => inj.type === 'correction' || (inj.calc_details || '').toLowerCase().includes('correction'))
        .last() || null;
  },

  addEvent: async (eventData) => {
    const { patient } = get();
    if (!patient) return;
    const newEvent: Event = { ...eventData, id: uuidv4(), patient_id: patient.id, status: 'pending' };
    await db.events.add(newEvent);
    set(state => ({ events: [...state.events, newEvent].sort((a,b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()) }));
  },

  updateEventStatus: async (eventId, status) => {
    await db.events.update(eventId, { status });
    set(state => ({
        events: state.events.map(e => e.id === eventId ? { ...e, status } : e).filter(e => e.status === 'pending')
    }));
  },

  logWater: async (amount_ml) => {
    const { todayProgress } = get();
    if (!todayProgress) return;
    const newProgress = { ...todayProgress, water_ml: todayProgress.water_ml + amount_ml };
    await db.dailyProgress.put(newProgress);
    set({ todayProgress: newProgress });
  },

  logActivity: async (duration_min) => {
    const { todayProgress } = get();
    if (!todayProgress) return;
    const newProgress = { ...todayProgress, activity_min: todayProgress.activity_min + duration_min };
    await db.dailyProgress.put(newProgress);
    set({ todayProgress: newProgress });
  },

  logQuizCompleted: async () => {
    const { todayProgress } = get();
    if (!todayProgress || todayProgress.quiz_completed) return;
    const newProgress = { ...todayProgress, quiz_completed: true };
    await db.dailyProgress.put(newProgress);
    set({ todayProgress: newProgress });
  },

  inviteCaregiver: async (email, role) => {
    const { patient } = get();
    if (!patient) throw new Error("Patient not loaded");
    if (patient.caregivers.some(c => c.email === email)) {
        throw new Error("User is already a caregiver.");
    }

    const defaultPermissions: CaregiverPermissions = {
        canViewJournal: true,
        canEditJournal: role === 'parent',
        canEditPAI: false,
        canManageFamily: false,
    };
    
    if (role === 'health_professional') {
        defaultPermissions.canEditJournal = false;
    }

    const newCaregiver: Caregiver = {
        userUid: null,
        email,
        role,
        status: 'awaiting_confirmation',
        permissions: defaultPermissions
    };

    const patientRef = doc(firestore, "patients", patient.id);
    await updateDoc(patientRef, {
        caregivers: arrayUnion(newCaregiver)
    });
  },

  removeCaregiver: async (caregiverToRemove) => {
    const { patient } = get();
    if (!patient) return;

    // Find the full object to remove, as arrayRemove requires an exact match.
    const caregiverInState = patient.caregivers.find(c => c.email === caregiverToRemove.email);
    if (!caregiverInState) return;

    const patientRef = doc(firestore, "patients", patient.id);
    await updateDoc(patientRef, {
        caregivers: arrayRemove(caregiverInState)
    });
  },
  
  updateCaregiverPermissions: async (caregiverEmail, newPermissions) => {
    const { patient } = get();
    if (!patient) return;

    const updatedCaregivers = patient.caregivers.map(c => 
        c.email === caregiverEmail ? { ...c, permissions: newPermissions } : c
    );

    const patientRef = doc(firestore, "patients", patient.id);
    await updateDoc(patientRef, { caregivers: updatedCaregivers });
  },

  markMessagesAsRead: async () => {
    const { patient, messages } = get();
    const user = useAuthStore.getState().currentUser;
    if (!patient || !user) return;

    const unreadMessages = messages.filter(m => !m.read && m.toUid === user.uid);
    if (unreadMessages.length === 0) return;

    try {
        const batch = writeBatch(firestore);
        unreadMessages.forEach(message => {
            const msgRef = doc(firestore, `patients/${patient.id}/messages`, message.id);
            batch.update(msgRef, { read: true });
        });
        await batch.commit();
    } catch (error) {
        console.error("Failed to mark messages as read:", error);
    }
  },
}));