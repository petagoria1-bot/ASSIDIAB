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
    // This function sets up a listener that handles all authentication states.
    // It's designed to be robust against race conditions that can occur with
    // Google's sign-in redirect flow.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // CASE 1: A user object is available.
        // This can happen if the user was already logged in (session persisted)
        // or if a sign-in (including redirect) has just completed.
        // We can confidently set the authenticated state.
        const currentUser: User = { uid: user.uid, email: user.email };
        set({
          currentUser,
          isAuthenticated: true,
          isLoading: false, // We have a definitive state, so we are no longer loading.
          error: null,
        });
      } else {
        // CASE 2: The user object is null.
        // This could mean two things:
        // a) The user is truly logged out.
        // b) The app has just loaded after a Google redirect, and Firebase is still
        //    processing the result. The listener fires with 'null' initially.
        // To solve this ambiguity, we must check the redirect result.
        getRedirectResult(auth)
          .then((result) => {
            // `result` will be null if the user isn't returning from a redirect.
            if (result === null) {
              // This confirms case (a). The user is logged out.
              // We can now safely update the state.
              set({
                currentUser: null,
                isAuthenticated: false,
                isLoading: false, // We have a definitive state, so we are no longer loading.
              });
            }
            // If `result` is NOT null, it means the sign-in was successful.
            // The `onAuthStateChanged` listener will automatically be called AGAIN
            // by Firebase with the new user object. That second call will be
            // handled by CASE 1 above. We do nothing here and let the loading continue.
          })
          .catch((error) => {
            // This catches errors from the redirect process itself.
            console.error("Google Sign-In Redirect Error:", error);
            const errorMessage = formatAuthError(error.code);
            set({
              error: errorMessage,
              isLoading: false,
              isAuthenticated: false,
              currentUser: null,
            });
            toast.error(errorMessage);
          });
      }
    });

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