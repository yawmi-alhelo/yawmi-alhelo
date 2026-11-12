import { getDB } from '../db';
import { nanoid } from 'nanoid';
import type { Habit, HabitLog } from '../../types';

export async function getAllHabits(): Promise<Habit[]> {
  const db = await getDB();
  return db.getAll('habits');
}

export async function addHabit(input: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> {
  const db = await getDB();
  const habit: Habit = { ...input, id: nanoid(), createdAt: new Date().toISOString() };
  await db.put('habits', habit);
  return habit;
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('habits', id);
  const logs = await db.getAllFromIndex('habitLogs', 'by-habit', id);
  const tx = db.transaction('habitLogs', 'readwrite');
  for (const log of logs) await tx.store.delete(log.id);
  await tx.done;
}

export async function toggleHabitLog(habitId: string, date: string): Promise<boolean> {
  const db = await getDB();
  const id = `${habitId}_${date}`;
  const existing = await db.get('habitLogs', id);
  if (existing) {
    await db.delete('habitLogs', id);
    return false;
  }
  const log: HabitLog = { id, habitId, date, completed: true };
  await db.put('habitLogs', log);
  return true;
}

export async function getLogsByDate(date: string): Promise<HabitLog[]> {
  const db = await getDB();
  return db.getAllFromIndex('habitLogs', 'by-date', date);
}

export async function getHabitsWithLogs(date: string): Promise<Array<Habit & { doneToday: boolean }>> {
  const habits = await getAllHabits();
  const logs = await getLogsByDate(date);
  const doneSet = new Set(logs.map(l => l.habitId));
  return habits.map(h => ({ ...h, doneToday: doneSet.has(h.id) }));
}

export async function getHabitStreak(habitId: string): Promise<number> {
  const db = await getDB();
  const logs = await db.getAllFromIndex('habitLogs', 'by-habit', habitId);
  if (logs.length === 0) return 0;
  const dates = new Set(logs.map(l => l.date));
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (dates.has(iso)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
