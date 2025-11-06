import { create } from 'zustand';
import toast from 'react-hot-toast';
import { db } from '../services/db.ts';
import { User } from '../types.ts';
import { auth } from '../services/firebase.ts';
import { usePatientStore } from './patientStore.ts';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  initializeAuth: () => () => void; // Returns the unsubscribe function
}

const formatAuthError = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Adresse e-mail invalide.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Email ou mot de passe incorrect.';
        case 'auth/email-already-in-use':
            return 'Cette adresse e-mail est déjà utilisée.';
        case 'auth/weak-password':
            return 'Le mot de passe doit comporter au moins 6 caractères.';
        case 'auth/popup-closed-by-user':
        case 'auth/cancelled-popup-request':
            return 'La fenêtre de connexion a été fermée.';
        case 'auth/account-exists-with-different-credential':
            return 'Un compte existe déjà avec cet e-mail mais avec une méthode de connexion différente.';
        default:
            console.error('Unhandled Firebase Auth Error:', errorCode);
            return 'Une erreur est survenue lors de l\'authentification.';
    }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  clearError: () => set({ error: null }),

  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, 
      async (user) => {
        if (user) {
          const currentUser: User = { uid: user.uid, email: user.email };
          set({ currentUser, isAuthenticated: true, error: null });

          // NEW: Check if we are in the middle of an invitation flow
          const pendingInviteId = sessionStorage.getItem('pendingInviteId');
          if (pendingInviteId) {
            try {
              await usePatientStore.getState().acceptInvitation(pendingInviteId, currentUser);
              sessionStorage.removeItem('pendingInviteId');
            } catch (error) {
              console.error("Failed to accept invitation post-auth:", error);
              toast.error("Erreur lors de la finalisation de l'invitation.");
            }
          }
          
          set({ isLoading: false });
        } else {
          set({ currentUser: null, isAuthenticated: false, isLoading: false, error: null });
        }
      },
      (error) => {
        console.error("Auth state listener error:", error);
        set({ currentUser: null, isAuthenticated: false, isLoading: false, error: "Auth initialization failed." });
      }
    );

    return unsubscribe;
  },

  signup: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle state update & invitation acceptance.
      toast.success("Compte créé avec succès !");
    } catch (error: any) {
      const errorMessage = formatAuthError(error.code);
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle state update & invitation acceptance.
      toast.success(`Bienvenue !`);
    } catch (error: any) {
      const errorMessage = formatAuthError(error.code);
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null }); 
    try {
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
    } catch (error: any) {
        console.error("Google sign-in initiation error", error);
        const errorMessage = formatAuthError(error.code);
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
    }
  },

  logout: async () => {
    // Clear any pending invite flow on logout
    sessionStorage.removeItem('pendingInviteId');
    await signOut(auth);
    // onAuthStateChanged will handle clearing the user state.
  },
}));