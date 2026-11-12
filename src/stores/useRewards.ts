import { create } from 'zustand';
import { getRewards, recordCompletion, type RewardState } from '../lib/rewards';
import { syncMyStats } from '../lib/group';
import { useSettings } from './useSettings';
import { checkForNewAchievements } from '../lib/achievements';

interface RewardsStore {
  state: RewardState;
  loaded: boolean;
  lastUnlock: { flowerUnlocked: boolean; pointsEarned: number; newPoints: number } | null;
  lastTierUnlock: { name: string; emoji: string } | null;
  lastAchievement: any | null;
  load: () => Promise<void>;
  complete: () => Promise<void>;
  clearUnlock: () => void;
}

export const useRewards = create<RewardsStore>((set, get) => ({
  state: { points: 0, flowers: 0, tasksCompleted: 0, streak: 0, lastCompletionAt: '', milestones: [] },
  loaded: false,
  lastUnlock: null,
  lastTierUnlock: null,
  lastAchievement: null,
  load: async () => {
    const s = await getRewards();
    set({ state: s, loaded: true });
  },
  complete: async () => {
    const prev = get().state;
    const prevTier = get().state ? (await import('../lib/rewards/levels')).getLevelTier(prev.points) : null;
    const r = await recordCompletion();
    const s = await getRewards();
    const { getLevelTier } = await import('../lib/rewards/levels');
    const newTier = getLevelTier(s.points);
    const tierChanged = prevTier && prevTier.name !== newTier.name;
    
    set({
      state: s,
      lastUnlock: {
        flowerUnlocked: r.flowerUnlocked,
        pointsEarned: r.pointsEarned,
        newPoints: r.newPoints,
      },
      lastTierUnlock: tierChanged ? { name: newTier.name, emoji: newTier.emoji } : null,
    });
    // مزامنة تلقائية مع المجموعة
    const settings = useSettings.getState().settings;
    if (settings.groupId && settings.deviceId) {
      syncMyStats(settings.groupId, settings.deviceId, {
        level: Math.floor(s.points / 100) + 1,
        points: s.points,
        streak: r.newStreak || 0,
        flowers: s.flowers,
        title: settings.activeTitle || '',
      }).catch(e => console.warn('[sync] فشل:', e));
    }
    // فحص الإنجازات الجديدة
    try {
      const newAchievements = await checkForNewAchievements();
      if (newAchievements.length > 0) {
        set({ lastAchievement: newAchievements[0] });
        setTimeout(() => set({ lastAchievement: null }), 6500);
      }
    } catch (e) {
      console.warn('[achievements] فشل الفحص:', e);
    }
    // مسح تلقائي بعد 3 ثواني
    setTimeout(() => {
      if (get().lastUnlock) set({ lastUnlock: null });
      if (get().lastTierUnlock) set({ lastTierUnlock: null });
    }, 3500);
  },
  clearUnlock: () => set({ lastUnlock: null }),
}));
