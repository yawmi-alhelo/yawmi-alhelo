import { getDB } from '../db';
import { nanoid } from 'nanoid';
import type { Note } from '../../types';

export async function getAllNotes(): Promise<Note[]> {
  const db = await getDB();
  const notes = await db.getAll('notes');
  return notes.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export async function addNote(input: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
  const db = await getDB();
  const now = new Date().toISOString();
  const note: Note = { ...input, id: nanoid(), createdAt: now, updatedAt: now };
  await db.put('notes', note);
  return note;
}

export async function updateNote(id: string, patch: Partial<Note>): Promise<Note | undefined> {
  const db = await getDB();
  const existing = await db.get('notes', id);
  if (!existing) return undefined;
  const updated: Note = { ...existing, ...patch, id, updatedAt: new Date().toISOString() };
  await db.put('notes', updated);
  return updated;
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('notes', id);
}

export async function toggleNotePin(id: string): Promise<void> {
  const db = await getDB();
  const n = await db.get('notes', id);
  if (!n) return;
  await db.put('notes', { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() });
}
