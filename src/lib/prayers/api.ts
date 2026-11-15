import type { PrayerTimes, PrayerName } from './types';

const CACHE_KEY = 'yawmi_prayer_v1';

function cacheKey(date: string, lat: number, lng: number) {
  return `${CACHE_KEY}_${date}_${lat.toFixed(2)}_${lng.toFixed(2)}`;
}

export async function fetchPrayerTimes(
  date: string, latitude: number, longitude: number
): Promise<PrayerTimes | null> {
  try {
    const [y, m, d] = date.split('-');
    const url = `https://api.aladhan.com/v1/timings/${d}-${m}-${y}?latitude=${latitude}&longitude=${longitude}&method=3`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const json = await res.json();
    const t = json?.data?.timings;
    if (!t) return null;

    const result: PrayerTimes = {
      date,
      fajr: (t.Fajr || '04:30').slice(0, 5),
      sunrise: (t.Sunrise || '06:00').slice(0, 5),
      dhuhr: (t.Dhuhr || '12:00').slice(0, 5),
      asr: (t.Asr || '15:30').slice(0, 5),
      maghrib: (t.Maghrib || '18:00').slice(0, 5),
      isha: (t.Isha || '19:30').slice(0, 5),
      fetchedAt: new Date().toISOString(),
      latitude, longitude,
    };
    try { localStorage.setItem(cacheKey(date, latitude, longitude), JSON.stringify(result)); } catch { /* ignore */ }
    return result;
  } catch {
    return null;
  }
}

export function getCachedPrayerTimes(date: string, lat: number, lng: number): PrayerTimes | null {
  try {
    const raw = localStorage.getItem(cacheKey(date, lat, lng));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function getNextPrayer(times: PrayerTimes, now = new Date()): { name: PrayerName; time: string; diffMin: number } | null {
  const order: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (const p of order) {
    const time = (times as unknown as Record<string, string>)[p];
    if (!time) continue;
    const [h, m] = time.split(':').map(Number);
    const tmin = h * 60 + m;
    if (tmin > nowMin) {
      return { name: p, time, diffMin: tmin - nowMin };
    }
  }
  return { name: 'fajr', time: times.fajr, diffMin: (24 * 60 - nowMin) + parseInt(times.fajr.split(':')[0]) * 60 + parseInt(times.fajr.split(':')[1]) };
}
