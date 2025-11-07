import { create } from 'zustand';
import toast from 'react-hot-toast';
import { auth, firestore } from '../services/firebase.ts';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types.ts';
import { usePatientStore } from './patientStore.ts';

type UserStatus = 'loading' | 'needs_role' | 'needs_patient_profile' | 'ready' | 'idle';

interface AuthState {
  firebaseUser: import('firebase/auth').User | null;
  userProfile: UserProfile | null;
  status: UserStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginAttemptEmail: string | null;
  clearError: () => void;
  signup: (nom: string, prenom: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  initializeAuth: () => () => void;
  setUserRole: (role: UserRole) => Promise<void>;
}

const formatAuthError = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/invalid-email': return 'Adresse e-mail invalide.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': return 'Email ou mot de passe incorrect.';
        case 'auth/email-already-in-use': return 'Cette adresse e-mail est déjà utilisée.';
        case 'auth/weak-password': return 'Le mot de passe doit comporter au moins 6 caractères.';
        default:
            console.error('Unhandled Firebase Auth Error:', errorCode);
            return "Une erreur d'authentification est survenue.";
    }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  firebaseUser: null,
  userProfile: null,
  status: 'idle',
  isAuthenticated: false,
  isLoading: true,
  error: null,
  loginAttemptEmail: null,
  clearError: () => set({ error: null, loginAttemptEmail: null }),

  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          set({ firebaseUser: user, isAuthenticated: true, error: null, status: 'loading' });
          const userRef = doc(firestore, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
              const userProfile = userSnap.data() as UserProfile;
              set({ userProfile });

              if(userProfile.role === 'undetermined') {
                  set({ status: 'needs_role' });
              } else if (userProfile.role === 'patient') {
                  const patientRef = doc(firestore, 'patients', user.uid);
                  const patientSnap = await getDoc(patientRef);
                  if (patientSnap.exists()) {
                      // Fire-and-forget data loading. The UI will handle the loading state.
                      usePatientStore.getState().loadPatientData(userProfile);
                      set({ status: 'ready' });
                  } else {
                      set({ status: 'needs_patient_profile' });
                  }
              } else { // Doctor, family, etc.
                  set({ status: 'ready' });
              }
          } else {
            console.warn("User authenticated but profile document not found. Assuming new user, directing to role selection.");
            const tempProfile: UserProfile = {
                uid: user.uid,
                email: user.email,
                nom: '', 
                prenom: '',
                role: 'undetermined',
            };
            set({ userProfile: tempProfile, status: 'needs_role' });
          }
        } else {
          usePatientStore.getState().clearPatientData();
          set({ firebaseUser: null, userProfile: null, isAuthenticated: false, error: null, status: 'ready' });
        }
      } catch (e: any) {
        let errorMessage = "Une erreur critique est survenue. Veuillez vous reconnecter.";
        if (e.code === 'permission-denied') {
            console.error("CRITICAL: Firestore permission denied during auth state change. This is likely due to misconfigured security rules or missing indexes.", e);
            errorMessage = "Erreur de permissions. Vérifiez la configuration Firebase.";
        } else {
            console.error("CRITICAL: Unhandled error in onAuthStateChanged. Logging out.", e);
        }
        
        toast.error(errorMessage);
        await signOut(auth);
        usePatientStore.getState().clearPatientData();
        set({
            firebaseUser: null, userProfile: null, isAuthenticated: false,
            error: "A critical error occurred while loading your profile.",
            status: 'ready',
        });
      } finally {
        set({ isLoading: false });
      }
    }, (error) => {
      console.error("Auth state listener error:", error);
      set({ firebaseUser: null, userProfile: null, isAuthenticated: false, isLoading: false, error: "Auth initialization failed.", status: 'ready' });
    });
    return unsubscribe;
  },

  signup: async (nom, prenom, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUserProfile: UserProfile = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          nom,
          prenom,
          role: 'undetermined',
      };
      await setDoc(doc(firestore, 'users', userCredential.user.uid), newUserProfile);
      // onAuthStateChanged will handle the rest of the flow
    } catch (error: any) {
      // If user already exists, set an error for the UI to handle (e.g., show modal)
      if (error.code === 'auth/email-already-in-use') {
        set({ error: error.code, isLoading: false });
        return; // Don't toast, let the modal handle it
      }
      // Handle other signup errors
      const errorMessage = formatAuthError(error.code);
      set({ error: error.code, isLoading: false });
      toast.error(errorMessage);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged handles success. No state change needed here.
    } catch (error: any) {
      // 'auth/invalid-credential' is a generic error for both user-not-found and wrong-password.
      // We will show a generic message and let the user decide the next step.
      // This avoids the confusing redirect loop.
      const errorMessage = formatAuthError(error.code);
      set({ error: error.code, isLoading: false });
      toast.error(errorMessage);
    }
  },

  logout: async () => {
    await signOut(auth);
  },
  
  setUserRole: async (role: UserRole) => {
      const user = get().userProfile;
      if (!user) return;
      
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, { role });
      
      const updatedProfile = { ...user, role };
      set({ userProfile: updatedProfile });

      if (role === 'patient') {
          set({ status: 'needs_patient_profile' });
      } else {
          set({ status: 'ready' });
      }
  },

  resetPassword: async (email: string): Promise<boolean> => {
    set({ error: null });
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error: any) {
      const errorMessage = formatAuthError(error.code);
      set({ error: error.code });
      toast.error(errorMessage);
      return false;
    }
  },
}));