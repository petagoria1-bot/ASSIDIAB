
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Language = 'fr' | 'en' | 'tr' | 'ar' | 'ur' | 'ps' | 'uk';

interface SettingsState {
  language: Language;
  translateFood: boolean;
  setLanguage: (lang: Language) => void;
  toggleTranslateFood: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'fr',
      translateFood: true,
      setLanguage: (lang) => set({ language: lang }),
      toggleTranslateFood: () => set((state) => ({ translateFood: !state.translateFood })),
    }),
    {
      name: 'diab-assis-settings', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);