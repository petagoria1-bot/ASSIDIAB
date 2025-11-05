import Dexie, { type Table } from 'dexie';
import { Patient, Mesure, Repas, Injection, Food, User, FavoriteMeal, Event, DailyProgress } from '../types';

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
  events: Table<Event, string>;
  dailyProgress: Table<DailyProgress, string>; // YYYY-MM-DD format
};

db.version(4).stores({
  users: '++id, &username',
  patients: 'id, userId',
  mesures: 'id, ts, patient_id',
  repas: 'id, ts, patient_id',
  injections: 'id, ts, patient_id, type',
  foodLibrary: 'id, name',
  favoriteMeals: 'id, patient_id, name',
  events: 'id, ts, patient_id, status',
  dailyProgress: 'date, patient_id' // New table for gamification
});

db.version(3).stores({
  users: '++id, &username',
  patients: 'id, userId',
  mesures: 'id, ts, patient_id',
  repas: 'id, ts, patient_id',
  injections: 'id, ts, patient_id, type',
  foodLibrary: 'id, name',
  favoriteMeals: 'id, patient_id, name',
  events: 'id, ts, patient_id, status'
});

// Migration from version 2 to 3 is handled automatically by Dexie
// as we are just adding a new table.

db.version(2).stores({
  users: '++id, &username',
  patients: 'id, userId',
  mesures: 'id, ts, patient_id',
  repas: 'id, ts, patient_id',
  injections: 'id, ts, patient_id, type',
  foodLibrary: 'id, name',
  favoriteMeals: 'id, patient_id, name'
});