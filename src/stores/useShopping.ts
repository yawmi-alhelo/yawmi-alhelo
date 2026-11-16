import { create } from 'zustand';
import { Shopping as ShoppingRepo } from '../lib/repositories';
import type { ShoppingItem } from '../types';

interface ShoppingState {
  items: ShoppingItem[];
  loading: boolean;
  load: () => Promise<void>;
  add: (name: string, quantity?: string) => Promise<void>;
  toggle: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearChecked: () => Promise<void>;
}

export const useShopping = create<ShoppingState>((set, get) => ({
  items: [],
  loading: false,
  load: async () => {
    set({ loading: true });
    const items = await ShoppingRepo.getAllShopping();
    set({ items, loading: false });
  },
  add: async (name, quantity) => {
    await ShoppingRepo.addShoppingItem(name, quantity);
    await get().load();
  },
  toggle: async (id) => {
    await ShoppingRepo.toggleShoppingItem(id);
    await get().load();
  },
  remove: async (id) => {
    await ShoppingRepo.deleteShoppingItem(id);
    await get().load();
  },
  clearChecked: async () => {
    await ShoppingRepo.clearCheckedShopping();
    await get().load();
  },
}));
