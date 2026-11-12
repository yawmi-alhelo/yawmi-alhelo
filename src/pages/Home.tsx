import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, CheckCircle2, Circle, Calendar as CalIcon } from 'lucide-react';
import Layout from '../components/Layout';
import CircleProgress from '../components/CircleProgress';
import RewardBadge from '../components/RewardBadge';
import RolloverBanner from '../components/RolloverBanner';
import { useTasks } from '../stores/useTasks';
import { useSettings } from '../stores/useSettings';
import { formatDateAr, formatTimeAr, greetingAr, getPeriodNow, todayISO, addMinutesToTime } from '../lib/date';
import { PERIOD_LABELS, PRIORITY_LABELS, type Task } from '../types';

export default function Home() {
  const nav = useNavigate();
  const { tasks, load, toggle } = useTasks();
  const { settings } = useSettings();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    load(todayISO());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [load]);

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
  const overdueCount = tasks.filter(t => {
    if (t.completed || !t.scheduledTime) return false;
    const [h, m] = t.scheduledTime.split(':').map(Number);
    return h * 60 + m <= nowMin;
  }).length;

  const timeStr = now.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <Layout>
      {/* التحية */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">
          {greetingAr(now.getHours())}
          {settings.userName ? ` يا ${settings.userName}` : ''}
        </h1>
        <p className="text-sm text-ink-500 dark:text-rose-300/80 mt-1">{formatDateAr(todayISO())}</p>
      </div>

      {/* Rollover */}
      <RolloverBanner />

      {/* الساعة + الفترة */}
      <div className="card-soft mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-ink-500 dark:text-rose-300/80 mb-1">
            <Clock size={16} />
            <span className="text-xs font-semibold">الوقت الآن</span>
          </div>
          <p className="text-3xl font-extrabold text-rose-500 tabular-nums">{timeStr}</p>
        </div>
        <div className="text-left">
          <p className="text-xs text-ink-500 dark:text-rose-300/80 mb-1">الفترة</p>
          <p className="text-lg font-bold text-lavender-300">{PERIOD_LABELS[currentPeriod]}</p>
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

      {/* المهمة القادمة — بارزة ومتوهجة */}
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
            {nextTask.scheduledTime && (
              <span className="mr-auto text-xs font-bold text-rose-500 tabular-nums bg-white/70 dark:bg-[#252532]/70 px-2 py-0.5 rounded-full">
                {formatTimeAr(nextTask.scheduledTime)}
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

      {/* المكافآت */}
      <div className="mb-4">
        <RewardBadge />
      </div>

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
          {task.scheduledTime && (<span className="flex items-center gap-1">· {formatTimeAr(task.scheduledTime)}{task.durationMinutes ? ` — ${formatTimeAr(addMinutesToTime(task.scheduledTime, task.durationMinutes))}` : ''}</span>)}
          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-[#34343f] text-rose-500 font-semibold">
            {PRIORITY_LABELS[task.priority]}
          </span>
        </div>
      </div>
    </div>
  );
}
