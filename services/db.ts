
// FIX: Changed the named import of Dexie to a default import. This is necessary for correct subclassing, ensuring that methods like 'version', 'transaction', and 'table' are inherited by the AppDB class.
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
