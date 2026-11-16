import { create } from 'zustand';
import { Habits as HabitsRepo } from '../lib/repositories';
import { checkForNewAchievements } from '../lib/achievements';
import { useRewards } from './useRewards';
import { todayISO } from '../lib/date';
import type { Habit } from '../types';

export interface HabitRow extends Habit {
  doneToday: boolean;
  streak: number;
}

interface HabitsState {
  date: string;
  habits: HabitRow[];
  loading: boolean;
  load: (d?: string) => Promise<void>;
  add: (input: Omit<Habit, 'id' | 'createdAt'>) => Promise<void>;
  toggle: (habitId: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useHabits = create<HabitsState>((set, get) => ({
  date: todayISO(),
  habits: [],
  loading: false,
  load: async (d) => {
    set({ loading: true });
    const date = d || get().date;
    const base = await HabitsRepo.getHabitsWithLogs(date);
    const withStreaks: HabitRow[] = [];
    for (const h of base) {
      const streak = await HabitsRepo.getHabitStreak(h.id);
      withStreaks.push({ ...h, streak });
    }
    set({ habits: withStreaks, loading: false, date });
  },
  add: async (input) => {
    await HabitsRepo.addHabit(input);
    await get().load();
  },
  toggle: async (habitId) => {
    const wasDone = get().habits.find(h => h.id === habitId)?.doneToday;
    await HabitsRepo.toggleHabitLog(habitId, get().date);
    await get().load();
    // فحص الإنجازات
    if (!wasDone) {
      try {
        const newAch = await checkForNewAchievements();
        if (newAch.length > 0) {
          useRewards.setState({ lastAchievement: newAch[0] });
          setTimeout(() => useRewards.setState({ lastAchievement: null }), 6500);
        }
      } catch (e) { console.warn('[ach-habits]', e); }
    }
  },
  remove: async (id) => {
    await HabitsRepo.deleteHabit(id);
    await get().load();
  },
}));
