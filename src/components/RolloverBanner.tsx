import { useEffect, useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Tasks as TasksRepo } from '../lib/repositories';
import { useTasks } from '../stores/useTasks';
import { addDays, todayISO } from '../lib/date';
import type { Task } from '../types';

export default function RolloverBanner() {
  const [overdue, setOverdue] = useState<Task[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [moving, setMoving] = useState(false);
  const load = useTasks(s => s.load);

  useEffect(() => {
    (async () => {
      const yesterday = addDays(todayISO(), -1);
      const tasks = await TasksRepo.getTasksByDate(yesterday);
      const pending = tasks.filter(t => !t.completed && !t.deferred);
      setOverdue(pending);
    })();
  }, []);

  if (dismissed || overdue.length === 0) return null;

  async function rolloverAll() {
    setMoving(true);
    const today = todayISO();
    for (const t of overdue) {
      await TasksRepo.updateTask(t.id, {
        date: today,
        deferred: true,
        deferredFrom: t.date,
      });
    }
    await load(today);
    setDismissed(true);
    setMoving(false);
  }

  return (
    <div className="card-soft mb-3 border-r-4 border-lavender-300 relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 left-2 p-1 text-ink-300 hover:text-rose-500"
      >
        <X size={14} />
      </button>
      <p className="text-sm font-bold text-ink-900 dark:text-rose-100 mb-1 pr-4">
        🌷 عندج {overdue.length} شغلة من أمس ما خلصت
      </p>
      <p className="text-xs text-ink-500 dark:text-rose-300/80 mb-3">
        ترحّليها لليوم بضغطة وحدة؟
      </p>
      <button
        onClick={rolloverAll}
        disabled={moving}
        className="w-full py-2 rounded-xl2 bg-lavender-300 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
      >
        <ArrowLeft size={16} /> {moving ? 'جاري الترحيل...' : `رحّلي ${overdue.length} شغلة لليوم`}
      </button>
    </div>
  );
}
