import { getDB } from '../db';
import { nanoid } from 'nanoid';
import type { Goal } from '../../types';

export async function getAllGoals(): Promise<Goal[]> {
  const db = await getDB();
  return db.getAll('goals');
}

export async function addGoal(input: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
  const db = await getDB();
  const now = new Date().toISOString();
  const goal: Goal = { ...input, id: nanoid(), createdAt: now, updatedAt: now };
  await db.put('goals', goal);
  return goal;
}

export async function updateGoal(id: string, patch: Partial<Goal>): Promise<Goal | undefined> {
  const db = await getDB();
  const existing = await db.get('goals', id);
  if (!existing) return undefined;
  const updated: Goal = { ...existing, ...patch, id, updatedAt: new Date().toISOString() };
  await db.put('goals', updated);
  return updated;
}

export async function deleteGoal(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('goals', id);
}
