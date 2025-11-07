import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { db } from '../services/db.ts';
import { 
    Patient, User, Mesure, Repas, Injection, Food, FullBolusPayload, 
    Event, Caregiver, CaregiverRole, CaregiverPermissions, DailyProgress, Message
} from '../types.ts';
import { initialFoodData } from '../data/foodLibrary.ts';
import { DEFAULT_PATIENT_SETTINGS } from '../constants.ts';
import { 
    doc, getDoc, setDoc, updateDoc, arrayUnion, 
    collection, addDoc, query, where, getDocs, writeBatch, serverTimestamp, deleteDoc, orderBy
} from 'firebase/firestore';
import { firestore } from '../services/firebase.ts';

// Helper to get today's date string
const getTodayDateString = () => new Date().toISOString().split('T')[0];

interface PatientState {
  patient: Patient | null;
  mesures: Mesure[];
  repas: Repas[];
  injections: Injection[];
  foodLibrary: Food[];
  events: Event[];
  messages: Message[];
  unreadMessagesCount: number;
  todayProgress: DailyProgress | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadPatientData: (user: User) => Promise<void>;
  createPatient: (prenom: string, naissance: string, user: User) => Promise<void>;
  updatePatient: (updatedPatient: Patient) => Promise<void>;
  
  // Data logging
  addMesure: (mesureData: Omit<Mesure, 'id' | 'patient_id' | 'ts'>, ts: string) => Promise<void>;
  addRepas: (repasData: Omit<Repas, 'id' | 'patient_id' | 'ts'>, ts: string) => Promise<void>;
  addInjection: (injectionData: Omit<Injection, 'id' | 'patient_id' | 'ts'>, ts: string) => Promise<void>;
  addFullBolus: (payload: FullBolusPayload, ts: string) => Promise<void>;
  getLastCorrection: () => Promise<Injection | null>;

  // Events
  addEvent: (eventData: Omit<Event, 'id' | 'patient_id' | 'status'>) => Promise<void>;
  updateEventStatus: (eventId: string, status: 'completed' | 'pending') => Promise<void>;

  // Food Library
  addOrUpdateFood: (food: Food) => Promise<void>;
  
  // Caregivers & Invitations
  generateInvitationLink: (email: string, role: CaregiverRole) => Promise<string | null>;
  getInvitationDetails: (inviteId: string) => Promise<{ patientName: string; role: string; email: string; } | null>;
  acceptInvitation: (inviteId: string, user: User) => Promise<void>;
  removeCaregiver: (caregiverToRemove: Caregiver) => Promise<void>;
  updateCaregiverPermissions: (caregiverEmail: string, permissions: CaregiverPermissions) => Promise<void>;
  getInvitationLinkForPendingCaregiver: (email: string) => string | null;
  resendInvitation: (caregiver: Caregiver) => Promise<string | null>;

  // Progress
  logWater: (amount_ml: number) => Promise<void>;
  logActivity: (duration_min: number) => Promise<void>;
  logQuizCompleted: () => Promise<void>;

  // Messages
  markMessagesAsRead: () => Promise<void>;

  // Local state management
  clearPatientData: () => void;
}

