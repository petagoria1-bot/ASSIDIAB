
// FIX: Use a named import for Dexie to ensure proper subclassing, as the default import was causing method resolution issues.
import { Dexie, type Table } from 'dexie';
import { Patient, Mesure, Repas, Injection, Food, User } from '../types';

export class AppDB extends Dexie {
  users!: Table<User, number>;
  patients!: Table<Patient, string>;
  mesures!: Table<Mesure, string>;
  repas!: Table<Repas, string>;
  injections!: Table<Injection, string>;
  foodLibrary!: Table<Food, string>;

  constructor() {
    super('DiabAssistantDB');
    this.version(2).stores({
      users: '++id, &username',
      patients: 'id, userId',
      mesures: 'id, ts, patient_id',
      repas: 'id, ts, patient_id',
      injections: 'id, ts, patient_id, type',
      foodLibrary: 'id, name'
    });
  }
}

export const db = new AppDB();