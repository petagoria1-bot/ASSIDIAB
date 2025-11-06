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
  UserCredential,
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
  initializeAuth: () => void;
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
    const handleAuth = async () => {
      try {
        // By awaiting this, we ensure that any redirect is processed before moving on.
        // The result of this will then be available to onAuthStateChanged.
        await getRedirectResult(auth);
      } catch (error: any) {
        // If getRedirectResult fails, we log it. onAuthStateChanged will likely
        // receive a `null` user, which is the correct outcome.
        console.error("Google Sign-In Redirect Error:", error);
        toast.error(formatAuthError(error.code));
      }

      // Now, set up the listener. It will fire with the correct state,
      // whether from the processed redirect or from a stored session,
      // and it will correctly set isLoading to false only once the state is certain.
      onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          const user: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
          };
          set({ currentUser: user, isAuthenticated: true, isLoading: false, error: null });
        } else {
          set({ currentUser: null, isAuthenticated: false, isLoading: false, error: null });
        }
      });
    };

    handleAuth();
  },

  signup: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const newUser: User = { uid: firebaseUser.uid, email: firebaseUser.email };

      // We still keep a local copy for potential offline profile info
      await db.users.add({ uid: newUser.uid, email: newUser.email ?? '' });

      set({ currentUser: newUser, isAuthenticated: true, isLoading: false });
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
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const user: User = { uid: firebaseUser.uid, email: firebaseUser.email };
      set({ currentUser: user, isAuthenticated: true, isLoading: false });
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
        console.error("Google sign-in error", error);
        const errorMessage = formatAuthError(error.code);
        set({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
    }
  },

  logout: async () => {
    await signOut(auth);
  },
}));