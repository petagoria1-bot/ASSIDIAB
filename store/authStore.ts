import { create } from 'zustand';
import toast from 'react-hot-toast';
import { db } from '../services/db';
import { User } from '../types';
import { usePatientStore } from './patientStore';

const SESSION_KEY = 'diab_assistant_user';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signup: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkSession: () => {
    try {
      const storedUser = sessionStorage.getItem(SESSION_KEY);
      if (storedUser) {
        const user = JSON.parse(storedUser);
        set({ currentUser: user, isAuthenticated: true, error: null });
      }
    } catch (e) {
      console.error("Failed to parse user from session storage", e);
    } finally {
        set({ isLoading: false });
    }
  },

  signup: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      // The `&username` in the db schema ensures uniqueness.
      // Dexie will throw a 'ConstraintError' if we try to add a duplicate.
      // This is more reliable than checking manually first.
      const newUser: User = { username, password };
      const id = await db.users.add(newUser);
      
      if (typeof id !== 'number') {
        throw new Error("La création du compte a échoué (ID invalide).");
      }

      const userWithId: User = { ...newUser, id };
      
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(userWithId));
      set({ currentUser: userWithId, isAuthenticated: true, isLoading: false });
      toast.success("Compte créé avec succès !");

    } catch (error: any) {
      let errorMessage = "Une erreur inconnue est survenue.";
      if (error.name === 'ConstraintError') {
          errorMessage = "Ce pseudo est déjà utilisé.";
      } else if (error.message) {
          errorMessage = error.message;
      }
      
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await db.users.where('username').equals(username).first();
      if (!user || user.password !== password) {
        throw new Error("Pseudo ou mot de passe incorrect.");
      }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      set({ currentUser: user, isAuthenticated: true, isLoading: false });
      toast.success(`Bienvenue, ${username} !`);
    } catch (error: any) {
      const errorMessage = error.message || "Une erreur inconnue est survenue.";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  logout: () => {
    sessionStorage.removeItem(SESSION_KEY);
    usePatientStore.getState().clearPatientData(); // Clear patient data on logout
    set({ currentUser: null, isAuthenticated: false });
  },
}));