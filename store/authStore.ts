import { create } from 'zustand';
import toast from 'react-hot-toast';
import { db } from '../services/db.ts';
import { User } from '../types.ts';
import { auth } from '../services/firebase.ts';
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

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true, // Start loading immediately.
  error: null,
  clearError: () => set({ error: null }),

  initializeAuth: () => {
    // This robust pattern ensures redirect results are handled before the app renders.
    // 1. We attach onAuthStateChanged to keep the user state in sync.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const currentUser: User = { uid: user.uid, email: user.email };
        set({ currentUser, isAuthenticated: true, error: null });
      } else {
        set({ currentUser: null, isAuthenticated: false, error: null });
      }
    });

    // 2. We explicitly process the redirect result. The completion of this promise
    //    is our signal that any pending authentication is finished.
    getRedirectResult(auth)
      .catch((error) => {
        // Handle redirect-specific errors.
        console.error("Google redirect sign-in error", error);
        const errorMessage = formatAuthError(error.code);
        set({ error: errorMessage });
        toast.error(errorMessage);
      })
      .finally(() => {
        // Whether a user was signed in or not, the check is complete.
        // onAuthStateChanged will have already fired with the definitive state.
        // Now it's safe to stop the initial loading screen.
        set({ isLoading: false });
      });

    return unsubscribe;
  },

  signup: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the state update automatically.
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
      // onAuthStateChanged will handle the state update.
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
        // After this call, the page unloads and redirects. Nothing further is executed.
    } catch (error: any) {
        // This catch block is unlikely to be hit for redirect flows,
        // but good to have for robustness (e.g., config errors).
        console.error("Google sign-in initiation error", error);
        const errorMessage = formatAuthError(error.code);
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
    }
  },

  logout: async () => {
    await signOut(auth);
    // onAuthStateChanged will handle clearing the user state.
  },
}));
