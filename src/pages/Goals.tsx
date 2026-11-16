import { useEffect, useState } from 'react';
import { Plus, Trash2, Target } from 'lucide-react';
import Layout from '../components/Layout';
import { useGoals } from '../stores/useGoals';

export default function Goals() {
  const { items, load, add, update, remove } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await add({
      title: title.trim(),
      description: desc.trim() || undefined,
      targetDate: targetDate || undefined,
      progress: 0,
      linkedTaskIds: [],
      completed: false,
    });
    setTitle(''); setDesc(''); setTargetDate(''); setShowForm(false);
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">أهدافي 🎯</h1>
          <p className="text-sm text-ink-500 dark:text-rose-300/80 mt-1">شوي شوي نوصل</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-rose-400 text-white rounded-full p-3 shadow-float active:scale-95">
          <Plus size={20} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card-soft text-center py-12">
          <Target size={48} className="mx-auto text-rose-300 mb-4" />
          <p className="font-bold text-ink-700 dark:text-rose-100 mb-1">ما عندج أهداف بعد</p>
          <p className="text-sm text-ink-500 dark:text-rose-300/80">حددي حلم وحوّليه لأهداف صغيرة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(g => (
            <div key={g.id} className="card-soft">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className={`font-bold ${g.completed ? 'text-mint-300 line-through' : 'text-ink-900 dark:text-rose-100'}`}>
                    {g.title}
                  </p>
                  {g.description && (
                    <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-1">{g.description}</p>
                  )}
                  {g.targetDate && (
                    <p className="text-xs text-lavender-300 mt-1">📅 قبل {g.targetDate}</p>
                  )}
                </div>
                <button
                  onClick={() => { if (confirm('تحذفين الهدف؟')) remove(g.id); }}
                  className="text-ink-300 hover:text-rose-500 p-1 shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="h-2 rounded-full bg-rose-100 dark:bg-[#34343f] overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-l from-rose-400 to-lavender-300 transition-all"
                  style={{ width: `${g.progress}%` }}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => update(g.id, { progress: Math.max(0, g.progress - 10) })}
                  className="w-9 h-9 rounded-full bg-rose-100 dark:bg-[#34343f] text-rose-600 font-bold"
                >−</button>
                <span className="flex-1 text-center text-sm font-bold text-ink-900 dark:text-rose-100 tabular-nums">
                  {g.progress}%
                </span>
                <button
                  onClick={() => {
                    const p = Math.min(100, g.progress + 10);
                    update(g.id, { progress: p, completed: p === 100 });
                  }}
                  className="w-9 h-9 rounded-full bg-rose-400 text-white font-bold"
                >+</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-[#252532] w-full max-w-lg rounded-t-3xl sm:rounded-xl3">
            <div className="px-5 py-4 border-b border-rose-100 dark:border-[#34343f]">
              <h2 className="text-lg font-bold text-ink-900 dark:text-rose-100">هدف جديد 🎯</h2>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink-700 dark:text-rose-200 mb-1.5">الهدف *</label>
                <input
                  type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="مثلاً: أتعلم الخياطة"
                  className="w-full px-4 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400"
                  autoFocus required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 dark:text-rose-200 mb-1.5">ليش هالهدف؟ (اختياري)</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
                  className="w-full px-3 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 dark:text-rose-200 mb-1.5">تاريخ مستهدف (اختياري)</label>
                <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-3 rounded-xl2 bg-rose-100 dark:bg-[#34343f] text-ink-700 dark:text-rose-200 font-semibold">
                  إلغاء
                </button>
                <button type="submit" className="flex-1 btn-primary">أضيفي الهدف</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
