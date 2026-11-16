import { create } from 'zustand';
import { Appointments as Repo } from '../lib/repositories';
import { scheduleAppointmentReminder, cancelAppointmentReminder } from '../lib/notifications';
import { useSettings } from './useSettings';
import type { Appointment } from '../types';

interface State {
  items: Appointment[];
  loading: boolean;
  load: () => Promise<void>;
  add: (input: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  update: (id: string, patch: Partial<Appointment>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useAppointments = create<State>((set, get) => ({
  items: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    try {
      const items = await Repo.getAllAppointments();
      set({ items });
    } finally {
      set({ loading: false });
    }
  },

  add: async (input) => {
    const appt = await Repo.addAppointment(input);
    const settings = useSettings.getState().settings;

    if (settings.notificationsEnabled && (appt.reminderMinutes ?? 0) > 0) {
      try {
        await scheduleAppointmentReminder(appt, settings.notificationSound);
      } catch (error) {
        console.error('Appointment reminder scheduling failed:', error);
      }
    }

    await get().load();
  },

  update: async (id, patch) => {
    const updated = await Repo.updateAppointment(id, patch);

    if (!updated) {
      await get().load();
      return;
    }

    try {
      await cancelAppointmentReminder(id);
    } catch (error) {
      console.error('Appointment reminder cancellation failed:', error);
    }

    const settings = useSettings.getState().settings;
    if (settings.notificationsEnabled && (updated.reminderMinutes ?? 0) > 0) {
      try {
        await scheduleAppointmentReminder(updated, settings.notificationSound);
      } catch (error) {
        console.error('Appointment reminder rescheduling failed:', error);
      }
    }

    await get().load();
  },

  remove: async (id) => {
    await Repo.deleteAppointment(id);

    try {
      await cancelAppointmentReminder(id);
    } catch (error) {
      console.error('Appointment reminder cancellation failed:', error);
    }

    await get().load();
  },
}));
