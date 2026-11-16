import { getDB } from '../db';
import { nanoid } from 'nanoid';
import type { Appointment } from '../../types';

export async function getAppointmentsByDate(date: string): Promise<Appointment[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('appointments', 'by-date', date);
  return all.sort((a, b) => a.time.localeCompare(b.time));
}

export async function getAllAppointments(): Promise<Appointment[]> {
  const db = await getDB();
  return db.getAll('appointments');
}

export async function addAppointment(
  input: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Appointment> {
  const db = await getDB();
  const now = new Date().toISOString();
  const appt: Appointment = { ...input, id: nanoid(), createdAt: now, updatedAt: now };
  await db.put('appointments', appt);
  return appt;
}

export async function updateAppointment(
  id: string, patch: Partial<Appointment>
): Promise<Appointment | undefined> {
  const db = await getDB();
  const existing = await db.get('appointments', id);
  if (!existing) return undefined;
  const updated: Appointment = { ...existing, ...patch, id, updatedAt: new Date().toISOString() };
  await db.put('appointments', updated);
  return updated;
}

export async function deleteAppointment(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('appointments', id);
}
