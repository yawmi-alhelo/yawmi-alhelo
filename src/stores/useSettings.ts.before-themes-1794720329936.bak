import { create } from 'zustand';
import { Settings as SettingsRepo } from '../lib/repositories';
import { DEFAULT_SETTINGS, type AppSettings } from '../types';

interface SettingsState {
  settings: AppSettings;
  loaded: boolean;
  load: () => Promise<void>;
  update: (patch: Partial<AppSettings>) => Promise<void>;
}

export const useSettings = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  load: async () => {
    const s = await SettingsRepo.getSettings();
    console.log('[useSettings] محمّل:', {
      aiEnabled: s.aiEnabled,
      hasKey: !!s.aiApiKey,
      keyStart: s.aiApiKey?.slice(0, 12),
      model: s.aiModel,
    });
    set({ settings: s, loaded: true });
    if (s.darkMode) document.documentElement.classList.add('dark');
  },
  update: async (patch) => {
    const next = await SettingsRepo.saveSettings(patch);
    set({ settings: next });
    if ('darkMode' in patch) {
      document.documentElement.classList.toggle('dark', !!next.darkMode);
    }
  },
}));
