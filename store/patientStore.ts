import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { db } from '../services/db.ts';
import { 
    PatientProfile, UserProfile, Mesure, Repas, Injection, Food, FullBolusPayload, 
    Event, EventType, DailyProgress, Message, CircleMember, CircleMemberRole, CircleMemberRights, AuditLog
} from '../types.ts';
import { initialFoodData } from '../data/foodLibrary.ts';
import { DEFAULT_PATIENT_SETTINGS } from '../constants.ts';
import { 
    doc, getDoc, setDoc, updateDoc,
    collection, addDoc, query, where, getDocs, writeBatch, serverTimestamp, deleteDoc, orderBy, collectionGroup, limit
} from 'firebase/firestore';
import { firestore, functions, storage } from '../services/firebase.ts';
import { httpsCallable } from 'firebase/functions';
import { ref, getDownloadURL } from "firebase/storage";

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

  // For Patient Reports
  reportData: { summary: any; entries: (Mesure | Repas | Injection)[] };

  // For Doctor Dashboard
  doctorPatients: DoctorPatientData[];
  doctorViewedPatientId: string | null;
  doctorViewedPatientEntries: any[];

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
  respondToInvitation: (invitation: CircleMember, status: 'accepted' | 'refused') => Promise<void>;
  updateCircleMemberRights: (member: CircleMember, rights: CircleMemberRights) => Promise<void>;
  removeCircleMember: (member: CircleMember) => Promise<void>;
  getPendingInvitations: (userId: string) => Promise<CircleMember[]>;
  getInvitationDetails: (invitationId: string) => Promise<{ patientName: string; role: string; email: string; } | null>;

  // Doctor functions
  fetchDoctorPatients: (doctorId: string) => Promise<void>;
  loadSpecificPatientData: (patientId: string) => Promise<PatientProfile | null>;
  getMemberRightsForPatient: (patientId: string, memberId: string) => Promise<CircleMemberRights | null>;
  setDoctorViewedPatient: (patientId: string | null) => void;
  loadEntriesForDoctorView: (patientId: string) => Promise<void>;

  // Reports
  loadReportDataForDay: (dayId: string) => Promise<void>;
  exportPatientPdf: (range: { from: string, to: string }) => Promise<void>;

  // Progress, Messages, etc.
  logWater: (amount_ml: number) => Promise<void>;
  logActivity: (duration_min: number) => Promise<void>;
  logQuizCompleted: () => Promise<void>;
  markMessagesAsRead: () => Promise<void>;

  clearPatientData: () => void;
}

