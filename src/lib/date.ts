import { ARABIC_DAYS, ARABIC_MONTHS, type PeriodType } from '../types';

export function todayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return todayISO(dt);
}

export function formatDateAr(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${ARABIC_DAYS[dt.getDay()]} ${d} ${ARABIC_MONTHS[m - 1]} ${y}`;
}

export function formatTimeAr(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h < 12 ? 'ص' : 'م';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function greetingAr(hour: number): string {
  if (hour >= 5 && hour < 12) return 'صباح الخير يا وردة 🌷';
  if (hour >= 12 && hour < 17) return 'نهارك سعيد يا قمرة ☀️';
  if (hour >= 17 && hour < 21) return 'مساء الخير يا حلوة 🌸';
  return 'تصبحين على خير 🌙';
}

export function getPeriodNow(hour: number): PeriodType {
  if (hour >= 5 && hour < 9) return 'morning';
  if (hour >= 9 && hour < 12) return 'beforeNoon';
  if (hour >= 12 && hour < 15) return 'noon';
  if (hour >= 15 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 20) return 'maghrib';
  if (hour >= 20 && hour < 23) return 'evening';
  return 'beforeSleep';
}

export function weekRange(iso: string): { start: string; end: string } {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const dayOfWeek = dt.getDay(); // 0=Sun in JS
  const start = addDays(iso, -dayOfWeek);
  const end = addDays(start, 6);
  return { start, end };
}

export function monthRange(iso: string): { start: string; end: string } {
  const [y, m] = iso.split('-').map(Number);
  const start = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}

export function addMinutesToTime(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}
