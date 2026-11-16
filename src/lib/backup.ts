import { getDB } from './db';
import type { Task, Appointment, Habit, HabitLog, Goal, Note, ShoppingItem, FocusSession, AppSettings } from '../types';

export interface BackupData {
  version: 1;
  exportedAt: string;
  tasks: Task[];
  appointments: Appointment[];
  habits: Habit[];
  habitLogs: HabitLog[];
  goals: Goal[];
  notes: Note[];
  shopping: ShoppingItem[];
  focusSessions: FocusSession[];
  settings: AppSettings | null;
}

export async function createBackup(): Promise<BackupData> {
  const db = await getDB();
  const [tasks, appointments, habits, habitLogs, goals, notes, shopping, focusSessions] = await Promise.all([
    db.getAll('tasks'),
    db.getAll('appointments'),
    db.getAll('habits'),
    db.getAll('habitLogs'),
    db.getAll('goals'),
    db.getAll('notes'),
    db.getAll('shopping'),
    db.getAll('focusSessions'),
  ]);
  const settings = await db.get('settings', 'app').catch(() => null);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks, appointments, habits, habitLogs, goals, notes, shopping, focusSessions,
    settings: settings || null,
  };
}

export async function restoreBackup(data: BackupData): Promise<void> {
  if (!data || data.version !== 1) {
    throw new Error('ملف النسخة الاحتياطية غير صالح');
  }
  const db = await getDB();
  const tx = db.transaction(
    ['tasks', 'appointments', 'habits', 'habitLogs', 'goals', 'notes', 'shopping', 'focusSessions', 'settings'],
    'readwrite'
  );
  // مسح الجداول القديمة
  await Promise.all([
    tx.objectStore('tasks').clear(),
    tx.objectStore('appointments').clear(),
    tx.objectStore('habits').clear(),
    tx.objectStore('habitLogs').clear(),
    tx.objectStore('goals').clear(),
    tx.objectStore('notes').clear(),
    tx.objectStore('shopping').clear(),
    tx.objectStore('focusSessions').clear(),
  ]);
  // رفع البيانات الجديدة
  for (const t of data.tasks) await tx.objectStore('tasks').put(t);
  for (const a of data.appointments) await tx.objectStore('appointments').put(a);
  for (const h of data.habits) await tx.objectStore('habits').put(h);
  for (const l of data.habitLogs) await tx.objectStore('habitLogs').put(l);
  for (const g of data.goals) await tx.objectStore('goals').put(g);
  for (const n of data.notes) await tx.objectStore('notes').put(n);
  for (const s of data.shopping) await tx.objectStore('shopping').put(s);
  for (const f of data.focusSessions) await tx.objectStore('focusSessions').put(f);
  if (data.settings) await tx.objectStore('settings').put(data.settings, 'app');
  await tx.done;
}

export function backupFilename(): string {
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return `yawmi-alhelo-backup-${date}.json`;
}