const dailySummary = httpsCallable(functions, 'dailySummary');
const exportPdf = httpsCallable(functions, 'exportPdf');


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
    reportData: { summary: null, entries: [] },
    doctorViewedPatientId: null,
    doctorViewedPatientEntries: [],
    
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
            
            const membersSnap = await getDocs(collection(firestore, 'patients', patientId, 'circleMembers'));
            const circleMembers = membersSnap.docs.map(d => ({ id: d.id, ...d.data() } as CircleMember));

            const entriesQuery = query(collection(firestore, 'entries'), where('uid', '==', patientId), orderBy('ts', 'desc'), limit(50));
            const entriesSnap = await getDocs(entriesQuery);

            const newMesures: Mesure[] = [];
            const newRepas: Repas[] = [];
            const newInjections: Injection[] = [];
            const newEvents: Event[] = [];

            entriesSnap.forEach(docSnap => {
                const entry = { id: docSnap.id, ...docSnap.data() };
                const { type, ts, value, meta, uid } = entry;
                
                switch(type) {
                    case 'glucose':
                        newMesures.push({
                            id: docSnap.id,
                            patient_id: uid,
                            ts,
                            gly: value,
                            cetone: meta?.cetone,
                            source: meta?.source || 'doigt',
                        });
                        break;
                    case 'meal':
                        newRepas.push({
                            id: docSnap.id,
                            patient_id: uid,
                            ts,
                            moment: meta?.moment,
                            items: meta?.items || [],
                            total_carbs_g: value,
                            note: meta?.note,
                        });
                        break;
                    case 'bolus':
                        newInjections.push({
                            id: docSnap.id,
                            patient_id: uid,
                            ts,
                            type: meta?.subType,
                            dose_U: value,
                            calc_details: meta?.calc_details,
                            lien_repas_id: meta?.lien_repas_id,
                            lien_mesure_id: meta?.lien_mesure_id,
                        });
                        break;
                    case 'note':
                    case 'activity':
                        newEvents.push({
                            id: docSnap.id,
                            patient_id: uid,
                            ts,
                            type: meta?.originalType || type, // Use original type if available
                            title: value,
                            description: meta?.description,
                            status: meta?.status || 'pending',
                        });
                        break;
                }
            });
            
            set({ patient: patientData, circleMembers, mesures: newMesures, repas: newRepas, injections: newInjections, events: newEvents, isLoading: false, loadStatus: 'success' });

        } catch (e: any) {
            console.error("Error loading patient data:", e);
            let errorMsg = "Erreur lors du chargement des données du patient.";
            if (e.code === 'permission-denied') {
                errorMsg = "Erreur de permission. Règles de sécurité ou index manquants? Détails: " + e.message;
                toast.error(errorMsg, { duration: 15000 });
            }
            set({ patient: null, isLoading: false, loadStatus: 'error', error: errorMsg });
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
                ...DEFAULT_PATIENT_SETTINGS,
                createdAt: serverTimestamp(),
            };
            batch.set(doc(firestore, 'patients', patientId), newPatientProfile);

            const ownerMemberRef = doc(firestore, 'patients', patientId, 'circleMembers', user.uid);
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

        const userQuery = query(collection(firestore, 'users'), where('email', '==', email));
        const userSnap = await getDocs(userQuery);
        if (userSnap.empty) {
            throw new Error("Aucun utilisateur trouvé avec cet email.");
        }
        const memberUser = userSnap.docs[0].data() as UserProfile;

        const batch = writeBatch(firestore);
        const memberRef = doc(firestore, 'patients', patient.id, 'circleMembers', memberUser.uid);
        
        const existingDoc = await getDoc(memberRef); // Check must be done before batch
        if (existingDoc.exists()) {
            throw new Error("Cette personne est déjà dans votre cercle ou a une invitation en attente.");
        }
        
        const newCircleMemberData: Omit<CircleMember, 'id'> = {
            patientId: patient.id,
            patientName: `${patient.prenom} ${patient.nom}`,
            memberUserId: memberUser.uid,
            memberEmail: email,
            role,
            rights,
            status: 'pending',
            invitedAt: serverTimestamp(),
        };

        // 1. Write to subcollection
        batch.set(memberRef, newCircleMemberData);

        // 2. Write to top-level invitations collection for easy querying
        const invitationRef = doc(collection(firestore, 'invitations'));
        batch.set(invitationRef, newCircleMemberData);

        await batch.commit();
        
        const finalCircleMember: CircleMember = { id: memberRef.id, ...newCircleMemberData as any };
        set(state => ({ circleMembers: [...state.circleMembers, finalCircleMember] }));
    },

    respondToInvitation: async (invitation, status) => {
        const batch = writeBatch(firestore);
    
        // 1. Update the document in the subcollection
        const memberRef = doc(firestore, 'patients', invitation.patientId, 'circleMembers', invitation.memberUserId);
        batch.update(memberRef, { status, respondedAt: serverTimestamp() });
        
        // 2. Delete the document from the top-level invitations collection
        const q = query(collection(firestore, 'invitations'), 
            where('memberUserId', '==', invitation.memberUserId),
            where('patientId', '==', invitation.patientId)
        );
        const inviteSnap = await getDocs(q);
        inviteSnap.forEach(doc => {
            batch.delete(doc.ref);
        });
    
        await batch.commit();
    
        await get().fetchDoctorPatients(invitation.memberUserId); // Refresh doctor's list
    },

    updateCircleMemberRights: async (member, rights) => {
        const memberRef = doc(firestore, 'patients', member.patientId, 'circleMembers', member.memberUserId);
        await updateDoc(memberRef, { rights });
        set(state => ({
            circleMembers: state.circleMembers.map(m => m.id === member.id ? { ...m, rights } : m)
        }));
        toast.success("Permissions mises à jour.");
    },
    
    removeCircleMember: async (member) => {
        const batch = writeBatch(firestore);
    
        const memberRef = doc(firestore, 'patients', member.patientId, 'circleMembers', member.memberUserId);
        batch.delete(memberRef);
        
        // If it was a pending invitation, delete from top-level collection too
        if (member.status === 'pending') {
            const q = query(collection(firestore, 'invitations'), 
                where('memberUserId', '==', member.memberUserId),
                where('patientId', '==', member.patientId)
            );
            const inviteSnap = await getDocs(q);
            inviteSnap.forEach(doc => {
                batch.delete(doc.ref);
            });
        }
        
        await batch.commit();
        
        set(state => ({
            circleMembers: state.circleMembers.filter(m => m.id !== member.id)
        }));
        toast.success("Membre retiré du cercle.");
    },
    
    getPendingInvitations: async (userId: string) => {
        try {
            // FIX: Query the top-level 'invitations' collection to avoid collection group permission issues.
            const q = query(collection(firestore, 'invitations'), where('memberUserId', '==', userId));
            const snap = await getDocs(q);
            // The document data should be compatible with the CircleMember type.
            return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as CircleMember));
        } catch (e: any) {
            console.error("Error getting pending invitations:", e);
            let errorMsg = "Erreur lors de la récupération des invitations.";
            if (e.code === 'permission-denied') {
                errorMsg = "Erreur de permission en cherchant les invitations. Les règles de sécurité ou les index Firestore sont probablement manquants. Détails: " + e.message;
            }
            toast.error(errorMsg, { duration: 15000 });
            set({ error: errorMsg });
            return [];
        }
    },

    getInvitationDetails: async (invitationId: string) => { // FIX: Changed signature to accept a single invitationId
        try {
            // FIX: Read from the top-level 'invitations' collection
            const inviteRef = doc(firestore, 'invitations', invitationId);
            const inviteSnap = await getDoc(inviteRef);
            if (inviteSnap.exists()) {
                const data = inviteSnap.data() as CircleMember;
                // An invitation exists only if it's pending.
                return {
                    patientName: data.patientName,
                    role: data.role,
                    email: data.memberEmail,
                };
            }
        } catch (error) {
            console.error("Error getting invitation details:", error);
        }
        return null;
    },

    fetchDoctorPatients: async (doctorId: string) => {
        set({ isLoading: true, error: null });
        try {
            const q = query(collectionGroup(firestore, 'circleMembers'), where('memberUserId', '==', doctorId));
            const membersSnap = await getDocs(q);
            
            const patientDataPromises = membersSnap.docs.map(async (memberDoc) => {
                const member = { id: memberDoc.id, ...memberDoc.data() } as CircleMember;
                const patientSnap = await getDoc(doc(firestore, 'patients', member.patientId));
                if (patientSnap.exists()) {
                    return { member, patient: { id: patientSnap.id, ...patientSnap.data() } as PatientProfile };
                }
                return null;
            });
    
            // FIX: Removed redundant `Promise.all` call which was causing a TypeScript error. The `patientDataPromises` array was being wrapped in an extra `Promise.all` unnecessarily.
            const doctorPatients = (await Promise.all(patientDataPromises)).filter(Boolean) as DoctorPatientData[];
            set({ doctorPatients, isLoading: false });
        } catch (e: any) {
            console.error("Error fetching doctor's patients:", e);
            let errorMsg = "Erreur lors de la récupération des patients.";
            if (e.code === 'permission-denied') {
                errorMsg = "Erreur de permission : les règles de sécurité ou les index Firestore sont probablement manquants. Veuillez déployer les index et rafraîchir la page. Détails: " + e.message;
                toast.error(errorMsg, { duration: 15000 });
            }
            set({ isLoading: false, error: errorMsg, doctorPatients: [] });
        }
    },

    loadSpecificPatientData: async (patientId) => {
        const patientSnap = await getDoc(doc(firestore, 'patients', patientId));
        return patientSnap.exists() ? { id: patientSnap.id, ...patientSnap.data() } as PatientProfile : null;
    },

    getMemberRightsForPatient: async (patientId, memberId) => {
        const memberRef = doc(firestore, 'patients', patientId, 'circleMembers', memberId);
        const memberSnap = await getDoc(memberRef);
        if (memberSnap.exists()) {
            const memberData = memberSnap.data() as CircleMember;
            if (memberData.status === 'accepted') {
                return memberData.rights;
            }
        }
        return null;
    },
    
    setDoctorViewedPatient: (patientId) => set({ doctorViewedPatientId: patientId }),
    
    loadEntriesForDoctorView: async (patientId: string) => {
        set({ isLoading: true, doctorViewedPatientEntries: [], error: null });
        try {
            const entriesQuery = query(collection(firestore, 'entries'), where('uid', '==', patientId), orderBy('ts', 'desc'), limit(100));
            const entriesSnap = await getDocs(entriesQuery);
            
            const dayMesures: Mesure[] = [];
            const dayRepas: Repas[] = [];
            const dayInjections: Injection[] = [];
            
            entriesSnap.forEach(docSnap => {
                const entry = { id: docSnap.id, ...docSnap.data() };
                const { type, ts, value, meta, uid } = entry;
                switch(type) {
                    case 'glucose': dayMesures.push({ id: docSnap.id, patient_id: uid, ts, gly: value, source: meta?.source || 'doigt', cetone: meta?.cetone }); break;
                    case 'meal': dayRepas.push({ id: docSnap.id, patient_id: uid, ts, moment: meta?.moment, items: meta?.items || [], total_carbs_g: value, note: meta?.note }); break;
                    case 'bolus': dayInjections.push({ id: docSnap.id, patient_id: uid, ts, type: meta?.subType, dose_U: value, calc_details: meta?.calc_details, lien_repas_id: meta?.lien_repas_id, lien_mesure_id: meta?.lien_mesure_id }); break;
                }
            });
    
            let processedMesureIds = new Set<string>();
            let processedInjectionIds = new Set<string>();
            
            const mealGroups = dayRepas.map(r => {
              const injection = dayInjections.find(i => i.lien_repas_id === r.id);
              const mesure = injection ? dayMesures.find(m => m.id === injection.lien_mesure_id) : undefined;
              if (injection) processedInjectionIds.add(injection.id);
              if (mesure) processedMesureIds.add(mesure.id);
              return { type: 'mealgroup', ts: r.ts, id: r.id, data: { repas: r, injection, mesure } };
            });
    
            const standaloneInjections = dayInjections.filter(i => !processedInjectionIds.has(i.id)).map(injection => {
              const mesure = dayMesures.find(m => m.id === injection.lien_mesure_id);
              if(mesure) processedMesureIds.add(mesure.id);
              return { type: 'mealgroup', id: injection.id, ts: injection.ts, data: { injection, mesure } };
            });
    
            const standaloneMesures = dayMesures.filter(m => !processedMesureIds.has(m.id)).map(mesure => ({ type: 'mealgroup', id: mesure.id, ts: mesure.ts, data: { mesure } }));
    
            const timelineItems = [...mealGroups, ...standaloneInjections, ...standaloneMesures].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
    
            set({ doctorViewedPatientEntries: timelineItems, isLoading: false });
    
        } catch (e: any) {
            console.error("Error loading entries for doctor view:", e);
            let errorMsg = "Erreur lors du chargement du journal du patient.";
            if (e.code === 'permission-denied') {
                errorMsg = "Erreur de permission. Règles de sécurité ou index manquants? Détails: " + e.message;
                toast.error(errorMsg, { duration: 15000 });
            }
            set({ isLoading: false, error: errorMsg });
        }
    },

    addMesure: async (mesureData, ts) => {
        const patient = get().patient;
        if (!patient) return;
        
        const payload = {
            uid: patient.id,
            dayId: ts.split('T')[0],
            type: 'glucose',
            ts,
            value: mesureData.gly,
            unit: patient.cibles.unit,
            meta: {
                cetone: mesureData.cetone,
                source: mesureData.source,
            },
        };

        const docRef = await addDoc(collection(firestore, 'entries'), payload);
        const newMesure: Mesure = { ...mesureData, patient_id: patient.id, ts, id: docRef.id };
        set(state => ({ mesures: [newMesure, ...state.mesures].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()) }));
    },

    addRepas: async (repasData, ts) => {
        const patient = get().patient;
        if (!patient) return;

        const payload = {
            uid: patient.id,
            dayId: ts.split('T')[0],
            type: 'meal',
            ts,
            value: repasData.total_carbs_g,
            unit: 'g',
            meta: {
                moment: repasData.moment,
                items: repasData.items,
                note: repasData.note,
            },
        };
        const docRef = await addDoc(collection(firestore, 'entries'), payload);
        const newRepas: Repas = { ...repasData, patient_id: patient.id, ts, id: docRef.id };
        set(state => ({ repas: [newRepas, ...state.repas].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()) }));
    },

    addInjection: async (injectionData, ts) => {
        const patient = get().patient;
        if (!patient) return;

        const payload = {
            uid: patient.id,
            dayId: ts.split('T')[0],
            type: 'bolus',
            ts,
            value: injectionData.dose_U,
            unit: 'U',
            meta: {
                subType: injectionData.type,
                calc_details: injectionData.calc_details,
                lien_repas_id: injectionData.lien_repas_id,
                lien_mesure_id: injectionData.lien_mesure_id,
            },
        };
        const docRef = await addDoc(collection(firestore, 'entries'), payload);
        const newInjection: Injection = { ...injectionData, patient_id: patient.id, ts, id: docRef.id };
        set(state => ({ injections: [newInjection, ...state.injections].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()) }));
    },

    addFullBolus: async (payload, ts) => {
        const patient = get().patient;
        if (!patient) return;

        const batch = writeBatch(firestore);
        const dayId = ts.split('T')[0];

        // 1. Mesure
        const mesureRef = doc(collection(firestore, 'entries'));
        const mesurePayload = {
            uid: patient.id,
            dayId,
            type: 'glucose',
            ts,
            value: payload.mesure.gly,
            unit: patient.cibles.unit,
            meta: { source: payload.mesure.source, cetone: payload.mesure.cetone }
        };
        batch.set(mesureRef, mesurePayload);

        // 2. Repas
        const repasRef = doc(collection(firestore, 'entries'));
        const repasPayload = {
            uid: patient.id,
            dayId,
            type: 'meal',
            ts,
            value: payload.repas.total_carbs_g,
            unit: 'g',
            meta: { moment: payload.repas.moment, items: payload.repas.items, note: payload.repas.note }
        };
        batch.set(repasRef, repasPayload);

        // 3. Injection
        const injectionRef = doc(collection(firestore, 'entries'));
        const injectionPayload = {
            uid: patient.id,
            dayId,
            type: 'bolus',
            ts,
            value: payload.injection.dose_U,
            unit: 'U',
            meta: {
                subType: payload.injection.type,
                calc_details: payload.injection.calc_details,
                lien_repas_id: repasRef.id,
                lien_mesure_id: mesureRef.id,
            }
        };
        batch.set(injectionRef, injectionPayload);
        
        await batch.commit();

        // After an atomic operation, reload data to ensure consistency
        const user = get().patient as unknown as UserProfile;
        if(user) await get().loadPatientData(user);
    },

    getLastCorrection: async () => {
        const patient = get().patient;
        if (!patient) return null;
        const q = query(
            collection(firestore, 'entries'), 
            where('uid', '==', patient.id),
            where('type', '==', 'bolus'),
            where('meta.subType', '==', 'correction'),
            orderBy('ts', 'desc'),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            return {
                id: doc.id,
                patient_id: data.uid,
                ts: data.ts,
                type: data.meta.subType,
                dose_U: data.value,
                calc_details: data.meta.calc_details,
                lien_mesure_id: data.meta.lien_mesure_id,
                lien_repas_id: data.meta.lien_repas_id,
            } as Injection;
        }
        return null;
    },

    addEvent: async (eventData) => {
        const patient = get().patient;
        if (!patient) return;
        
        let entryType: 'note' | 'activity' = 'note';
        if (eventData.type === 'activity') entryType = 'activity';

        const payload = {
            uid: patient.id,
            dayId: eventData.ts.split('T')[0],
            type: entryType,
            ts: eventData.ts,
            value: eventData.title,
            meta: {
                description: eventData.description,
                status: 'pending',
                originalType: eventData.type,
            },
        };
        const docRef = await addDoc(collection(firestore, 'entries'), payload);
        const newEvent: Event = { ...eventData, patient_id: patient.id, status: 'pending', id: docRef.id };
        set(state => ({ events: [newEvent, ...state.events].sort((a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())}));
    },

    updateEventStatus: async (eventId, status) => {
        const patient = get().patient;
        if (!patient) return;
    
        const eventRef = doc(firestore, 'entries', eventId);
        await updateDoc(eventRef, { 'meta.status': status });
    
        set(state => ({
            events: state.events.map(e => e.id === eventId ? { ...e, status } : e)
        }));
    },

    loadReportDataForDay: async (dayId) => {
        const patient = get().patient;
        if (!patient) return;
        set(state => ({ reportData: { ...state.reportData, summary: null, entries: [] }, isLoading: true, error: null }));
        
        try {
            const summaryResult: any = await dailySummary({ dayId });
            
            const dayEntriesRef = collection(firestore, 'entries');
            const q = query(dayEntriesRef, where('uid', '==', patient.id), where('dayId', '==', dayId), orderBy('ts', 'asc'));
            const entriesSnap = await getDocs(q);
            
            const entries: (Mesure | Repas | Injection)[] = [];
            entriesSnap.forEach(doc => {
                const data = doc.data();
                if (data.type === 'glucose') entries.push({ id: doc.id, ...data, type: 'mesure' } as unknown as Mesure);
                if (data.type === 'meal') entries.push({ id: doc.id, ...data, type: 'repas' } as unknown as Repas);
                if (data.type === 'bolus') entries.push({ id: doc.id, ...data, type: 'injection' } as unknown as Injection);
            });
    
            set({ reportData: { summary: summaryResult.data, entries }, isLoading: false });
        } catch (e: any) {
            console.error("Error loading report data:", e);
            let errorMsg = "Erreur lors du chargement des données du rapport.";
            if (e.code === 'permission-denied') {
                errorMsg = "Erreur de permission. Règles de sécurité ou index manquants? Détails: " + e.message;
                toast.error(errorMsg, { duration: 15000 });
            }
            set({ isLoading: false, error: errorMsg });
        }
    },

    exportPatientPdf: async (range) => {
        const patient = get().patient;
        if (!patient) return;
        try {
            const result: any = await exportPdf({ uid: patient.id, ...range });
            const url = await getDownloadURL(ref(storage, result.data.path));
            window.open(url, '_blank');
            toast.success("Rapport PDF généré !");
        } catch (e: any) {
            console.error(e);
            toast.error("Erreur lors de la génération du PDF.");
        }
    },

    addOrUpdateFood: async (food) => {
        await db.foodLibrary.put(food);
        const foodLibrary = await db.foodLibrary.toArray();
        set({ foodLibrary });
    },
    logWater: async (amount_ml: number) => {
        // Implementation needed
    },
    logActivity: async (duration_min: number) => {
        // Implementation needed
    },
    logQuizCompleted: async () => {
        // Implementation needed
    },
    markMessagesAsRead: async () => {
        // Implementation needed
    },
}));