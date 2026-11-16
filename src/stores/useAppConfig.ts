import { create } from 'zustand';
import { ACHIEVEMENTS } from '../lib/achievements/definitions';

export const useAppConfig = create<{
  config: any;
  appSettings: any;
  homeLayout: any[];
  setConfig: (c: any) => void;
  setAppSettings: (s: any) => void;
  setHomeLayout: (l: any[]) => void;
  getAchievements: () => any[];
}>((set, get) => ({
  config: null,
  appSettings: null,
  homeLayout: [],
  setConfig: (c) => set({ config: c }),
  setAppSettings: (s) => set({ appSettings: s }),
  setHomeLayout: (l) => set({ homeLayout: l }),
  getAchievements: () => {
    const c = get().config;
    if (c && Array.isArray(c.achievements)) return c.achievements;
    return ACHIEVEMENTS;
  }
}));
