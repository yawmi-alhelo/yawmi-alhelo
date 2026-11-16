import { getDB } from '../db';
import { nanoid } from 'nanoid';
import type { FocusSession, FocusType } from '../../types';

export async function addFocusSession(
  type: FocusType, durationMinutes: number, completed: boolean
): Promise<FocusSession> {
  const db = await getDB();
  const session: FocusSession = {
    id: nanoid(),
    type,
    durationMinutes,
    startedAt: new Date().toISOString(),
    endedAt: completed ? new Date().toISOString() : undefined,
    completed,
  };
  await db.put('focusSessions', session);
  return session;
}

export async function getTodayFocusSessions(): Promise<FocusSession[]> {
  const db = await getDB();
  const all = await db.getAll('focusSessions');
  const today = new Date().toISOString().slice(0, 10);
  return all.filter(s => s.startedAt.startsWith(today));
}

export async function getFocusRange(startISO: string, endISO: string): Promise<FocusSession[]> {
  const db = await getDB();
  const all = await db.getAll('focusSessions');
  return all.filter(s => s.startedAt >= startISO && s.startedAt <= endISO);
}

export async function getTotalFocusMinutes(): Promise<number> {
  const db = await getDB();
  const all = await db.getAll('focusSessions');
  return all.filter(s => s.completed && s.type === 'focus')
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}
