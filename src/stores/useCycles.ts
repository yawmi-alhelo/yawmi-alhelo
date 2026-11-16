import { create } from 'zustand';
import { getAllCycles, addCycle, updateCycle, deleteCycle } from '../lib/repositories/cycles';
import type { CycleRecord } from '../lib/cycles/types';
import { scheduleCycleReminder, cancelCycleReminder } from '../lib/cycles/notify';
import { useSettings } from './useSettings';

interface CycleState {
  items: CycleRecord[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  add: (input: Omit<CycleRecord, 'id' | 'createdAt'>) => Promise<void>;
  update: (id: string, patch: Partial<CycleRecord>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useCycles = create<CycleState>((set, get) => ({
  items: [],
  loading: false,
  loaded: false,
  load: async () => {
    set({ loading: true });
    const items = await getAllCycles();
    set({ items, loading: false, loaded: true });
  },
  add: async (input) => {
    const record = await addCycle(input);
    const settings = useSettings.getState().settings;
    if (settings.cycleNotifications) {
      await scheduleCycleReminder(record, settings.cycleLength);
    }
    await get().load();
  },
  update: async (id, patch) => {
    await updateCycle(id, patch);
    await get().load();
  },
  remove: async (id) => {
    await cancelCycleReminder(id);
    await deleteCycle(id);
    await get().load();
  },
}));
