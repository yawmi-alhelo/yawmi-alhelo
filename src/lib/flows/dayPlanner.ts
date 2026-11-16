import type { DayPlanResult } from './types';
import { TASK_PRESETS } from './presets';
import type { PeriodType } from '../../types';


const PERIOD_ORDER: PeriodType[] = [
  'morning', 'beforeNoon', 'noon', 'afternoon', 'maghrib', 'evening', 'beforeSleep',
];

type PresetItem = typeof TASK_PRESETS[number];

function getSelectedPresets(ids: string[]): PresetItem[] {
  return ids
    .map(id => TASK_PRESETS.find(p => p.id === id))
    .filter((p): p is PresetItem => p !== undefined);
}

function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function formatHM(totalMin: number): string {
  const t = ((totalMin % 1440) + 1440) % 1440;
  const h = Math.floor(t / 60);
  const m = t % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// fallback محلي — جدولة تسلسلية من وقت البدء
export function buildLocalDayPlan(
  selectedTaskIds: string[],
  _hours: number,
  startTime: string
): DayPlanResult {
  const selected = getSelectedPresets(selectedTaskIds);
  if (selected.length === 0) {
    return { tasks: [], summary: 'ما اخترتي شي 🌸', source: 'local' };
  }

  // ترتيب حسب الفترة (الصبح أولاً)
  const sorted = [...selected].sort(
    (a, b) => PERIOD_ORDER.indexOf(a.defaultPeriod) - PERIOD_ORDER.indexOf(b.defaultPeriod)
  );

  const BREAK = 15;

  const tasks: DayPlanResult['tasks'] = [];
  let cursor = minutesOf(startTime);
  let used = 0;

  for (const preset of sorted) {
    // removed break to force all tasks
    tasks.push({
      title: preset.label,
      period: preset.defaultPeriod,
      time: formatHM(cursor),
      duration: preset.defaultDuration,
      emoji: preset.emoji,
    });
    used += preset.defaultDuration;
    cursor += preset.defaultDuration + BREAK;
  }

  if (tasks.length === 0) {
    return { tasks: [], summary: 'الوقت ما يكفي 😅 اختاري وقت أطول', source: 'local' };
  }

  const endMin = minutesOf(tasks[tasks.length - 1].time) + tasks[tasks.length - 1].duration;
  const summary = `من ${startTime} إلى ${formatHM(endMin)} — ${tasks.length} شغلة بمجموع ${Math.round(used / 60 * 10) / 10} ساعة`;

  return { tasks, summary, source: 'local' };
}

export async function planDay(opts: {
  selectedTaskIds: string[];
  hours: number;
  startTime: string;
  apiKey?: string;
  model?: string;
}): Promise<DayPlanResult> {
  const { selectedTaskIds, hours, startTime } = opts;
  
  // نستخدم المخطط المحلي دائماً لضمان إضافة 100% من المهام
  // مع 0 توكنات، وبدء دقيق من الوقت المحدد
  return buildLocalDayPlan(selectedTaskIds, hours, startTime);
}
