import { useEffect, useState } from 'react';
import { Play, Pause, Square, Coffee, Target, RotateCcw } from 'lucide-react';
import Layout from '../components/Layout';
import { useFocusTimer } from '../stores/useFocusTimer';
import { scheduleFocusTimer, cancelFocusTimer } from '../lib/notifications';
import { useSettings } from '../stores/useSettings';
import { getTodayFocusSessions } from '../lib/repositories/focus';
import type { FocusType } from '../types';

const TYPES: Array<{ id: FocusType; label: string; emoji: string }> = [
  { id: 'focus', label: 'تركيز', emoji: '🎯' },
  { id: 'shortBreak', label: 'استراحة قصيرة', emoji: '☕' },
  { id: 'longBreak', label: 'استراحة طويلة', emoji: '🌿' },
];

export default function Focus() {
  const { settings } = useSettings();
  const t = useFocusTimer();
  const [stats, setStats] = useState({ sessions: 0, minutes: 0 });

  useEffect(() => { loadStats(); }, [t.status]);

  // جدولة إشعار عند بدء المؤقت
  useEffect(() => {
    if (!settings.notificationsEnabled) return;
    if (t.status === 'running' && t.remainingSeconds > 0) {
      scheduleFocusTimer(t.remainingSeconds, t.type);
    } else if (t.status === 'paused' || t.status === 'done' || t.status === 'idle') {
      cancelFocusTimer();
    }
  }, [t.status, t.type, settings.notificationsEnabled]);

  async function loadStats() {
    const today = await getTodayFocusSessions();
    const done = today.filter(s => s.completed && s.type === 'focus');
    setStats({
      sessions: done.length,
      minutes: done.reduce((sum, x) => sum + x.durationMinutes, 0),
    });
  }

  function minutesFor(type: FocusType): number {
    if (type === 'focus') return settings.focusDuration;
    if (type === 'shortBreak') return settings.shortBreakDuration;
    return settings.longBreakDuration;
  }

  function selectType(type: FocusType) {
    if (t.status === 'running' || t.status === 'paused') {
      if (!confirm('توقف الجلسة الحالية ونبدي وحدة جديدة؟')) return;
      t.stop();
    }
    t.setType(type, minutesFor(type));
  }

  function primaryAction() {
    if (t.status === 'idle' || t.status === 'done') {
      t.start(t.type, minutesFor(t.type));
    } else if (t.status === 'running') {
      t.pause();
    } else if (t.status === 'paused') {
      t.resume();
    }
  }

  const minutes = Math.floor(t.remainingSeconds / 60);
  const seconds = t.remainingSeconds % 60;
  const timeLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const elapsed = t.totalSeconds - t.remainingSeconds;
  const percent = t.totalSeconds === 0 ? 0 : (elapsed / t.totalSeconds) * 100;
  const r = 100;
  const circ = 2 * Math.PI * r;
  const isActive = t.status === 'running' || t.status === 'paused';

  const activeType = TYPES.find(x => x.id === t.type)!;

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">مؤقت التركيز ⏱️</h1>
        <p className="text-sm text-ink-500 dark:text-rose-300/80 mt-1">خلينا نركّز شوية سوا</p>
      </div>

      {/* اختيار النوع */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {TYPES.map(ty => (
          <button
            key={ty.id}
            onClick={() => selectType(ty.id)}
            className={`py-3 rounded-xl2 text-sm font-semibold transition-all ${
              t.type === ty.id
                ? 'bg-rose-400 text-white shadow-soft'
                : 'bg-white dark:bg-[#252532] text-ink-700 dark:text-rose-200 border border-rose-100 dark:border-[#34343f]'
            }`}
          >
            <div className="text-xl mb-1">{ty.emoji}</div>
            <div className="text-xs">{ty.label}</div>
          </button>
        ))}
      </div>

      {/* الدائرة */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative inline-flex items-center justify-center" style={{ width: 240, height: 240 }}>
          <svg width={240} height={240} className="-rotate-90">
            <circle cx={120} cy={120} r={r} stroke="#FFE4EC" strokeWidth={16} fill="none" />
            <circle
              cx={120} cy={120} r={r}
              stroke="url(#focusGrad)" strokeWidth={16} fill="none"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - percent / 100)}
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF8FB1" />
                <stop offset="100%" stopColor="#B8A4EC" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-extrabold text-ink-900 dark:text-rose-100 tabular-nums">{timeLabel}</span>
            <span className="text-sm text-ink-500 dark:text-rose-300/80 mt-1">
              {activeType.emoji} {activeType.label}
            </span>
            {t.status === 'paused' && (
              <span className="text-xs text-peach-300 mt-1 font-bold">متوقف مؤقتاً</span>
            )}
            {t.status === 'done' && (
              <span className="text-xs text-mint-300 mt-1 font-bold">خلصت ✅</span>
            )}
          </div>
        </div>
      </div>

      {/* أزرار التحكم */}
      <div className="flex items-center justify-center gap-3 mb-6">
        {isActive && (
          <button
            onClick={() => t.stop()}
            className="w-14 h-14 rounded-full bg-rose-100 dark:bg-[#34343f] text-rose-600 flex items-center justify-center active:scale-95"
          >
            <Square size={20} />
          </button>
        )}
        <button
          onClick={primaryAction}
          className="w-20 h-20 rounded-full bg-rose-400 text-white flex items-center justify-center shadow-float active:scale-95 transition-transform"
        >
          {t.status === 'running'
            ? <Pause size={32} />
            : t.status === 'paused'
              ? <Play size={32} />
              : <Play size={32} />}
        </button>
        {t.status === 'done' && (
          <button
            onClick={() => t.setType(t.type, minutesFor(t.type))}
            className="w-14 h-14 rounded-full bg-rose-100 dark:bg-[#34343f] text-rose-600 flex items-center justify-center active:scale-95"
          >
            <RotateCcw size={20} />
          </button>
        )}
        {!isActive && t.status !== 'done' && <div className="w-14 h-14" />}
      </div>

      {/* إحصائيات اليوم */}
      <div className="card-soft">
        <p className="text-xs font-bold text-ink-500 dark:text-rose-300/80 mb-3">إنجاز اليوم</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-rose-500">{stats.sessions}</div>
            <div className="text-xs text-ink-500 dark:text-rose-300/80 mt-1 flex items-center justify-center gap-1">
              <Target size={12} /> جلسات تركيز
            </div>
          </div>
          <div className="text-center border-r border-rose-100 dark:border-[#34343f]">
            <div className="text-2xl font-extrabold text-lavender-300">{stats.minutes}</div>
            <div className="text-xs text-ink-500 dark:text-rose-300/80 mt-1 flex items-center justify-center gap-1">
              <Coffee size={12} /> دقيقة تركيز
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-ink-300 dark:text-rose-300/50 mt-4">
        💡 المؤقت يشتغل حتى لو سكرتي التطبيق
      </p>
    </Layout>
  );
}
