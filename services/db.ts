import Dexie, { type Table } from 'dexie';
import { Patient, Mesure, Repas, Injection, Food, User, FavoriteMeal } from '../types';

// FIX: Switched to a class-based schema definition for Dexie.
// This is a more robust way to define the database schema with TypeScript and
// resolves errors where methods like 'version' and 'transaction' were not found.
export class AppDB extends Dexie {
  users!: Table<User, number>;
  patients!: Table<Patient, string>;
  mesures!: Table<Mesure, string>;
  repas!: Table<Repas, string>;
  injections!: Table<Injection, string>;
  foodLibrary!: Table<Food, string>;
  favoriteMeals!: Table<FavoriteMeal, string>;

  constructor() {
    super('DiabAssistantDB');

    // FIX: Dexie versions must be defined in ascending order. Version 2 before version 3.
    this.version(2).stores({
      users: '++id, &username',
      patients: 'id, userId',
      mesures: 'id, ts, patient_id',
      repas: 'id, ts, patient_id',
      injections: 'id, ts, patient_id, type',
      foodLibrary: 'id, name'
    });
    this.version(3).stores({
      users: '++id, &username',
      patients: 'id, userId',
      mesures: 'id, ts, patient_id',
      repas: 'id, ts, patient_id',
      injections: 'id, ts, patient_id, type',
      foodLibrary: 'id, name',
      favoriteMeals: 'id, patient_id, name'
    });
    // Version 4: Add contacts and notes_pai to Patient object (no index needed, Dexie is schemaless)
    this.version(4).stores({
      users: '++id, &username',
      patients: 'id, userId',
      mesures: 'id, ts, patient_id',
      repas: 'id, ts, patient_id',
      injections: 'id, ts, patient_id, type',
      foodLibrary: 'id, name',
      favoriteMeals: 'id, patient_id, name'
    });
  }
}

const db = new AppDB();


export { db };