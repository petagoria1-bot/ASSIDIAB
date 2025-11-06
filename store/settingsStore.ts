
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Language = 'fr' | 'en' | 'tr' | 'ar' | 'ur' | 'ps' | 'uk';

interface SettingsState {
  language: Language;
  translateFood: boolean;
  showRatioReminder: boolean;
  setLanguage: (lang: Language) => void;
  toggleTranslateFood: () => void;
  toggleShowRatioReminder: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'fr',
      translateFood: true,
      showRatioReminder: true,
      setLanguage: (lang) => set({ language: lang }),
      toggleTranslateFood: () => set((state) => ({ translateFood: !state.translateFood })),
      toggleShowRatioReminder: () => set((state) => ({ showRatioReminder: !state.showRatioReminder })),
    }),
    {
      name: 'diab-assis-settings', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
