import Dexie, { type Table } from 'dexie';
import { Patient, Mesure, Repas, Injection, Food, User } from '../types';

// FIX: Replaced Dexie subclassing with a typed instance to resolve type errors
// where Dexie methods like 'version' and 'transaction' were not found.
// This pattern is more robust against certain TypeScript compiler/environment issues.
export class AppDB extends Dexie {
  users!: Table<User, number>;
  patients!: Table<Patient, string>;
  mesures!: Table<Mesure, string>;
  repas!: Table<Repas, string>;
  injections!: Table<Injection, string>;
  foodLibrary!: Table<Food, string>;
}

export const db = new Dexie('DiabAssistantDB') as AppDB;

db.version(2).stores({
  users: '++id, &username',
  patients: 'id, userId',
  mesures: 'id, ts, patient_id',
  repas: 'id, ts, patient_id',
  injections: 'id, ts, patient_id, type',
  foodLibrary: 'id, name'
});
