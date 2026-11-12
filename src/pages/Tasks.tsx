import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, ArrowRight, Calendar } from 'lucide-react';
import Layout from '../components/Layout';
import TaskForm from '../components/TaskForm';
import { useTasks } from '../stores/useTasks';
import { addDays, formatTimeAr, todayISO, addMinutesToTime } from '../lib/date';
import { PERIOD_LABELS, PERIOD_ORDER, PRIORITY_LABELS, type PeriodType, type Task } from '../types';

export default function Tasks() {
  const nav = useNavigate();
  const location = useLocation();
  const isNew = location.pathname === '/tasks/new' || new URLSearchParams(location.search).get('new') === '1';
  const { tasks, load, add, update, remove, toggle, defer, date } = useTasks();
  const [confirmClear, setConfirmClear] = useState(false);
  const [filter, setFilter] = useState<PeriodType | 'all'>('all');
  const [editing, setEditing] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(isNew);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (isNew) setShowForm(true); }, [location.pathname, location.search]);

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.period === filter);

  async function handleSave(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    if (editing) {
      await update(editing.id, data);
    } else {
      await add(data);
    }
    setShowForm(false);
    setEditing(null);
    nav('/tasks', { replace: true });
  }

  async function handleDelete() {
    if (!editing) return;
    if (confirm('متأكدة تحذفين هذي المهمة؟')) {
      await remove(editing.id);
      setEditing(null);
      setShowForm(false);
    }
  }

  async function handleClearAll() {
    if (!confirmClear) { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 4000); return; }
    for (const t of tasks) await remove(t.id);
    setConfirmClear(false);
    await load();
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => nav(-1)} className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-[#34343f]">
            <ArrowRight size={20} className="text-ink-700 dark:text-rose-100" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">المهام</h1>
            <p className="text-xs text-ink-500 dark:text-rose-300/80 flex items-center gap-1 mt-0.5">
              <Calendar size={12} /> {date}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="bg-rose-400 text-white rounded-full p-3 shadow-float active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* تصفية */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>الكل</FilterChip>
        {PERIOD_ORDER.map(p => (
          <FilterChip key={p} active={filter === p} onClick={() => setFilter(p)}>
            {PERIOD_LABELS[p]}
          </FilterChip>
        ))}
      </div>

      {tasks.length > 0 && (
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs text-ink-500 dark:text-rose-300/80">عندج {tasks.length} مهمة اليوم</span>
          <button
            onClick={handleClearAll}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg ${confirmClear ? 'bg-rose-500 text-white' : 'text-rose-500 bg-rose-50 dark:bg-[#34343f]'}`}
          >
            {confirmClear ? '⚠️ اضغطي مرة ثانية للتأكيد' : '🗑️ حذف الكل'}
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card-soft text-center py-12">
          <p className="text-5xl mb-3">🌷</p>
          <p className="font-bold text-ink-700 dark:text-rose-100 mb-1">ما عندج شغلات بهذي الفترة</p>
          <p className="text-sm text-ink-500 dark:text-rose-300/80">ضيفي شغلة جديدة وخلينا نبدأ</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id} className="card-soft">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggle(t.id)}
                  className={`w-6 h-6 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                    t.completed
                      ? 'bg-mint-300 border-mint-300'
                      : 'border-rose-200'
                  }`}
                >
                  {t.completed && <span className="text-white text-xs font-bold">✓</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    onClick={() => { setEditing(t); setShowForm(true); }}
                    className={`font-semibold cursor-pointer ${t.completed ? 'line-through text-ink-300 dark:text-rose-300/50' : 'text-ink-900 dark:text-rose-100'}`}
                  >
                    {t.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-ink-500 dark:text-rose-300/80">
                    <span>{PERIOD_LABELS[t.period]}</span>
                    {t.scheduledTime && (<span className="flex items-center gap-1">· {formatTimeAr(t.scheduledTime)}{t.durationMinutes ? ` — ${formatTimeAr(addMinutesToTime(t.scheduledTime, t.durationMinutes))}` : ''}</span>)}
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-[#34343f] text-rose-500 font-semibold">
                      {PRIORITY_LABELS[t.priority]}
                    </span>
                  </div>
                </div>
              </div>
              {!t.completed && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-rose-50 dark:border-[#34343f]">
                  <button
                    onClick={() => toggle(t.id)}
                    className="text-xs font-semibold text-mint-300 px-2 py-1"
                  >
                    ✓ تمت
                  </button>
                  <button
                    onClick={async () => {
                      await defer(t.id, addDays(t.date, 1));
                    }}
                    className="text-xs font-semibold text-lavender-300 px-2 py-1"
                  >
                    ← أجّليها
                  </button>
                  <button
                    onClick={() => { setEditing(t); setShowForm(true); }}
                    className="text-xs font-semibold text-rose-500 px-2 py-1"
                  >
                    ✎ عدّلي
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <TaskForm
          initial={editing || { date: todayISO() }}
          onSave={handleSave}
          onDelete={editing ? handleDelete : undefined}
          onClose={() => { setShowForm(false); setEditing(null); nav('/tasks', { replace: true }); }}
        />
      )}
    </Layout>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-2 rounded-xl2 text-sm font-semibold transition-all ${
        active
          ? 'bg-rose-400 text-white shadow-soft'
          : 'bg-white dark:bg-[#252532] text-ink-700 dark:text-rose-200 border border-rose-100 dark:border-[#34343f]'
      }`}
    >
      {children}
    </button>
  );
}
