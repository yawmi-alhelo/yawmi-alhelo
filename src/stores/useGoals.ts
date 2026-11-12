import { create } from 'zustand';
import { Goals as Repo } from '../lib/repositories';
import type { Goal } from '../types';

interface State {
  items: Goal[];
  loading: boolean;
  load: () => Promise<void>;
  add: (input: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  update: (id: string, patch: Partial<Goal>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useGoals = create<State>((set, get) => ({
  items: [],
  loading: false,
  load: async () => {
    set({ loading: true });
    const items = await Repo.getAllGoals();
    set({ items, loading: false });
  },
  add: async (input) => { await Repo.addGoal(input); await get().load(); },
  update: async (id, patch) => { await Repo.updateGoal(id, patch); await get().load(); },
  remove: async (id) => { await Repo.deleteGoal(id); await get().load(); },
}));
