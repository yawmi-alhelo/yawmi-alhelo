import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
  Task, Appointment, Habit, HabitLog, Goal,
  Note, ShoppingItem, FocusSession, AppSettings
} from '../types';
import type { MemoryEntry } from './memory/types';

const DB_NAME = 'yawmi-alhelo';
const DB_VERSION = 5;

interface YawmiDB extends DBSchema {
  tasks: { key: string; value: Task; indexes: { 'by-date': string; 'by-completed': number } };
  appointments: { key: string; value: Appointment; indexes: { 'by-date': string } };
  habits: { key: string; value: Habit };
  habitLogs: { key: string; value: HabitLog; indexes: { 'by-habit': string; 'by-date': string } };
  goals: { key: string; value: Goal };
  notes: { key: string; value: Note };
  shopping: { key: string; value: ShoppingItem };
  focusSessions: { key: string; value: FocusSession; indexes: { 'by-started': string } };
  settings: { key: string; value: AppSettings };
  memory: { key: string; value: MemoryEntry; indexes: { 'by-category': string } };
  rewards: { key: string; value: RewardState };
  favorites: { key: string; value: FavoriteRecipe; indexes: { 'by-dish': string } };
  achievements: { key: string; value: UnlockedAchievement };
}

interface UnlockedAchievement {
  id: string;
  unlockedAt: string;
}

interface FavoriteRecipe {
  id: string;
  dish: string;
  emoji: string;
  meal: string;
  ingredientsUsed: string[];
  steps: string[];
  prepTime: number;
  cookTime: number;
  source: 'ai' | 'local';
  savedAt: string;
}

interface RewardState {
  points: number;
  flowers: number;
  tasksCompleted: number;
  lastCompletionAt: string;
  milestones: string[];  // ['flower_5', 'flower_10', ...]
}

let dbPromise: Promise<IDBPDatabase<YawmiDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<YawmiDB>> {
  if (dbPromise) return dbPromise;
  dbPromise = openDB<YawmiDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const tasks = db.createObjectStore('tasks', { keyPath: 'id' });
        tasks.createIndex('by-date', 'date');
        tasks.createIndex('by-completed', 'completed');
        const appts = db.createObjectStore('appointments', { keyPath: 'id' });
        appts.createIndex('by-date', 'date');
        db.createObjectStore('habits', { keyPath: 'id' });
        const logs = db.createObjectStore('habitLogs', { keyPath: 'id' });
        logs.createIndex('by-habit', 'habitId');
        logs.createIndex('by-date', 'date');
        db.createObjectStore('goals', { keyPath: 'id' });
        db.createObjectStore('notes', { keyPath: 'id' });
        db.createObjectStore('shopping', { keyPath: 'id' });
        const focus = db.createObjectStore('focusSessions', { keyPath: 'id' });
        focus.createIndex('by-started', 'startedAt');
        db.createObjectStore('settings');
      }
      if (oldVersion < 2) {
        const mem = db.createObjectStore('memory', { keyPath: 'id' });
        mem.createIndex('by-category', 'category');
      }
      if (oldVersion < 3) {
        db.createObjectStore('rewards');
      }
      if (oldVersion < 4) {
        const favs = db.createObjectStore('favorites', { keyPath: 'id' });
        favs.createIndex('by-dish', 'dish');
      }
      if (oldVersion < 5) {
        db.createObjectStore('achievements', { keyPath: 'id' });
      }
    },
    blocked() { console.warn('[DB] Blocked'); },
    blocking() { console.warn('[DB] Blocking'); },
  });
  return dbPromise;
}

export async function resetDB(): Promise<void> {
  if (dbPromise) { (await dbPromise).close(); dbPromise = null; }
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}
