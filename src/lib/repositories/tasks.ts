import { getDB } from '../db';
import { nanoid } from 'nanoid';
import type { Task } from '../../types';

export async function getTasksByDate(date: string): Promise<Task[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('tasks', 'by-date', date);
  return all.sort((a, b) => {
    // غير المكتملة أولاً
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    // ترتيب زمني حسب الوقت (الأقدم أولاً)
    const ta = a.scheduledTime || '99:99';
    const tb = b.scheduledTime || '99:99';
    if (ta !== tb) return ta.localeCompare(tb);
    // لو نفس الوقت، الأحدث إنشاءً أولاً
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function getTasksRange(startDate: string, endDate: string): Promise<Task[]> {
  const db = await getDB();
  const all = await db.getAll('tasks');
  return all.filter(t => t.date >= startDate && t.date <= endDate);
}

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDB();
  return db.getAll('tasks');
}

export async function getTask(id: string): Promise<Task | undefined> {
  const db = await getDB();
  return db.get('tasks', id);
}

export async function addTask(input: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const db = await getDB();
  const now = new Date().toISOString();
  const task: Task = { ...input, id: nanoid(), createdAt: now, updatedAt: now };
  await db.put('tasks', task);
  return task;
}

export async function updateTask(id: string, patch: Partial<Task>): Promise<Task | undefined> {
  const db = await getDB();
  const existing = await db.get('tasks', id);
  if (!existing) return undefined;
  const updated: Task = { ...existing, ...patch, id, updatedAt: new Date().toISOString() };
  await db.put('tasks', updated);
  return updated;
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tasks', id);
}

export async function toggleTask(id: string): Promise<Task | undefined> {
  const db = await getDB();
  const t = await db.get('tasks', id);
  if (!t) return undefined;
  const updated: Task = {
    ...t,
    completed: !t.completed,
    completedAt: !t.completed ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
  };
  await db.put('tasks', updated);
  return updated;
}

export async function deferTask(id: string, newDate: string): Promise<Task | undefined> {
  return updateTask(id, { date: newDate, deferred: true, deferredFrom: (await getTask(id))?.date });
}