export const usePatientStore = create<PatientState>((set, get) => ({
    patient: null,
    mesures: [],
    repas: [],
    injections: [],
    foodLibrary: [],
    events: [],
    messages: [],
    unreadMessagesCount: 0,
    todayProgress: null,
    isLoading: true,
    error: null,
    
    clearPatientData: () => set({
        patient: null,
        mesures: [],
        repas: [],
        injections: [],
        events: [],
        messages: [],
        unreadMessagesCount: 0,
        todayProgress: null,
        isLoading: false,
        error: null,
    }),

    loadPatientData: async (user: User) => {
        set({ isLoading: true, error: null });
        try {
            const userProfileRef = doc(firestore, 'users', user.uid);
            const userProfileSnap = await getDoc(userProfileRef);
    
            let patientDoc: Patient | null = null;
            
            if (userProfileSnap.exists()) {
                const { patientId } = userProfileSnap.data();
                if (patientId) {
                    const patientRef = doc(firestore, 'patients', patientId);
                    try {
                        const patientSnap = await getDoc(patientRef);
                        if (patientSnap.exists()) {
                            const patientData = patientSnap.data() as Omit<Patient, 'id'>;
                            if (patientData.caregiversUids?.includes(user.uid)) {
                                patientDoc = { id: patientSnap.id, ...patientData };
                            } else {
                                console.warn(`User ${user.uid} is linked to patient ${patientId} but not in caregiversUids. Activation may be pending.`);
                            }
                        }
                    } catch (e: any) {
                        if (e.code === 'permission-denied') {
                            console.warn(`Permission denied reading patient doc ${patientId}. Activation may be pending.`);
                            // This is an expected state for a new user accepting an invite.
                            // We treat it as if they have no patient profile yet, avoiding a critical error.
                            // patientDoc will remain null.
                        } else {
                            throw e; // Re-throw other unexpected errors to be caught by the outer block.
                        }
                    }
                }
            }
            
            if (patientDoc) {
                const patientId = patientDoc.id;
    
                const [mesuresDocs, repasDocs, injectionsDocs, eventsDocs, messagesDocs] = await Promise.all([
                    getDocs(query(collection(firestore, `patients/${patientId}/mesures`), orderBy('ts', 'desc'))),
                    getDocs(query(collection(firestore, `patients/${patientId}/repas`), orderBy('ts', 'desc'))),
                    getDocs(query(collection(firestore, `patients/${patientId}/injections`), orderBy('ts', 'desc'))),
                    getDocs(query(collection(firestore, `patients/${patientId}/events`), orderBy('ts', 'desc'))),
                    getDocs(query(collection(firestore, `patients/${patientId}/messages`), where('toUid', '==', user.uid), orderBy('ts', 'desc'))),
                ]);
    
                const mesures = mesuresDocs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mesure));
                const repas = repasDocs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Repas));
                const injections = injectionsDocs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Injection));
                const events = eventsDocs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
                const messages = messagesDocs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
                const unreadMessagesCount = messages.filter(m => !m.read).length;
                
                const todayStr = getTodayDateString();
                const progressDocRef = doc(firestore, `patients/${patientId}/dailyProgress`, todayStr);
                const progressDoc = await getDoc(progressDocRef);
                let todayProgress: DailyProgress;
                if (progressDoc.exists()) {
                    todayProgress = progressDoc.data() as DailyProgress;
                } else {
                    todayProgress = { date: todayStr, patient_id: patientId, water_ml: 0, activity_min: 0, quiz_completed: false };
                    await setDoc(progressDocRef, todayProgress);
                }
    
                set({ patient: patientDoc, mesures, repas, injections, events, messages, unreadMessagesCount, todayProgress, isLoading: false, error: null });
            } else {
                // This path is now taken for new users, users with pending activation, or users whose link is broken.
                // It's not a critical error state, so we clear the error.
                set({ patient: null, isLoading: false, error: null });
            }
    
            // Food library management (offline-first) should happen regardless of patient status
            const foodCount = await db.foodLibrary.count();
            if (foodCount === 0) {
                await db.foodLibrary.bulkAdd(initialFoodData);
            }
            const foodLibrary = await db.foodLibrary.toArray();
            set({ foodLibrary });
    
        } catch (e) {
            console.error("CRITICAL: Unhandled error in loadPatientData.", e);
            set({ isLoading: false, error: "Missing or insufficient permissions." });
        }
    },

    createPatient: async (prenom: string, naissance: string, user: User) => {
        set({ isLoading: true });
        const patientId = uuidv4();
        const ownerCaregiver: Caregiver = {
            userUid: user.uid,
            email: user.email || 'proprietaire@diabassis.com',
            role: 'owner',
            status: 'active',
            permissions: { canViewJournal: true, canEditJournal: true, canEditPAI: true, canManageFamily: true },
        };
        const newPatient: Patient = {
            id: patientId,
            userUid: user.uid,
            prenom,
            naissance,
            ...DEFAULT_PATIENT_SETTINGS,
            caregivers: [ownerCaregiver],
            caregiversUids: [user.uid],
        };

        try {
            const batch = writeBatch(firestore);

            // 1. Create the patient document
            const patientRef = doc(firestore, "patients", patientId);
            batch.set(patientRef, newPatient);

            // 2. Create the user profile document for direct lookup
            const userProfileRef = doc(firestore, "users", user.uid);
            batch.set(userProfileRef, { patientId: patientId });

            await batch.commit();
            
            await get().loadPatientData(user); // Reload all data for the new patient
        } catch (error) {
            console.error("Error creating patient:", error);
            toast.error("Erreur lors de la création du profil.");
            set({ isLoading: false, error: "Failed to create profile." });
        }
    },
    
    updatePatient: async (updatedPatient: Patient) => {
        if (!get().patient) return;
        set({ isLoading: true });
        try {
            const patientRef = doc(firestore, "patients", updatedPatient.id);
            await updateDoc(patientRef, updatedPatient as any); // Use `any` to bypass deep type checks
            set({ patient: updatedPatient, isLoading: false });
            toast.success("Profil mis à jour !");
        } catch (error) {
            console.error("Error updating patient:", error);
            toast.error("Erreur lors de la mise à jour.");
            set({ isLoading: false });
        }
    },
    
    addMesure: async (mesureData, ts) => {
        const patient = get().patient;
        if (!patient) return;
        const newMesure: Mesure = { ...mesureData, id: uuidv4(), patient_id: patient.id, ts };
        set(state => ({ mesures: [newMesure, ...state.mesures].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()) }));
        await setDoc(doc(firestore, `patients/${patient.id}/mesures`, newMesure.id), newMesure);
    },
    
    addRepas: async (repasData, ts) => {
        const patient = get().patient;
        if (!patient) return;
        const newRepas: Repas = { ...repasData, id: uuidv4(), patient_id: patient.id, ts };
        set(state => ({ repas: [newRepas, ...state.repas].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()) }));
        await setDoc(doc(firestore, `patients/${patient.id}/repas`, newRepas.id), newRepas);
    },

    addInjection: async (injectionData, ts) => {
        const patient = get().patient;
        if (!patient) return;
        const newInjection: Injection = { ...injectionData, id: uuidv4(), patient_id: patient.id, ts };
        set(state => ({ injections: [newInjection, ...state.injections].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()) }));
        await setDoc(doc(firestore, `patients/${patient.id}/injections`, newInjection.id), newInjection);
    },

    addFullBolus: async (payload, ts) => {
        const patient = get().patient;
        if (!patient) return;
        
        const batch = writeBatch(firestore);
        
        const mesureRef = doc(collection(firestore, `patients/${patient.id}/mesures`));
        const repasRef = doc(collection(firestore, `patients/${patient.id}/repas`));
        const injectionRef = doc(collection(firestore, `patients/${patient.id}/injections`));

        const newMesure: Mesure = { ...payload.mesure, id: mesureRef.id, patient_id: patient.id, ts };
        const newRepas: Repas = { ...payload.repas, id: repasRef.id, patient_id: patient.id, ts };
        const newInjection: Injection = { ...payload.injection, id: injectionRef.id, patient_id: patient.id, ts, lien_repas_id: newRepas.id, lien_mesure_id: newMesure.id };

        batch.set(mesureRef, newMesure);
        batch.set(repasRef, newRepas);
        batch.set(injectionRef, newInjection);

        await batch.commit();

        set(state => ({
            mesures: [newMesure, ...state.mesures].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()),
            repas: [newRepas, ...state.repas].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()),
            injections: [newInjection, ...state.injections].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()),
        }));
    },

    getLastCorrection: async () => {
        const patient = get().patient;
        if (!patient) return null;
        const q = query(
            collection(firestore, `patients/${patient.id}/injections`),
            where('type', '==', 'correction'),
            orderBy('ts', 'desc'),
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return null;
        }
        return snapshot.docs[0].data() as Injection;
    },
    
    addOrUpdateFood: async (food: Food) => {
        await db.foodLibrary.put(food);
        const foodLibrary = await db.foodLibrary.toArray();
        set({ foodLibrary });
    },
    
    generateInvitationLink: async (email, role) => {
        const patient = get().patient;
        if (!patient) {
            throw new Error("Profil patient non chargé.");
        }
        
        // Prevent re-inviting an active or pending user
        const existingCaregiver = patient.caregivers.find(c => c.email.toLowerCase() === email.toLowerCase());
        if (existingCaregiver) {
             if (existingCaregiver.status === 'active') throw new Error("Cette personne fait déjà partie de votre cercle de soins.");
             if (existingCaregiver.status === 'awaiting_confirmation') throw new Error("Une invitation est déjà en attente pour cette personne.");
        }

        const inviteRef = await addDoc(collection(firestore, 'invitations'), {
            patientId: patient.id,
            patientName: patient.prenom,
            invitedEmail: email,
            role: role,
            createdAt: serverTimestamp(),
        });
        
        const newCaregiver: Caregiver = {
            userUid: null,
            email,
            role,
            status: 'awaiting_confirmation',
            inviteId: inviteRef.id,
            permissions: { canViewJournal: true, canEditJournal: false, canEditPAI: false, canManageFamily: false }
        };
        
        const patientRef = doc(firestore, "patients", patient.id);
        await updateDoc(patientRef, {
            caregivers: arrayUnion(newCaregiver)
        });

        set(state => ({
            patient: state.patient ? { ...state.patient, caregivers: [...state.patient.caregivers, newCaregiver] } : null
        }));

        const baseUrl = window.location.origin;
        return `${baseUrl}/#/invite/${inviteRef.id}`;
    },

    getInvitationDetails: async (inviteId) => {
        const inviteRef = doc(firestore, 'invitations', inviteId);
        const inviteSnap = await getDoc(inviteRef);
        if (inviteSnap.exists()) {
            const data = inviteSnap.data();
            return {
                patientName: data.patientName,
                role: data.role,
                email: data.invitedEmail,
            };
        }
        return null;
    },
    
    acceptInvitation: async (inviteId, user) => {
        const inviteRef = doc(firestore, 'invitations', inviteId);
        const inviteSnap = await getDoc(inviteRef);

        if (!inviteSnap.exists()) {
            throw new Error("Invitation invalide ou expirée.");
        }
        
        const inviteData = inviteSnap.data();
        const patientRef = doc(firestore, 'patients', inviteData.patientId);
        const patientSnap = await getDoc(patientRef);
        
        if (!patientSnap.exists()) {
            throw new Error("Profil patient introuvable.");
        }

        const patient = { id: patientSnap.id, ...patientSnap.data() } as Patient;
        
        // Create the user profile doc first to establish the link. This should always succeed for an authenticated user.
        const userProfileRef = doc(firestore, "users", user.uid);
        await setDoc(userProfileRef, { patientId: patient.id });
        
        // Now, attempt to update the patient document to finalize the process. This might fail due to security rules.
        try {
            const updatedCaregivers = patient.caregivers.map(c => {
                if (c.email.toLowerCase() === inviteData.invitedEmail.toLowerCase() && c.status === 'awaiting_confirmation') {
                    return { ...c, userUid: user.uid, status: 'active' as const };
                }
                return c;
            });
            
            const batch = writeBatch(firestore);
            batch.update(patientRef, {
                caregivers: updatedCaregivers,
                caregiversUids: arrayUnion(user.uid)
            });
            batch.delete(inviteRef);
            await batch.commit();

        } catch (e) {
             console.warn("Automatic activation failed due to permissions. Notifying owner for manual activation.");
             const messageText = `L'utilisateur ${user.email} a accepté votre invitation mais une action manuelle est requise. Veuillez aller dans "Réglages" > "Cercle de soins", et activez le profil manuellement.`;

             const owner = patient.caregivers.find(c => c.role === 'owner');
             if (owner && owner.userUid) {
                 const messagesRef = collection(firestore, `patients/${patient.id}/messages`);
                 await addDoc(messagesRef, {
                     patientId: patient.id, fromUid: 'system', fromEmail: 'Système', toUid: owner.userUid,
                     text: messageText, ts: new Date().toISOString(), read: false,
                 });
             }
             await deleteDoc(inviteRef);
             // Non-blocking error notification for the user
             toast.error("Activation en attente. Le propriétaire du profil a été notifié.", { duration: 6000 });
        }
        
        // Reload data. This will now succeed because the user profile doc was created.
        await get().loadPatientData(user);
    },
    
    removeCaregiver: async (caregiverToRemove) => {
        const patient = get().patient;
        if (!patient) return;

        const updatedCaregivers = patient.caregivers.filter(c => c.email !== caregiverToRemove.email);
        const updatedUids = patient.caregiversUids?.filter(uid => uid !== caregiverToRemove.userUid);
        
        const batch = writeBatch(firestore);

        // Update patient doc
        const patientRef = doc(firestore, "patients", patient.id);
        batch.update(patientRef, {
            caregivers: updatedCaregivers,
            caregiversUids: updatedUids
        });

        // Delete pending invite doc if it exists
        if (caregiverToRemove.inviteId) {
            const inviteRef = doc(firestore, 'invitations', caregiverToRemove.inviteId);
            batch.delete(inviteRef);
        }

        // Delete user profile doc to remove their access
        if (caregiverToRemove.userUid) {
            const userProfileRef = doc(firestore, 'users', caregiverToRemove.userUid);
            batch.delete(userProfileRef);
        }

        await batch.commit();

        set(state => ({
            patient: state.patient ? { ...state.patient, caregivers: updatedCaregivers, caregiversUids: updatedUids } : null
        }));
    },
    
    updateCaregiverPermissions: async (caregiverEmail, permissions) => {
        const patient = get().patient;
        if (!patient) return;
        
        const updatedCaregivers = patient.caregivers.map(c => c.email === caregiverEmail ? { ...c, permissions } : c);
        const patientRef = doc(firestore, "patients", patient.id);
        await updateDoc(patientRef, { caregivers: updatedCaregivers });

        set(state => ({
            patient: state.patient ? { ...state.patient, caregivers: updatedCaregivers } : null
        }));
        toast.success("Permissions mises à jour.");
    },

    getInvitationLinkForPendingCaregiver: (email) => {
        const caregiver = get().patient?.caregivers.find(c => c.email === email && c.status === 'awaiting_confirmation');
        if (caregiver?.inviteId) {
            const baseUrl = window.location.origin;
            return `${baseUrl}/#/invite/${caregiver.inviteId}`;
        }
        return null;
    },

    resendInvitation: async (caregiver) => {
        const patient = get().patient;
        if (!patient || caregiver.status !== 'awaiting_confirmation') return null;

        // Delete old invitation doc if it exists
        if (caregiver.inviteId) {
            await deleteDoc(doc(firestore, 'invitations', caregiver.inviteId));
        }

        // Generate new link and update caregiver with new inviteId
        const newLink = await get().generateInvitationLink(caregiver.email, caregiver.role);
        return newLink;
    },

    addEvent: async (eventData) => {
        const patient = get().patient;
        if (!patient) return;
        const newEvent: Event = { ...eventData, id: uuidv4(), patient_id: patient.id, status: 'pending' };
        set(state => ({ events: [newEvent, ...state.events].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()) }));
        await setDoc(doc(firestore, `patients/${patient.id}/events`, newEvent.id), newEvent);
    },

    updateEventStatus: async (eventId, status) => {
        const patient = get().patient;
        if (!patient) return;
        set(state => ({
            events: state.events.map(e => e.id === eventId ? { ...e, status } : e)
        }));
        await updateDoc(doc(firestore, `patients/${patient.id}/events`, eventId), { status });
    },
    
    logWater: async (amount_ml) => {
        const { patient, todayProgress } = get();
        if (!patient || !todayProgress) return;
        const newAmount = todayProgress.water_ml + amount_ml;
        const updatedProgress = { ...todayProgress, water_ml: newAmount };
        set({ todayProgress: updatedProgress });
        const progressRef = doc(firestore, `patients/${patient.id}/dailyProgress`, todayProgress.date);
        await updateDoc(progressRef, { water_ml: newAmount });
    },

    logActivity: async (duration_min) => {
        const { patient, todayProgress } = get();
        if (!patient || !todayProgress) return;
        const newDuration = todayProgress.activity_min + duration_min;
        const updatedProgress = { ...todayProgress, activity_min: newDuration };
        set({ todayProgress: updatedProgress });
        const progressRef = doc(firestore, `patients/${patient.id}/dailyProgress`, todayProgress.date);
        await updateDoc(progressRef, { activity_min: newDuration });
    },

    logQuizCompleted: async () => {
        const { patient, todayProgress } = get();
        if (!patient || !todayProgress || todayProgress.quiz_completed) return;
        const updatedProgress = { ...todayProgress, quiz_completed: true };
        set({ todayProgress: updatedProgress });
        const progressRef = doc(firestore, `patients/${patient.id}/dailyProgress`, todayProgress.date);
        await updateDoc(progressRef, { quiz_completed: true });
    },
    
    markMessagesAsRead: async () => {
        const { patient, messages } = get();
        const unreadMessages = messages.filter(m => !m.read);
        if (!patient || unreadMessages.length === 0) return;

        const batch = writeBatch(firestore);
        unreadMessages.forEach(msg => {
            const msgRef = doc(firestore, `patients/${patient.id}/messages`, msg.id);
            batch.update(msgRef, { read: true });
        });
        await batch.commit();

        set(state => ({
            messages: state.messages.map(m => ({ ...m, read: true })),
            unreadMessagesCount: 0,
        }));
    }
}));