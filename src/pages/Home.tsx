import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckCircle2, Circle, Calendar as CalIcon } from 'lucide-react';
import Layout from '../components/Layout';
import CircleProgress from '../components/CircleProgress';
import { useTasks } from '../stores/useTasks';
import { useSettings } from '../stores/useSettings';
import { formatDateAr, formatTimeAr, greetingAr, getPeriodNow, todayISO, addMinutesToTime } from '../lib/date';
import { PERIOD_LABELS, PRIORITY_LABELS, type Task } from '../types';
import { getRandomVerse, getRandomDua, type Verse, type Dua } from '../lib/quran/verses';
import { fetchPrayerTimes, getCachedPrayerTimes, getNextPrayer } from '../lib/prayers/api';
import { PRAYER_LABELS, PRAYER_EMOJIS, type PrayerName, type PrayerTimes } from '../lib/prayers/types';

// 🕐 مكوّن الساعة بعقارب
function AnalogClock({ time }: { time: Date }) {
  const h = time.getHours() % 12;
  const m = time.getMinutes();
  const s = time.getSeconds();

  const secondAngle = s * 6;
  const minuteAngle = m * 6 + s * 0.1;
  const hourAngle = h * 30 + m * 0.5;

  return (
    <svg viewBox="0 0 100 100" className="w-32 h-32 drop-shadow-lg">
      <defs>
        <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8FB1" />
          <stop offset="100%" stopColor="#B8A4EC" />
        </linearGradient>
        <radialGradient id="faceGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFF5F8" />
        </radialGradient>
      </defs>

      {/* الإطار الخارجي */}
      <circle cx="50" cy="50" r="48" fill="url(#rimGrad)" />
      <circle cx="50" cy="50" r="43" fill="url(#faceGrad)" className="dark:fill-[#252532]" />

      {/* علامات الساعات */}
      {[...Array(12)].map((_, i) => {
        const isMain = i % 3 === 0;
        return (
          <line
            key={i}
            x1="50"
            y1={isMain ? 12 : 14}
            x2="50"
            y2={isMain ? 18 : 16}
            stroke={isMain ? '#E56A8E' : '#FFC8D6'}
            strokeWidth={isMain ? 2.2 : 1}
            strokeLinecap="round"
            transform={`rotate(${i * 30} 50 50)`}
          />
        );
      })}

      {/* عقرب الساعات */}
      <line
        x1="50" y1="50" x2="50" y2="30"
        stroke="#E56A8E" strokeWidth="3.5" strokeLinecap="round"
        transform={`rotate(${hourAngle} 50 50)`}
      />

      {/* عقرب الدقائق */}
      <line
        x1="50" y1="50" x2="50" y2="18"
        stroke="#FF8FB1" strokeWidth="2.5" strokeLinecap="round"
        transform={`rotate(${minuteAngle} 50 50)`}
      />

      {/* عقرب الثواني */}
      <line
        x1="50" y1="56" x2="50" y2="14"
        stroke="#B8A4EC" strokeWidth="1.2" strokeLinecap="round"
        transform={`rotate(${secondAngle} 50 50)`}
      />

      {/* المركز */}
      <circle cx="50" cy="50" r="3.5" fill="#E56A8E" />
      <circle cx="50" cy="50" r="1.5" fill="#FFFFFF" />
    </svg>
  );
}

// ⏱️ تحويل الفارق الزمني لنص مختصر
function formatDiff(ms: number) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0 && mins > 0) return `${hours} س و ${mins} د`;
  if (hours > 0) return `${hours} ساعة`;
  if (mins > 0) return `${mins} دقيقة`;
  return 'أقل من دقيقة';
}

