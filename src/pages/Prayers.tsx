import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Bell, RefreshCw, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useSettings } from '../stores/useSettings';
import { fetchPrayerTimes, getCachedPrayerTimes, getNextPrayer } from '../lib/prayers/api';
import { PRAYER_LABELS, PRAYER_EMOJIS, IRAQI_CITIES, type PrayerTimes, type PrayerName } from '../lib/prayers/types';
import { todayISO, formatTimeAr } from '../lib/date';

export default function Prayers() {
  const nav = useNavigate();
  const { settings, update } = useSettings();
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const date = todayISO();
      const cached = getCachedPrayerTimes(date, settings.prayerLatitude, settings.prayerLongitude);
      if (cached) setTimes(cached);
      const fresh = await fetchPrayerTimes(date, settings.prayerLatitude, settings.prayerLongitude);
      if (fresh) setTimes(fresh);
      setLoading(false);
    })();
  }, [settings.prayerLatitude, settings.prayerLongitude]);

  const next = times ? getNextPrayer(times, now) : null;
  const prayerOrder: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

  async function changeCity(cityName: string) {
    const city = IRAQI_CITIES.find(c => c.name === cityName);
    if (!city) return;
    await update({ prayerCity: city.name, prayerLatitude: city.lat, prayerLongitude: city.lng });
  }

  async function refresh() {
    setLoading(true);
    const date = todayISO();
    const fresh = await fetchPrayerTimes(date, settings.prayerLatitude, settings.prayerLongitude);
    if (fresh) setTimes(fresh);
    setLoading(false);
  }

  return (
    <Layout>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => nav(-1)} className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-[#34343f]">
          <ArrowRight size={20} className="text-ink-700 dark:text-rose-100" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">مواقيت الصلاة 🕌</h1>
          <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-0.5 flex items-center gap-1">
            <MapPin size={10} /> {settings.prayerCity}
          </p>
        </div>
        <button onClick={refresh} disabled={loading} className="p-2 rounded-full bg-rose-100 dark:bg-[#34343f] text-rose-500">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-bold text-ink-500 dark:text-rose-300/80 mb-2 px-1">المدينة</label>
        <select
          value={settings.prayerCity}
          onChange={e => changeCity(e.target.value)}
          className="w-full px-4 py-3 rounded-xl2 bg-white dark:bg-[#252532] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400"
        >
          {IRAQI_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {next && times && (
        <div className="card-soft mb-4 text-center py-6"
          style={{ background: 'linear-gradient(135deg, rgba(255,143,177,0.15) 0%, rgba(184,164,236,0.15) 100%)' }}>
          <div className="text-5xl mb-2">{PRAYER_EMOJIS[next.name]}</div>
          <p className="text-xs font-bold text-rose-500 mb-1">الصلاة القادمة</p>
          <p className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">{PRAYER_LABELS[next.name]}</p>
          <p className="text-sm text-ink-500 dark:text-rose-300/80 mt-1">
            {formatTimeAr(next.time)} · بعد {Math.floor(next.diffMin / 60)} س {next.diffMin % 60} د
          </p>
        </div>
      )}

      {loading && !times ? (
        <div className="card-soft text-center py-8">
          <Loader2 size={24} className="mx-auto animate-spin text-rose-400 mb-2" />
          <p className="text-sm text-ink-500">جاري التحميل...</p>
        </div>
      ) : times ? (
        <div className="space-y-2 mb-4">
          {prayerOrder.map(name => {
            const time = (times as any)[name] as string;
            const isNext = next?.name === name;
            return (
              <div key={name} className={`card-soft flex items-center gap-3 ${isNext ? 'border-2 border-rose-300' : ''}`}>
                <div className="text-3xl">{PRAYER_EMOJIS[name]}</div>
                <div className="flex-1">
                  <p className="font-bold text-ink-900 dark:text-rose-100">{PRAYER_LABELS[name]}</p>
                </div>
                <p className="text-lg font-extrabold text-rose-500 tabular-nums">{formatTimeAr(time)}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-soft text-center py-6 text-sm text-ink-500">
          ما قدرت أجيب المواقيت، تأكدي من الإنترنت
        </div>
      )}

      <div className="card-soft">
        <div className="flex items-center gap-3 mb-3">
          <Bell size={18} className="text-rose-500" />
          <p className="font-bold text-ink-900 dark:text-rose-100 text-sm">تذكيرات الصلاة</p>
        </div>
        <p className="text-xs text-ink-500 dark:text-rose-300/80 mb-3">
          تفعيل التذكيرات للصلاة القادمة
        </p>
        <label className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-700 dark:text-rose-200">تفعيل التذكيرات</span>
          <button
            onClick={() => update({ prayerNotifications: !settings.prayerNotifications })}
            className={`relative w-12 h-7 rounded-full transition-colors ${settings.prayerNotifications ? 'bg-rose-400' : 'bg-rose-100 dark:bg-[#34343f]'}`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${settings.prayerNotifications ? 'right-1' : 'right-6'}`} />
          </button>
        </label>
      </div>
    </Layout>
  );
}
