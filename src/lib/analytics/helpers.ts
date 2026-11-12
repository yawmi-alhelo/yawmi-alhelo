import { Tasks as TasksRepo } from '../repositories';
import { addDays, todayISO, monthRange, weekRange } from '../date';
import type { PeriodType, Task } from '../../types';
import { PERIOD_ORDER } from '../../types';

export interface HourBucket {
  hour: number;     // 0-23
  count: number;
  dayLabel: 'صباح' | 'ظهر' | 'مساء' | 'ليل';
}

export function classifyHour(h: number): HourBucket['dayLabel'] {
  if (h >= 5 && h < 12) return 'صباح';
  if (h >= 12 && h < 17) return 'ظهر';
  if (h >= 17 && h < 21) return 'مساء';
  return 'ليل';
}

export async function getCompletedTasksThisMonth(): Promise<Task[]> {
  const today = todayISO();
  const m = monthRange(today);
  const tasks = await TasksRepo.getTasksRange(m.start, m.end);
  return tasks.filter(t => t.completed && t.completedAt);
}

export function getHourlyProductivity(tasks: Task[]): HourBucket[] {
  const buckets: HourBucket[] = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: 0,
    dayLabel: classifyHour(h),
  }));
  for (const t of tasks) {
    if (!t.completedAt) continue;
    const d = new Date(t.completedAt);
    const h = d.getHours();
    if (h >= 0 && h < 24) buckets[h].count++;
  }
  return buckets;
}

export function getBestTimeOfDay(buckets: HourBucket[]): {
  label: string;
  count: number;
  emoji: string;
} {
  const groups: Record<string, number> = { 'صباح': 0, 'ظهر': 0, 'مساء': 0, 'ليل': 0 };
  for (const b of buckets) groups[b.dayLabel] += b.count;
  const best = Object.entries(groups).sort((a, b) => b[1] - a[1])[0];
  const emojis: Record<string, string> = { 'صباح': '🌅', 'ظهر': '☀️', 'مساء': '🌇', 'ليل': '🌙' };
  return { label: best[0], count: best[1], emoji: emojis[best[0]] };
}

export async function getTopPeriods(): Promise<Array<{ period: PeriodType; count: number }>> {
  const tasks = await getCompletedTasksThisMonth();
  const map = new Map<PeriodType, number>();
  for (const t of tasks) {
    map.set(t.period, (map.get(t.period) || 0) + 1);
  }
  return PERIOD_ORDER
    .map(p => ({ period: p, count: map.get(p) || 0 }))
    .filter(x => x.count > 0)
    .sort((a, b) => b.count - a.count);
}

export async function getTopCategories(): Promise<Array<{ name: string; count: number }>> {
  const tasks = await getCompletedTasksThisMonth();
  const map = new Map<string, number>();
  for (const t of tasks) {
    const cat = (t.category || '').trim();
    if (!cat) continue;
    map.set(cat, (map.get(cat) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export async function getWeekdayPattern(): Promise<Array<{ day: string; count: number }>> {
  const today = todayISO();
  const w = weekRange(today);
  const tasks = await TasksRepo.getTasksRange(w.start, w.end);
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const map = new Map<string, number>();
  for (const t of tasks) {
    if (!t.completed) continue;
    const d = new Date(t.date);
    map.set(days[d.getDay()], (map.get(days[d.getDay()]) || 0) + 1);
  }
  return days.map(day => ({ day, count: map.get(day) || 0 }));
}

export async function getComparison(): Promise<{
  thisWeek: number;
  lastWeek: number;
  change: number;  // نسبة مئوية (+/-)
}> {
  const today = todayISO();
  const w = weekRange(today);
  const lastWeekStart = addDays(w.start, -7);
  const lastWeekEnd = addDays(w.end, -7);
  const thisWeekTasks = await TasksRepo.getTasksRange(w.start, w.end);
  const lastWeekTasks = await TasksRepo.getTasksRange(lastWeekStart, lastWeekEnd);
  const thisWeek = thisWeekTasks.filter(t => t.completed).length;
  const lastWeek = lastWeekTasks.filter(t => t.completed).length;
  const change = lastWeek === 0 ? (thisWeek > 0 ? 100 : 0) : Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  return { thisWeek, lastWeek, change };
}
