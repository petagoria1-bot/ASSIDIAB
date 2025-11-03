import Dexie, { type Table } from 'dexie';
import { Patient, Mesure, Repas, Injection, Food, User, FavoriteMeal } from '../types';

// The database instance is created directly instead of through a subclass
// to prevent TypeScript errors related to method inheritance in some environments.
export const db = new Dexie('DiabAssistantDB') as Dexie & {
  users: Table<User, number>;
  patients: Table<Patient, string>;
  mesures: Table<Mesure, string>;
  repas: Table<Repas, string>;
  injections: Table<Injection, string>;
  foodLibrary: Table<Food, string>;
  favoriteMeals: Table<FavoriteMeal, string>;
};

db.version(2).stores({
  users: '++id, &username',
  patients: 'id, userId',
  mesures: 'id, ts, patient_id',
  repas: 'id, ts, patient_id',
  injections: 'id, ts, patient_id, type',
  foodLibrary: 'id, name',
  favoriteMeals: 'id, patient_id, name'
});
