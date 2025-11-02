
// FIX: Using a default import for Dexie. The named import was not working correctly for subclassing in this environment, causing methods like 'version()', 'transaction()' and 'table()' to be missing from the extended class instance.
import Dexie, { type Table } from 'dexie';
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