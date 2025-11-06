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
            return 'La fenêtre de connexion a été fermée.';
        case 'auth/account-exists-with-different-credential':
            return 'Un compte existe déjà avec cet e-mail mais avec une méthode de connexion différente.';
        default:
            return 'Une erreur est survenue lors de l\'authentification.';
    }
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  clearError: () => set({ error: null }),

  initializeAuth: () => {
    // This listener is the single source of truth. It's called on app start
    // and whenever the auth state changes. It correctly handles redirect results
    // before firing. We keep `isLoading` true until this gives us a definitive answer.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user: User = { uid: firebaseUser.uid, email: firebaseUser.email };
        set({
          currentUser: user,
          isAuthenticated: true,
          isLoading: false, // Definitive state: Logged IN
          error: null,
        });
      } else {
        // No user is signed in.
        set({
          currentUser: null,
          isAuthenticated: false,
          isLoading: false, // Definitive state: Logged OUT
          error: null,
        });
      }
    });

    // Return the unsubscribe function to be called on cleanup.
    return unsubscribe;
  },

  signup: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const newUser: User = { uid: firebaseUser.uid, email: firebaseUser.email };

      // We still keep a local copy for potential offline profile info
      await db.users.add({ uid: newUser.uid, email: newUser.email ?? '' });

      // onAuthStateChanged will handle the state update automatically.
      toast.success("Compte créé avec succès !");

    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        set({ error: 'auth/email-already-in-use', isLoading: false });
        toast.info("Ce compte existe déjà. Veuillez vous connecter.");
      } else {
        const errorMessage = formatAuthError(error.code);
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
      }
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
        // The result will be handled by the onAuthStateChanged listener on the next page load.
    } catch (error: any) {
        console.error("Google sign-in error", error);
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