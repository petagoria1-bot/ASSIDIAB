import { create } from 'zustand';
import { MealTime } from '../types.ts';

interface UiState {
  calculatorMealTime: MealTime | null;
  setCalculatorMealTime: (mealTime: MealTime | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  calculatorMealTime: null,
  setCalculatorMealTime: (mealTime) => set({ calculatorMealTime: mealTime }),
}));