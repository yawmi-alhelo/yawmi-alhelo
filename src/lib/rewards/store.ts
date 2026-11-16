import { getDB } from '../db';

const REWARDS_KEY = 'state';

export interface RewardState {
  points: number;
  flowers: number;
  tasksCompleted: number;
  streak: number;
  lastCompletionAt: string;
  milestones: string[];
}

const DEFAULT_REWARDS: RewardState = {
  points: 0,
  flowers: 0,
  tasksCompleted: 0,
  streak: 0,
  lastCompletionAt: '',
  milestones: [],
};

const POINTS_PER_TASK = 10;
const TASKS_PER_FLOWER = 5;

export async function getRewards(): Promise<RewardState> {
  // console.log('[Rewards] قراءة');
  try {
    const db = await getDB();
    const s = await db.get('rewards', REWARDS_KEY);
    return s ? { ...DEFAULT_REWARDS, ...s } : DEFAULT_REWARDS;
  } catch {
    return DEFAULT_REWARDS;
  }
}

export interface CompleteResult {
  newPoints: number;
  newFlowers: number;
  flowerUnlocked: boolean;
  pointsEarned: number;
  level: number;
  levelProgress: number;
  newStreak: number;
}

// حساب الستريك: نفس اليوم = لا يتغير، الأمس = +1، أكثر = يرجع 1
function computeStreak(current: RewardState): number {
  if (!current.lastCompletionAt) return 1;
  const last = new Date(current.lastCompletionAt);
  const now = new Date();
  const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.round((today - lastDay) / 86400000);
  if (diffDays === 0) return Math.max(1, current.streak || 1);
  if (diffDays === 1) return (current.streak || 0) + 1;
  return 1;
}

export async function recordCompletion(): Promise<CompleteResult> {
  console.log('[Rewards] recordCompletion بدأت');
  const db = await getDB();
  const current = await getRewards();
  const newPoints = current.points + POINTS_PER_TASK;
  const newTasksCount = current.tasksCompleted + 1;
  const newFlowers = Math.floor(newTasksCount / TASKS_PER_FLOWER);
  const flowerUnlocked = newFlowers > current.flowers;
  const newStreak = computeStreak(current);

  const updated: RewardState = {
    points: newPoints,
    flowers: newFlowers,
    tasksCompleted: newTasksCount,
    streak: newStreak,
    lastCompletionAt: new Date().toISOString(),
    milestones: flowerUnlocked
      ? [...current.milestones, `flower_${newFlowers}`]
      : current.milestones,
  };
  await db.put('rewards', updated, REWARDS_KEY);
  console.log('[Rewards] حفظت:', updated);

  const level = Math.floor(newPoints / 100) + 1;
  const levelProgress = newPoints % 100;

  return {
    newPoints,
    newFlowers,
    flowerUnlocked,
    pointsEarned: POINTS_PER_TASK,
    level,
    levelProgress,
    newStreak,
  };
}

export async function resetRewards(): Promise<void> {
  const db = await getDB();
  await db.put('rewards', DEFAULT_REWARDS, REWARDS_KEY);
}

export function flowerEmoji(count: number): string {
  if (count === 0) return '🌱';
  if (count < 3) return '🌷';
  if (count < 6) return '🌹';
  if (count < 10) return '🌻';
  if (count < 15) return '💐';
  return '👑';
}
