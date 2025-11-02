import { create } from 'zustand';
import { db } from '../services/db';
import { User } from '../types';
import { usePatientStore } from './patientStore';

const SESSION_KEY = 'diab_assistant_user';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signup: (username: string, password: string) => Promise<boolean>;
  login: (username: string, password: string) => Promise<boolean>;
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
      const existingUser = await db.users.where('username').equals(username).first();
      if (existingUser) {
        throw new Error("Ce pseudo est déjà utilisé.");
      }
      const newUser: Omit<User, 'id'> = { username, password };
      const id = await db.users.add(newUser as User);
      const userWithId = { ...newUser, id };
      
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(userWithId));
      set({ currentUser: userWithId, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
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
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    sessionStorage.removeItem(SESSION_KEY);
    usePatientStore.getState().clearPatientData(); // Clear patient data on logout
    set({ currentUser: null, isAuthenticated: false });
  },
}));