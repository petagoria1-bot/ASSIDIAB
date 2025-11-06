import { create } from 'zustand';
import { db } from '../services/db.ts';
import { Patient, Mesure, Repas, Injection, Food, FullBolusPayload, Event, DailyProgress, User, Caregiver, CaregiverRole, CaregiverPermissions, Message } from '../types.ts';
import { v4 as uuidv4 } from 'uuid';
import { initialFoodData } from '../data/foodLibrary.ts';
import { DEFAULT_PATIENT_SETTINGS } from '../constants.ts';
import { firestore } from '../services/firebase.ts';
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, query, where, getDocs, onSnapshot, Unsubscribe, addDoc, orderBy, writeBatch, Timestamp, serverTimestamp, deleteDoc } from "firebase/firestore";
import { useAuthStore } from './authStore.ts';
import toast from 'react-hot-toast';
import Dexie from 'dexie';


interface PatientState {
  patient: Patient | null;
  mesures: Mesure[];
  repas: Repas[];
  injections: Injection[];
  events: Event[];
  foodLibrary: Food[];
  todayProgress: DailyProgress | null;
  messages: Message[];
  unreadMessagesCount: number;
  isLoading: boolean;
  error: string | null;
  unsubscribePatient: Unsubscribe | null;
  unsubscribeMessages: Unsubscribe | null;
  clearPatientData: () => void;
  loadPatientData: (user: User) => Promise<boolean>;
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
  generateInvitationLink: (email: string, role: CaregiverRole) => Promise<string | null>;
  getInvitationDetails: (inviteId: string) => Promise<{ patientName: string; role: string; email: string; } | null>;
  acceptInvitation: (inviteId: string, user: User) => Promise<void>;
  removeCaregiver: (caregiver: Caregiver) => Promise<void>;
  updateCaregiverPermissions: (caregiverEmail: string, permissions: CaregiverPermissions) => Promise<void>;
  markMessagesAsRead: () => Promise<void>;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patient: null,
  mesures: [],
  repas: [],
  injections: [],
  events: [],
  foodLibrary: [],
  todayProgress: null,
  messages: [],
  unreadMessagesCount: 0,
  isLoading: true,
  error: null,
  unsubscribePatient: null,
  unsubscribeMessages: null,

  clearPatientData: () => {
    get().unsubscribePatient?.();
    get().unsubscribeMessages?.();
    set({
      patient: null,
      mesures: [],
      repas: [],
      injections: [],
      events: [],
      todayProgress: null,
      messages: [],
      unreadMessagesCount: 0,
      unsubscribePatient: null,
      unsubscribeMessages: null,
    });
  },
  
  loadPatientData: async (user: User) => {
    set({ isLoading: true, error: null });
    get().clearPatientData();

    try {
        const q = query(collection(firestore, "patients"), where("caregiversUids", "array-contains", user.uid));
        const querySnapshot = await getDocs(q);
        const patientDoc = querySnapshot.empty ? null : querySnapshot.docs[0];

        if (patientDoc) {
            const patientId = patientDoc.id;
            
            const unsubPatient = onSnapshot(doc(firestore, "patients", patientId), (doc) => {
                if (doc.exists()) set({ patient: doc.data() as Patient });
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
                db.foodLibrary.orderBy('name').toArray(),
                db.mesures.where('[patient_id+ts]').between([patientId, Dexie.minKey], [patientId, Dexie.maxKey]).reverse().toArray(),
                db.repas.where('[patient_id+ts]').between([patientId, Dexie.minKey], [patientId, Dexie.maxKey]).reverse().toArray(),
                db.injections.where('[patient_id+ts]').between([patientId, Dexie.minKey], [patientId, Dexie.maxKey]).reverse().toArray(),
                db.events.where('[patient_id+status]').equals([patientId, 'pending']).sortBy('ts')
            ]);

            const todayStr = new Date().toISOString().split('T')[0];
            let progress = await db.dailyProgress.get(todayStr);
            if (!progress) {
                progress = { date: todayStr, patient_id: patientId, water_ml: 0, activity_min: 0, quiz_completed: false };
                await db.dailyProgress.put(progress);
            }

            set({ patient: patientDoc.data() as Patient, foodLibrary: foodLib, mesures: allMesures, repas: allRepas, injections: allInjections, events: allEvents, todayProgress: progress, isLoading: false });
            return true;
        } else {
            set({ isLoading: false });
            return false;
        }
    } catch (error) {
        console.error("CRITICAL: Failed to load patient data.", error);
        toast.error("Une erreur critique est survenue. Impossible de charger vos données. Veuillez réessayer.");
        set({ isLoading: false, patient: null, error: "LOAD_FAILED" });
        return false;
    }
  },

