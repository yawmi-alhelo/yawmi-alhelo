import { getDB } from '../db';
import { getRewards } from '../rewards';

import { ACHIEVEMENTS, type AchievementDef, type AchievementMetric } from './definitions';

export interface AchievementStatus {
  def: AchievementDef;
  unlocked: boolean;
  progress: number;   // 0 - threshold
  percent: number;    // 0-100
  unlockedAt?: string;
}

export async function getUnlockedIds(): Promise<Set<string>> {
  try {
    const db = await getDB();
    const all = await db.getAll('achievements');
    return new Set(all.map(a => a.id));
  } catch { return new Set(); }
}

export async function unlockAchievement(id: string): Promise<boolean> {
  const db = await getDB();
  const existing = await db.get('achievements', id);
  if (existing) return false;
  await db.put('achievements', { id, unlockedAt: new Date().toISOString() });
  return true;
}

export async function getMetrics(): Promise<Record<AchievementMetric, number>> {
  const rewards = await getRewards();
  
  // عدد جلسات التركيز
  let focusSessions = 0;
  try {
    const db = await getDB();
    const sessions = await db.getAll('focusSessions');
    focusSessions = sessions.filter((s: any) => s.completed && s.type === 'focus').length;
  } catch {}
  
  // عدد العادات
  let habitsCount = 0;
  try {
    const db = await getDB();
    const habits = await db.getAll('habits');
    habitsCount = habits.length;
  } catch {}
  
  // عدد الوصفات
  let cookingCount = 0;
  try {
    const db = await getDB();
    const favs = await db.getAll('favorites');
    cookingCount = favs.length;
  } catch {}
  
  // المجموعة (تقريبي — من DB المحلي)
  let members = 0;
  try {
    const db = await getDB();
    const settings = await db.get('settings', 'app');
    if (settings?.groupId) members = 1;  // عضو واحد على الأقل
  } catch {}
  
  // الرسائل (تقريبي)
  let messages = 0;
  // ما نقدر نجيبها بدون Supabase — نتجاهلها للآن
  
  return {
    tasksCompleted: rewards.tasksCompleted || 0,
    streak: rewards.streak || 0,
    focusSessions,
    habitsCount,
    cookingCount,
    points: rewards.points || 0,
    messages,
    members,
  };
}

export async function getAllAchievementStatuses(): Promise<AchievementStatus[]> {
  const [unlocked, metrics] = await Promise.all([getUnlockedIds(), getMetrics()]);
  return ACHIEVEMENTS.map(def => {
    const progress = metrics[def.metric] || 0;
    const percent = Math.min(100, Math.round((progress / def.threshold) * 100));
    return {
      def,
      unlocked: unlocked.has(def.id),
      progress: Math.min(progress, def.threshold),
      percent,
      unlockedAt: undefined,
    };
  });
}

// التحقق من الإنجازات الجديدة بعد أي عملية
export async function checkForNewAchievements(): Promise<AchievementDef[]> {
  const [unlocked, metrics] = await Promise.all([getUnlockedIds(), getMetrics()]);
  const newlyUnlocked: AchievementDef[] = [];
  
  for (const def of ACHIEVEMENTS) {
    if (unlocked.has(def.id)) continue;
    const value = metrics[def.metric] || 0;
    if (value >= def.threshold) {
      const wasNew = await unlockAchievement(def.id);
      if (wasNew) newlyUnlocked.push(def);
    }
  }
  
  return newlyUnlocked;
}

export function getTotalTitles(): string[] {
  return ACHIEVEMENTS.filter(a => a.title).map(a => a.title!);
}
