import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { db } from '../services/db.ts';
import { 
    PatientProfile, UserProfile, Mesure, Repas, Injection, Food, FullBolusPayload, 
    Event, DailyProgress, Message, CircleMember, CircleMemberRole, CircleMemberRights, AuditLog
} from '../types.ts';
import { initialFoodData } from '../data/foodLibrary.ts';
import { DEFAULT_PATIENT_SETTINGS } from '../constants.ts';
import { 
    doc, getDoc, setDoc, updateDoc,
    collection, addDoc, query, where, getDocs, writeBatch, serverTimestamp, deleteDoc, orderBy
} from 'firebase/firestore';
import { firestore } from '../services/firebase.ts';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

type LoadStatus = 'idle' | 'loading' | 'success' | 'not_found' | 'error';

interface DoctorPatientData {
    member: CircleMember;
    patient: PatientProfile;
}

interface PatientState {
  patient: PatientProfile | null;
  circleMembers: CircleMember[];
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
  loadStatus: LoadStatus;

  // For Doctor Dashboard
  doctorPatients: DoctorPatientData[];

  // Actions
  loadPatientData: (user: UserProfile) => Promise<void>;
  createPatientProfile: (naissance: string, user: UserProfile) => Promise<void>;
  updatePatientProfile: (updatedData: Partial<PatientProfile>) => Promise<void>;
  
  // Data logging
  addMesure: (mesureData: Omit<Mesure, 'id' | 'patient_id' | 'ts'>, ts: string) => Promise<void>;
  addRepas: (repasData: Omit<Repas, 'id' | 'patient_id' | 'ts'>, ts: string) => Promise<void>;
  addInjection: (injectionData: Omit<Injection, 'id' | 'patient_id' | 'ts'>, ts: string) => Promise<void>;
  addFullBolus: (payload: FullBolusPayload, ts: string) => Promise<void>;
  getLastCorrection: () => Promise<Injection | null>;

  // Events
  addEvent: (eventData: Omit<Event, 'id' | 'patient_id' | 'status'>) => Promise<void>;
  updateEventStatus: (eventId: string, status: 'pending' | 'completed') => Promise<void>;

  // Food Library
  addOrUpdateFood: (food: Food) => Promise<void>;
  
  // Circle of Care
  inviteToCircle: (email: string, role: CircleMemberRole, rights: CircleMemberRights) => Promise<void>;
  respondToInvitation: (invitationId: string, status: 'accepted' | 'refused', memberUserId: string) => Promise<void>;
  updateCircleMemberRights: (memberId: string, rights: CircleMemberRights) => Promise<void>;
  removeCircleMember: (member: CircleMember) => Promise<void>;
  getPendingInvitations: (email: string) => Promise<CircleMember[]>;
  getInvitationDetails: (inviteId: string) => Promise<{ patientName: string; role: string; email: string; } | null>;

  // Doctor functions
  fetchDoctorPatients: (doctorId: string) => Promise<void>;
  loadSpecificPatientData: (patientId: string) => Promise<PatientProfile | null>;
  getMemberRightsForPatient: (patientId: string, memberId: string) => Promise<CircleMemberRights | null>;


  // Progress, Messages, etc.
  logWater: (amount_ml: number) => Promise<void>;
  logActivity: (duration_min: number) => Promise<void>;
  logQuizCompleted: () => Promise<void>;
  markMessagesAsRead: () => Promise<void>;

  clearPatientData: () => void;
}