export default function Home() {
  const nav = useNavigate();
  const { tasks, load, toggle } = useTasks();
  const { settings } = useSettings();
  const [now, setNow] = useState(new Date());
  const [verse, setVerse] = useState<Verse>(() => getRandomVerse());
  const [dua, setDua] = useState<Dua>(() => getRandomDua());
  const [refreshKey, setRefreshKey] = useState(0);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);

  useEffect(() => {
    load(todayISO());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    setVerse(getRandomVerse());
    setDua(getRandomDua());
  }, [refreshKey]);

  useEffect(() => {
    (async () => {
      const d = todayISO();
      const cached = getCachedPrayerTimes(d, settings.prayerLatitude, settings.prayerLongitude);
      if (cached) setPrayerTimes(cached);
      const fresh = await fetchPrayerTimes(d, settings.prayerLatitude, settings.prayerLongitude);
      if (fresh) setPrayerTimes(fresh);
    })();
  }, [settings.prayerLatitude, settings.prayerLongitude]);

  const completed = tasks.filter(t => t.completed).length;
  const remaining = tasks.length - completed;
  const percent = tasks.length === 0 ? 0 : (completed / tasks.length) * 100;
  const currentPeriod = getPeriodNow(now.getHours());

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const upcomingTasks = tasks
    .filter(t => !t.completed)
    .filter(t => {
      if (!t.scheduledTime) return true;
      const [h, m] = t.scheduledTime.split(':').map(Number);
      return h * 60 + m > nowMin;
    })
    .sort((a, b) => (a.scheduledTime || '99:99').localeCompare(b.scheduledTime || '99:99'));
  const nextTask = upcomingTasks[0];

  // العداد التنازلي
  let countdownText = '';
  if (nextTask && nextTask.scheduledTime) {
    const [hh, mm] = nextTask.scheduledTime.split(':').map(Number);
    const taskTime = new Date(now);
    taskTime.setHours(hh, mm, 0, 0);
    const diffMs = taskTime.getTime() - now.getTime();
    if (diffMs > 0) {
      countdownText = `يبدأ بعد ${formatDiff(diffMs)}`;
    } else if (nextTask.durationMinutes) {
      const endTime = new Date(taskTime.getTime() + nextTask.durationMinutes * 60000);
      const endDiff = endTime.getTime() - now.getTime();
      countdownText = endDiff > 0 ? `ينتهي بعد ${formatDiff(endDiff)}` : 'فات وقته';
    }
  }

  const overdueCount = tasks.filter(t => {
    if (t.completed || !t.scheduledTime) return false;
    const [h, m] = t.scheduledTime.split(':').map(Number);
    return h * 60 + m <= nowMin;
  }).length;

  const hours = now.getHours();
  const ampm = hours >= 12 ? 'م' : 'ص';
  const h12 = hours % 12 || 12;
  const timeText = `${String(h12).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">
          {greetingAr(now.getHours())}
          {settings.syncUsername ? ` يا ${settings.syncUsername}` : ''}
        </h1>
        <p className="text-sm text-ink-500 dark:text-rose-300/80 mt-1">{formatDateAr(todayISO())}</p>
      </div>

      {/* آية ودعاء اليوم — يتغيران كل فتح */}
      <div className="card-soft mb-3 p-4"
        style={{ background: 'linear-gradient(135deg, rgba(255,143,177,0.12) 0%, rgba(184,164,236,0.12) 100%)' }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📖</span>
          <p className="text-xs font-bold text-rose-500">آية ودعاء</p>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="mr-auto text-xs text-rose-500 font-semibold flex items-center gap-1 active:scale-90"
          >
            🔄 جديد
          </button>
        </div>
        <p className="text-base font-bold text-ink-900 dark:text-rose-100 leading-relaxed text-center mb-3">
          ﴿ {verse.text} ﴾
        </p>
        <p className="text-[10px] text-ink-500 dark:text-rose-300/80 text-center mb-3">— {verse.ref}</p>
        <div className="border-t border-rose-100 dark:border-[#34343f] pt-3">
          <p className="text-xs font-bold text-lavender-300 mb-2 text-center">🤲 مناجاة</p>
          <p className="text-sm text-ink-700 dark:text-rose-200 leading-relaxed text-center">
            {dua.text}
          </p>
          <p className="text-[10px] text-ink-500 dark:text-rose-300/80 text-center mt-2">— {dua.source}</p>
        </div>
      </div>

      {/* الصلاة القادمة */}
      {prayerTimes && (() => {
        const np = getNextPrayer(prayerTimes, now);
        if (!np) return null;
        return (
          <div onClick={() => nav('/prayers')} className="card-soft mb-4 cursor-pointer active:scale-[0.98] transition-transform flex items-center gap-3">
            <div className="text-4xl">{PRAYER_EMOJIS[np.name as PrayerName]}</div>
            <div className="flex-1">
              <p className="text-xs text-ink-500 dark:text-rose-300/80">الصلاة القادمة</p>
              <p className="font-extrabold text-ink-900 dark:text-rose-100">{PRAYER_LABELS[np.name as PrayerName]}</p>
              <p className="text-xs text-rose-500 font-bold">
                {formatTimeAr(np.time)} · بعد {Math.floor(np.diffMin / 60)} س {np.diffMin % 60} د
              </p>
            </div>
          </div>
        );
      })()}

      {/* الساعة بعقارب */}
      <div className="card-soft mb-4 flex items-center justify-between p-5">
        <div className="flex flex-col items-center gap-2">
          <AnalogClock time={now} />
          <div className="flex items-baseline gap-1" dir="ltr">
            <span className="text-sm font-extrabold text-ink-700 dark:text-rose-100 tabular-nums">{timeText}</span>
            <span className="text-xs font-bold text-rose-400">{ampm}</span>
          </div>
        </div>
        <div className="text-left">
          <p className="text-xs text-ink-500 dark:text-rose-300/80 mb-1">الفترة الحالية</p>
          <p className="text-xl font-extrabold text-lavender-300">{PERIOD_LABELS[currentPeriod]}</p>
          <p className="text-[10px] text-ink-500 dark:text-rose-300/60 mt-3">الوقت الآن</p>
        </div>
      </div>

      {/* نسبة الإنجاز */}
      <div className="card-soft mb-4 flex flex-col items-center py-6">
        <CircleProgress value={percent} label="إنجاز اليوم" />
        <div className="flex gap-6 mt-5 w-full">
          <div className="flex-1 text-center">
            <p className="text-xs text-ink-500 dark:text-rose-300/80 mb-1">خلصتي</p>
            <p className="text-xl font-extrabold text-mint-300">{completed}</p>
          </div>
          <div className="flex-1 text-center border-x border-rose-100 dark:border-[#34343f]">
            <p className="text-xs text-ink-500 dark:text-rose-300/80 mb-1">باقي</p>
            <p className="text-xl font-extrabold text-peach-300">{remaining}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-xs text-ink-500 dark:text-rose-300/80 mb-1">المجموع</p>
            <p className="text-xl font-extrabold text-rose-400">{tasks.length}</p>
          </div>
        </div>
      </div>

      {/* تحذير مهام متأخرة */}
      {overdueCount > 0 && (
        <div className="card-soft mb-3 border-r-4 border-peach-300">
          <p className="text-sm font-bold text-peach-300">⏰ {overdueCount} مهمة فات وقتها — راجعيها</p>
        </div>
      )}

      {/* المهمة القادمة */}
      {nextTask && (
        <div
          onClick={() => nav('/tasks')}
          className="relative mb-4 p-4 rounded-xl2 cursor-pointer overflow-hidden animate-neon-glow transition-transform active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, rgba(255,143,177,0.18) 0%, rgba(255,229,236,0.45) 55%, rgba(255,255,255,0) 100%)',
            borderRight: '5px solid #FF8FB1',
            border: '1px solid rgba(255,143,177,0.5)',
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <p className="text-xs font-extrabold text-rose-500 tracking-wide">المهمة القادمة</p>
            {countdownText && (
              <span className="mr-auto text-[10px] font-bold text-rose-600 bg-white/80 dark:bg-[#34343f] px-2 py-0.5 rounded-full">
                ⏳ {countdownText}
              </span>
            )}
          </div>
          <p className="font-extrabold text-lg text-ink-900 dark:text-rose-100">{nextTask.title}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-ink-700 dark:text-rose-300/90">
            <span className="font-semibold">{PERIOD_LABELS[nextTask.period]}</span>
            {nextTask.scheduledTime && nextTask.durationMinutes && (
              <span className="flex items-center gap-1">
                ينتهي {formatTimeAr(addMinutesToTime(nextTask.scheduledTime, nextTask.durationMinutes))}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-[#34343f] text-rose-600 font-bold">
              {PRIORITY_LABELS[nextTask.priority]}
            </span>
          </div>
        </div>
      )}

      {/* مهام اليوم */}
      <div className="flex items-center justify-between mb-3 mt-6">
        <h2 className="text-lg font-bold text-ink-900 dark:text-rose-100">شغلات اليوم</h2>
        <button
          onClick={() => nav('/tasks')}
          className="text-sm text-rose-500 font-semibold flex items-center gap-1"
        >
          <CalIcon size={14} /> عرض الكل ({tasks.length})
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="card-soft text-center py-10">
          <p className="text-5xl mb-3">🌷</p>
          <p className="font-bold text-ink-700 dark:text-rose-100 mb-1">يومج بعده فاضي</p>
          <p className="text-sm text-ink-500 dark:text-rose-300/80 mb-5">خلينا نبدأ أول شغلة</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.slice(0, 10).map(t => <TaskRow key={t.id} task={t} onToggle={() => toggle(t.id)} />)}
        </div>
      )}

      {/* زر الإضافة */}
      <button
        onClick={() => nav('/tasks?new=1')}
        className="fixed bottom-24 left-4 bg-rose-400 text-white rounded-full px-4 py-3 shadow-float font-bold flex items-center gap-1.5 active:scale-95 transition-transform z-40 text-sm"
      >
        <Plus size={18} /> شغلة جديدة
      </button>
    </Layout>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <div className="card-soft flex items-start gap-3 py-3">
      <button onClick={onToggle} className="mt-0.5 shrink-0">
        {task.completed
          ? <CheckCircle2 size={22} className="text-mint-300" />
          : <Circle size={22} className="text-rose-200" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${task.completed ? 'line-through text-ink-300 dark:text-rose-300/50' : 'text-ink-900 dark:text-rose-100'}`}>
          {task.title}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-ink-500 dark:text-rose-300/80">
          <span>{PERIOD_LABELS[task.period]}</span>
          {task.scheduledTime && (
            <span className="flex items-center gap-1">
              · {formatTimeAr(task.scheduledTime)}
              {task.durationMinutes ? ` — ${formatTimeAr(addMinutesToTime(task.scheduledTime, task.durationMinutes))}` : ''}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-[#34343f] text-rose-500 font-semibold">
            {PRIORITY_LABELS[task.priority]}
          </span>
        </div>
      </div>
    </div>
  );
}
