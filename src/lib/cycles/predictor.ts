import type { CycleRecord } from './types';
import { addDays } from '../date';

export interface CyclePrediction {
  currentCycleDay: number | null;   // اليوم الحالي من الدورة
  daysUntilNext: number | null;      // كم باقي للدورة القادمة
  nextStartDate: string | null;      // تاريخ البدء المتوقع
  avgCycleLength: number;            // متوسط طول الدورة
  isLate: boolean;                   // إذا فاتت الموعد
  isCurrentlyActive: boolean;        // هل هي في فترة الدورة الآن
}

export function predictCycle(
  cycles: CycleRecord[],
  defaultCycleLength: number,
  defaultPeriodLength: number,
  todayISO: string
): CyclePrediction {
  if (cycles.length === 0) {
    return {
      currentCycleDay: null,
      daysUntilNext: null,
      nextStartDate: null,
      avgCycleLength: defaultCycleLength,
      isLate: false,
      isCurrentlyActive: false,
    };
  }

  const sorted = [...cycles].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const last = sorted[0];

  // حساب متوسط طول الدورة من السجلات
  let avgLength = defaultCycleLength;
  if (sorted.length >= 2) {
    const gaps: number[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const [y1, m1, d1] = sorted[i].startDate.split('-').map(Number);
      const [y2, m2, d2] = sorted[i + 1].startDate.split('-').map(Number);
      const gap = Math.round(
        (new Date(y1, m1 - 1, d1).getTime() - new Date(y2, m2 - 1, d2).getTime()) / 86400000
      );
      if (gap > 15 && gap < 60) gaps.push(gap);
    }
    if (gaps.length > 0) {
      avgLength = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    }
  }

  // اليوم الحالي من الدورة = الفرق بين اليوم وتاريخ بداية آخر دورة
  const [ly, lm, ld] = last.startDate.split('-').map(Number);
  const [ty, tm, td] = todayISO.split('-').map(Number);
  const lastDate = new Date(ly, lm - 1, ld);
  const todayDate = new Date(ty, tm - 1, td);
  const daysSinceStart = Math.round((todayDate.getTime() - lastDate.getTime()) / 86400000);
  const currentCycleDay = daysSinceStart + 1;

  // هل هي في فترة الدورة الآن؟
  const periodLen = last.endDate
    ? Math.round((new Date(last.endDate).getTime() - lastDate.getTime()) / 86400000) + 1
    : defaultPeriodLength;
  const isCurrentlyActive = daysSinceStart >= 0 && daysSinceStart < periodLen;

  // التاريخ المتوقع للدورة القادمة
  const nextStartDate = addDays(last.startDate, avgLength);
  const [ny, nm, nd] = nextStartDate.split('-').map(Number);
  const nextDate = new Date(ny, nm - 1, nd);
  const daysUntilNext = Math.round((nextDate.getTime() - todayDate.getTime()) / 86400000);

  return {
    currentCycleDay: daysSinceStart >= 0 ? currentCycleDay : null,
    daysUntilNext: daysUntilNext >= 0 ? daysUntilNext : null,
    nextStartDate,
    avgCycleLength: avgLength,
    isLate: daysUntilNext < 0,
    isCurrentlyActive,
  };
}