export const usePatientStore = create<PatientState>((set, get) => ({
    patient: null,
    circleMembers: [],
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
    loadStatus: 'idle',
    doctorPatients: [],
    
    clearPatientData: () => set({
        patient: null, circleMembers: [], mesures: [], repas: [], injections: [], events: [],
        messages: [], unreadMessagesCount: 0, todayProgress: null, isLoading: false,
        error: null, loadStatus: 'idle', doctorPatients: [],
    }),

    loadPatientData: async (user: UserProfile) => {
        if (!user || user.role !== 'patient') return;
        set({ isLoading: true, loadStatus: 'loading', error: null });

        try {
            const patientId = user.uid;
            const patientRef = doc(firestore, 'patients', patientId);
            const patientSnap = await getDoc(patientRef);

            if (!patientSnap.exists()) {
                set({ patient: null, isLoading: false, loadStatus: 'not_found' });
                return;
            }

            const patientData = { id: patientSnap.id, ...patientSnap.data() } as PatientProfile;
            
            const [membersSnap, mesuresSnap, repasSnap, injectionsSnap, eventsSnap] = await Promise.all([
                getDocs(query(collection(firestore, 'circleMembers'), where('patientId', '==', patientId))),
                getDocs(query(collection(firestore, `patients/${patientId}/mesures`), orderBy('ts', 'desc'))),
                getDocs(query(collection(firestore, `patients/${patientId}/repas`), orderBy('ts', 'desc'))),
                getDocs(query(collection(firestore, `patients/${patientId}/injections`), orderBy('ts', 'desc'))),
                getDocs(query(collection(firestore, `patients/${patientId}/events`), orderBy('ts', 'desc'))),
            ]);

            const circleMembers = membersSnap.docs.map(d => ({ id: d.id, ...d.data() } as CircleMember));
            const mesures = mesuresSnap.docs.map(d => ({ id: d.id, ...d.data() } as Mesure));
            const repas = repasSnap.docs.map(d => ({ id: d.id, ...d.data() } as Repas));
            const injections = injectionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Injection));
            const events = eventsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Event));
            
            set({ patient: patientData, circleMembers, mesures, repas, injections, events, isLoading: false, loadStatus: 'success' });

        } catch (e: any) {
            console.error("Error loading patient data:", e);
            set({ patient: null, isLoading: false, loadStatus: 'error', error: e.message });
        }
    },

    createPatientProfile: async (naissance: string, user: UserProfile) => {
        set({ isLoading: true, loadStatus: 'loading' });
        const patientId = user.uid;
        try {
            const batch = writeBatch(firestore);

            const newPatientProfile: PatientProfile = {
                id: patientId,
                userUid: user.uid,
                prenom: user.prenom,
                nom: user.nom,
                naissance,
                ...DEFAULT_PATIENT_SETTINGS
            };
            batch.set(doc(firestore, 'patients', patientId), newPatientProfile);

            const ownerMemberRef = doc(collection(firestore, 'circleMembers'));
            const ownerMember: CircleMember = {
                id: ownerMemberRef.id,
                patientId,
                patientName: `${user.prenom} ${user.nom}`,
                memberUserId: user.uid,
                memberEmail: user.email!,
                role: 'owner',
                rights: { read: true, write: true, alerts: true },
                status: 'accepted',
                invitedAt: serverTimestamp(),
                respondedAt: serverTimestamp(),
            };
            batch.set(ownerMemberRef, ownerMember);

            await batch.commit();
            await get().loadPatientData(user); // Reload all data
            
        } catch (e: any) {
            console.error("Error creating patient profile:", e);
            toast.error("Erreur lors de la création du profil.");
            set({ isLoading: false, loadStatus: 'error', error: e.message });
        }
    },

    updatePatientProfile: async (updatedData: Partial<PatientProfile>) => {
        const patient = get().patient;
        if (!patient) return;
    
        const patientRef = doc(firestore, 'patients', patient.id);
        await updateDoc(patientRef, updatedData);
    
        set(state => ({
            patient: state.patient ? { ...state.patient, ...updatedData } : null
        }));
        toast.success("Profil mis à jour.");
    },

    inviteToCircle: async (email, role, rights) => {
        const patient = get().patient;
        if (!patient) return;

        // Check if user exists
        const userQuery = query(collection(firestore, 'users'), where('email', '==', email));
        const userSnap = await getDocs(userQuery);
        if (userSnap.empty) {
            throw new Error("Aucun utilisateur trouvé avec cet email.");
        }
        const memberUser = userSnap.docs[0].data() as UserProfile;

        const inviteRef = doc(collection(firestore, 'circleMembers'));
        const newInvite: CircleMember = {
            id: inviteRef.id,
            patientId: patient.id,
            patientName: `${patient.prenom} ${patient.nom}`,
            memberUserId: memberUser.uid,
            memberEmail: email,
            role,
            rights,
            status: 'pending',
            invitedAt: serverTimestamp(),
        };
        await setDoc(inviteRef, newInvite);

        set(state => ({ circleMembers: [...state.circleMembers, { ...newInvite, id: inviteRef.id }] }));
    },

    respondToInvitation: async (invitationId, status, memberUserId) => {
        const memberRef = doc(firestore, 'circleMembers', invitationId);
        await updateDoc(memberRef, { status, respondedAt: serverTimestamp() });
        await get().fetchDoctorPatients(memberUserId); // Refresh doctor's list
    },

    updateCircleMemberRights: async (memberId, rights) => {
        const memberRef = doc(firestore, 'circleMembers', memberId);
        await updateDoc(memberRef, { rights });
        set(state => ({
            circleMembers: state.circleMembers.map(m => m.id === memberId ? { ...m, rights } : m)
        }));
        toast.success("Permissions mises à jour.");
    },
    
    removeCircleMember: async (member) => {
        const memberRef = doc(firestore, 'circleMembers', member.id);
        await deleteDoc(memberRef);
        set(state => ({
            circleMembers: state.circleMembers.filter(m => m.id !== member.id)
        }));
        toast.success("Membre retiré du cercle.");
    },
    
    getPendingInvitations: async (email) => {
        const q = query(collection(firestore, 'circleMembers'), where('memberEmail', '==', email), where('status', '==', 'pending'));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CircleMember));
    },

    getInvitationDetails: async (inviteId: string) => {
        const inviteRef = doc(firestore, 'circleMembers', inviteId);
        const inviteSnap = await getDoc(inviteRef);
        if (inviteSnap.exists()) {
            const data = inviteSnap.data() as CircleMember;
            if (data.status === 'pending') {
                return {
                    patientName: data.patientName,
                    role: data.role,
                    email: data.memberEmail,
                };
            }
        }
        return null;
    },

    fetchDoctorPatients: async (doctorId: string) => {
        set({ isLoading: true });
        const q = query(collection(firestore, 'circleMembers'), where('memberUserId', '==', doctorId));
        const membersSnap = await getDocs(q);
        
        const patientDataPromises = membersSnap.docs.map(async (memberDoc) => {
            const member = { id: memberDoc.id, ...memberDoc.data() } as CircleMember;
            const patientSnap = await getDoc(doc(firestore, 'patients', member.patientId));
            if (patientSnap.exists()) {
                return { member, patient: patientSnap.data() as PatientProfile };
            }
            return null;
        });

        const doctorPatients = (await Promise.all(patientDataPromises)).filter(Boolean) as DoctorPatientData[];
        set({ doctorPatients, isLoading: false });
    },

    loadSpecificPatientData: async (patientId) => {
        // This is a simplified loader for a doctor viewing a patient's data.
        // It does not populate the main store to avoid conflicts.
        const patientSnap = await getDoc(doc(firestore, 'patients', patientId));
        return patientSnap.exists() ? patientSnap.data() as PatientProfile : null;
    },

    getMemberRightsForPatient: async (patientId, memberId) => {
        const q = query(collection(firestore, 'circleMembers'), where('patientId', '==', patientId), where('memberUserId', '==', memberId), where('status', '==', 'accepted'));
        const snap = await getDocs(q);
        if (!snap.empty) {
            return (snap.docs[0].data() as CircleMember).rights;
        }
        return null;
    },


    // --- Other functions (unchanged for brevity, but would need updates for new patientId logic) ---
    addMesure: async (mesureData, ts) => {
        const patient = get().patient;
        if (!patient) return;
        const newMesure: Omit<Mesure, 'id'> = { ...mesureData, patient_id: patient.id, ts };
        const docRef = await addDoc(collection(firestore, `patients/${patient.id}/mesures`), newMesure);
        set(state => ({ mesures: [{...newMesure, id: docRef.id}, ...state.mesures] }));
    },
    addRepas: async (repasData, ts) => {
        const patient = get().patient;
        if (!patient) return;
        const newRepas: Omit<Repas, 'id'> = { ...repasData, patient_id: patient.id, ts };
        const docRef = await addDoc(collection(firestore, `patients/${patient.id}/repas`), newRepas);
        set(state => ({ repas: [{...newRepas, id: docRef.id}, ...state.repas] }));
    },
    addInjection: async (injectionData, ts) => {
        const patient = get().patient;
        if (!patient) return;
        const newInjection: Omit<Injection, 'id'> = { ...injectionData, patient_id: patient.id, ts };
        const docRef = await addDoc(collection(firestore, `patients/${patient.id}/injections`), newInjection);
        set(state => ({ injections: [{...newInjection, id: docRef.id}, ...state.injections] }));
    },
    addFullBolus: async (payload, ts) => {
        const patient = get().patient;
        if (!patient) return;
        const batch = writeBatch(firestore);
        const mesureRef = doc(collection(firestore, `patients/${patient.id}/mesures`));
        const repasRef = doc(collection(firestore, `patients/${patient.id}/repas`));
        const injectionRef = doc(collection(firestore, `patients/${patient.id}/injections`));
        batch.set(mesureRef, { ...payload.mesure, patient_id: patient.id, ts });
        batch.set(repasRef, { ...payload.repas, patient_id: patient.id, ts });
        batch.set(injectionRef, { ...payload.injection, patient_id: patient.id, ts, lien_mesure_id: mesureRef.id, lien_repas_id: repasRef.id });
        await batch.commit();
        await get().loadPatientData(patient as unknown as UserProfile);
    },
    getLastCorrection: async () => {
        const patient = get().patient;
        if (!patient) return null;
        const q = query(collection(firestore, `patients/${patient.id}/injections`), where('type', '==', 'correction'), orderBy('ts', 'desc'), where('ts', '<', new Date().toISOString()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Injection;
        }
        return null;
    },
    addEvent: async (eventData) => {
        const patient = get().patient;
        if (!patient) return;
        const newEvent: Omit<Event, 'id'> = { ...eventData, patient_id: patient.id, status: 'pending' };
        const docRef = await addDoc(collection(firestore, `patients/${patient.id}/events`), newEvent);
        set(state => ({ events: [{...newEvent, id: docRef.id}, ...state.events].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())}));
    },
    updateEventStatus: async (eventId, status) => {
        const patient = get().patient;
        if (!patient) return;
    
        const eventRef = doc(firestore, `patients/${patient.id}/events`, eventId);
        await updateDoc(eventRef, { status });
    
        set(state => ({
            events: state.events.map(e => e.id === eventId ? { ...e, status } : e)
        }));
    },
    addOrUpdateFood: async (food) => {
        await db.foodLibrary.put(food);
        const foodLibrary = await db.foodLibrary.toArray();
        set({ foodLibrary });
    },
    logWater: async (amount_ml) => {
        // Implementation needed
    },
    logActivity: async (duration_min) => {
        // Implementation needed
    },
    logQuizCompleted: async () => {
        // Implementation needed
    },
    markMessagesAsRead: async () => {
        // Implementation needed
    },
}));