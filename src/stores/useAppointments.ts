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
    const items = await Repo.getAllAppointments();
    set({ items, loading: false });
  },
  add: async (input) => { 
    const appt = await Repo.addAppointment(input); 
    const soundId = useSettings.getState().settings.notificationSound;
    if (useSettings.getState().settings.notificationsEnabled) {
      await scheduleAppointmentReminder(appt, soundId);
    }
    await get().load(); 
  },
  update: async (id, patch) => { 
    await cancelAppointmentReminder(id);
    const updated = await Repo.updateAppointment(id, patch);
    const soundId = useSettings.getState().settings.notificationSound;
    if (updated && useSettings.getState().settings.notificationsEnabled) {
      await scheduleAppointmentReminder(updated, soundId);
    }
    await get().load(); 
  },
  remove: async (id) => { 
    await cancelAppointmentReminder(id);
    await Repo.deleteAppointment(id); 
    await get().load(); 
  },
}));
