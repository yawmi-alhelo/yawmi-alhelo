import { getDB } from '../db';
import { nanoid } from 'nanoid';
import type { CycleRecord } from '../cycles/types';

export async function getAllCycles(): Promise<CycleRecord[]> {
  try {
    const db = await getDB();
    const all = await db.getAll('cycles');
    return all.sort((a, b) => b.startDate.localeCompare(a.startDate));
  } catch { return []; }
}

export async function addCycle(input: Omit<CycleRecord, 'id' | 'createdAt'>): Promise<CycleRecord> {
  const db = await getDB();
  const record: CycleRecord = {
    ...input,
    id: nanoid(),
    createdAt: new Date().toISOString(),
  };
  await db.put('cycles', record);
  return record;
}

export async function updateCycle(id: string, patch: Partial<CycleRecord>): Promise<void> {
  const db = await getDB();
  const existing = await db.get('cycles', id);
  if (!existing) return;
  await db.put('cycles', { ...existing, ...patch, id });
}

export async function deleteCycle(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('cycles', id);
}