  createPatient: async (prenom, naissance, user) => {
    set({ isLoading: true });
    try {
      const patientId = uuidv4();
      const ownerCaregiver: Caregiver = {
          userUid: user.uid,
          email: user.email!,
          role: 'owner',
          status: 'active',
          permissions: { canViewJournal: true, canEditJournal: true, canEditPAI: true, canManageFamily: true }
      };
      const newPatient: Patient = {
        id: patientId,
        userUid: user.uid,
        prenom,
        naissance,
        ...DEFAULT_PATIENT_SETTINGS,
        caregivers: [ownerCaregiver]
      };

      await setDoc(doc(firestore, "patients", patientId), {
          ...newPatient,
          caregiversUids: [user.uid] // For querying
      });
      
      await get().loadPatientData(user);

    } catch (error) {
      console.error("Failed to create patient:", error);
      toast.error("Erreur lors de la création du profil.");
      set({ isLoading: false, error: "CREATE_FAILED" });
    }
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

  logWater: async (amount_ml: number) => {
    const { todayProgress } = get();
    if (!todayProgress) return;
    const newProgress = { ...todayProgress, water_ml: todayProgress.water_ml + amount_ml };
    await db.dailyProgress.put(newProgress);
    set({ todayProgress: newProgress });
  },

  logActivity: async (duration_min: number) => {
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

  generateInvitationLink: async (email, role) => {
    const { patient } = get();
    if (!patient) throw new Error("Patient not loaded");
    if (patient.caregivers.some(c => c.email === email)) {
        throw new Error("User is already a caregiver.");
    }
    const inviteId = uuidv4();
    const inviteRef = doc(firestore, `invitations`, inviteId);
    
    await setDoc(inviteRef, {
        email,
        role,
        patientId: patient.id,
        patientName: patient.prenom,
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 72 * 60 * 60 * 1000)), // 72 hours
    });

    const patientRef = doc(firestore, "patients", patient.id);
    const newCaregiver: Caregiver = {
        userUid: null, email, role, status: 'awaiting_confirmation',
        permissions: { canViewJournal: true, canEditJournal: role === 'parent', canEditPAI: false, canManageFamily: false }
    };
    await updateDoc(patientRef, { caregivers: arrayUnion(newCaregiver) });

    // FIX: Use hash-based routing to prevent 404 errors on deep links.
    return `${window.location.origin}/#/invite/${inviteId}`;
  },

  getInvitationDetails: async (inviteId) => {
    const inviteRef = doc(firestore, `invitations`, inviteId);
    const inviteSnap = await getDoc(inviteRef);
    
    if (inviteSnap.exists()) {
        const data = inviteSnap.data();
        const expiresAt = (data.expiresAt as Timestamp).toDate();
        if (expiresAt < new Date()) {
            await deleteDoc(inviteRef);
            return null; // Expired
        }
        return { patientName: data.patientName, role: data.role, email: data.email };
    }
    return null;
  },

  acceptInvitation: async (inviteId, user) => {
    const inviteRef = doc(firestore, "invitations", inviteId);
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) {
        throw new Error("Invitation not found or invalid.");
    }
    
    const inviteData = inviteSnap.data();
    if (user.email !== inviteData.email) {
        await deleteDoc(inviteRef);
        throw new Error("Logged-in user does not match invitation email.");
    }

    const patientRef = doc(firestore, "patients", inviteData.patientId);

    // ARCHITECTURAL NOTE: The following read-modify-write operation will fail for a new user
    // if secure Firestore rules are in place (i.e., allow read only if user is already a caregiver).
    // A new user doesn't have read permission yet, so getDoc() will be denied.
    // The robust solution for this chicken-and-egg problem is to use a Cloud Function
    // with admin privileges to handle the acceptance logic securely.
    // For now, this code assumes either relaxed security rules or will fail gracefully.
    try {
        const patientSnap = await getDoc(patientRef);
        if (!patientSnap.exists()) {
            await deleteDoc(inviteRef);
            throw new Error("Patient profile not found.");
        }

        const patientData = patientSnap.data() as Patient;
        const updatedCaregivers = patientData.caregivers.map(c => {
            if (c.email === inviteData.email && c.status === 'awaiting_confirmation') {
                return { ...c, status: 'active' as const, userUid: user.uid };
            }
            return c;
        });

        await updateDoc(patientRef, {
            caregivers: updatedCaregivers,
            caregiversUids: arrayUnion(user.uid)
        });

        await deleteDoc(inviteRef);
        return;
    } catch (error) {
        console.error("Permission error during invitation acceptance:", error);
        toast.error("Impossible de rejoindre le cercle de soins. Le propriétaire du profil doit vous ajouter manuellement pour le moment.");
        // We don't delete the invite here, maybe it can be retried.
        throw error;
    }
  },

  removeCaregiver: async (caregiverToRemove) => {
    const { patient } = get();
    if (!patient) return;

    const caregiverInState = patient.caregivers.find(c => c.email === caregiverToRemove.email);
    if (!caregiverInState) return;

    const patientRef = doc(firestore, "patients", patient.id);
    
    const updatePayload: any = {
        caregivers: arrayRemove(caregiverInState)
    };
    
    if (caregiverInState.status === 'active' && caregiverInState.userUid) {
        updatePayload.caregiversUids = arrayRemove(caregiverInState.userUid);
    }
    
    await updateDoc(patientRef, updatePayload);
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
