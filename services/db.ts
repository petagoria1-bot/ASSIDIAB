// FIX: Changed the Dexie import from a named import to a default import. The Dexie library
// uses a default export for its main class. The incorrect import was preventing AppDB from
// inheriting Dexie's methods like .version() and .transaction().
import Dexie, { type Table } from 'dexie';
import { Patient, Mesure, Repas, Injection, Food } from '../types';

export class AppDB extends Dexie {
  patients!: Table<Patient, string>;
  mesures!: Table<Mesure, string>;
  repas!: Table<Repas, string>;
  injections!: Table<Injection, string>;
  foodLibrary!: Table<Food, string>;

  constructor() {
    super('DiabAssistantDB');
    this.version(1).stores({
      patients: 'id',
      mesures: 'id, ts, patient_id',
      repas: 'id, ts, patient_id',
      injections: 'id, ts, patient_id, type',
      foodLibrary: 'id, name'
    });
  }
}

export const db = new AppDB();