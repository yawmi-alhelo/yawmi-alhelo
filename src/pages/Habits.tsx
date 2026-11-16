import { useEffect, useState } from 'react';
import { Plus, Flame, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useHabits } from '../stores/useHabits';

export default function Habits() {
  const { habits, load, add, toggle, remove } = useHabits();
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => { load(); }, [load]);

  const done = habits.filter(h => h.doneToday).length;
  const total = habits.length;
  const percent = total === 0 ? 0 : (done / total) * 100;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await add({ title: newTitle.trim(), frequency: 'daily' });
    setNewTitle('');
    setAdding(false);
  }

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">عاداتي 🌿</h1>
        <p className="text-sm text-ink-500 dark:text-rose-300/80 mt-1">شوي شوي نكبر سوا 🌷</p>
      </div>

      <div className="card-soft mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-ink-900 dark:text-rose-100">اليوم</p>
          <p className="text-sm font-bold text-rose-500 tabular-nums">{done} / {total}</p>
        </div>
        <div className="h-2 rounded-full bg-rose-100 dark:bg-[#34343f] overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-rose-400 to-lavender-300 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="card-soft text-center py-10 mb-4">
          <p className="text-5xl mb-3">🌱</p>
          <p className="font-bold text-ink-700 dark:text-rose-100 mb-1">ما عندج عادات بعد</p>
          <p className="text-sm text-ink-500 dark:text-rose-300/80">ابدئي بعادة وحدة وخلينا نكبر سوا</p>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {habits.map(h => (
            <div key={h.id} className="card-soft flex items-center gap-3">
              <button
                onClick={() => toggle(h.id)}
                className={`w-9 h-9 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                  h.doneToday ? 'bg-mint-300 border-mint-300' : 'border-rose-200'
                }`}
              >
                {h.doneToday && <span className="text-white font-bold">✓</span>}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold ${h.doneToday ? 'text-mint-300' : 'text-ink-900 dark:text-rose-100'}`}>
                  {h.title}
                </p>
                {h.streak > 0 && (
                  <p className="text-xs text-peach-300 flex items-center gap-1 mt-0.5">
                    <Flame size={12} /> {h.streak} يوم متتالي
                  </p>
                )}
              </div>
              <button
                onClick={() => { if (confirm('تحذفين هالعادة؟')) remove(h.id); }}
                className="text-ink-300 hover:text-rose-500 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <form onSubmit={handleAdd} className="card-soft space-y-2">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="شسم العادة؟ مثلاً: شرب الماي"
            className="w-full px-3 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400"
            autoFocus
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 btn-primary">أضيفي</button>
            <button type="button" onClick={() => setAdding(false)} className="px-4 py-3 rounded-xl2 bg-rose-100 dark:bg-[#34343f] text-ink-700 dark:text-rose-200 font-semibold">
              إلغاء
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full btn-secondary flex items-center justify-center gap-2">
          <Plus size={18} /> عادة جديدة
        </button>
      )}
    </Layout>
  );
}
