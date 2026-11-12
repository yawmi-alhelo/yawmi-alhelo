import { useState } from 'react';
import { X, Check, Loader2, Clock } from 'lucide-react';
import { TASK_GROUPS, TASK_PRESETS } from '../../lib/flows/presets';
import { planDay } from '../../lib/flows/dayPlanner';
import type { DayPlanResult } from '../../lib/flows/types';
import TimePicker from './TimePicker';

function getDefaultStartTime(): string {
  const now = new Date();
  const mins = Math.ceil((now.getMinutes() + 5) / 15) * 15;
  const h = mins >= 60 ? (now.getHours() + 1) % 24 : now.getHours();
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

interface Props {
  apiKey?: string;
  model?: string;
  onClose: () => void;
  onApply: (tasks: DayPlanResult['tasks']) => Promise<void>;
}

export default function DayPlannerModal({ apiKey, model, onClose, onApply }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [hours, setHours] = useState(4);
  const [startTime, setStartTime] = useState<string>(getDefaultStartTime());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DayPlanResult | null>(null);
  const [applying, setApplying] = useState(false);

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function handlePlan() {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      const r = await planDay({ selectedTaskIds: selected, hours, startTime, apiKey, model });
      setResult(r);
    } finally {
      setLoading(false);
    }
  }

  async function handleApply() {
    if (!result || result.tasks.length === 0) return;
    setApplying(true);
    try {
      await onApply(result.tasks);
      onClose();
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center">
      <div className="bg-white dark:bg-[#252532] w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[94vh] flex flex-col">
        <div className="px-5 py-4 border-b border-rose-100 dark:border-[#34343f] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-ink-900 dark:text-rose-100">رتبيلي يومي 🌸</h2>
            <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-0.5">
              {result ? 'راجعي الجدول' : `${selected.length} مختارة`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-[#34343f]">
            <X size={20} className="text-ink-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!result ? (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-ink-700 dark:text-rose-200">تبدئين من الساعة</p>
                  <span className="text-[10px] font-bold text-rose-500 text-glow">خليها هسه أو غيري الوقت</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTimePicker(true)}
                  className="w-full px-4 py-3 rounded-xl2 border-2 border-rose-200 dark:border-[#34343f] text-ink-900 dark:text-rose-100 text-xl font-extrabold text-center tabular-nums active:scale-[0.98] transition-transform"
                  style={{ background: 'linear-gradient(135deg, rgba(255,143,177,0.1) 0%, rgba(184,164,236,0.1) 100%)' }}
                >
                  {(() => {
                    const [h, m] = startTime.split(':').map(Number);
                    const suffix = h < 12 ? 'ص' : 'م';
                    const h12 = h % 12 === 0 ? 12 : h % 12;
                    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
                  })()}
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm font-bold text-rose-500 mb-2 text-glow">شكد وقت عندج؟</p>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 4, 6, 8].map(h => (
                    <button
                      key={h}
                      onClick={() => setHours(h)}
                      className={`py-2 rounded-xl2 text-sm font-bold ${hours === h ? 'bg-rose-400 text-white' : 'bg-rose-50 dark:bg-[#1a1a24] text-ink-700 dark:text-rose-200'}`}
                    >
                      {h} ساعات
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-sm font-bold text-rose-500 mb-2 text-glow">شنو عندج اليوم؟</p>
              <div className="space-y-4">
                {TASK_GROUPS.map(group => {
                  const items = TASK_PRESETS.filter(t => t.groupId === group.id);
                  if (items.length === 0) return null;
                  return (
                    <div key={group.id}>
                      <p className="text-xs font-bold text-ink-500 dark:text-rose-300/80 mb-1.5">
                        {group.emoji} {group.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {items.map(item => {
                          const on = selected.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              onClick={() => toggle(item.id)}
                              className={`px-3 py-1.5 rounded-xl2 text-xs font-semibold flex items-center gap-1 ${on ? 'bg-rose-400 text-white' : 'bg-rose-50 dark:bg-[#1a1a24] text-ink-700 dark:text-rose-200'}`}
                            >
                              {on && <Check size={12} />}
                              {item.emoji} {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-ink-700 dark:text-rose-200 mb-3">{result.summary}</p>
              {result.tasks.length === 0 ? (
                <p className="text-center text-ink-500 text-sm py-8">ما في مهام 🥺</p>
              ) : (
                <div className="space-y-2">
                  {result.tasks.map((t, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24]">
                      <span className="text-2xl shrink-0">{t.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-ink-900 dark:text-rose-100">{t.title}</p>
                        <p className="text-xs text-ink-500 dark:text-rose-300/80">{t.time} — {t.duration} دقيقة</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setResult(null)}
                className="mt-4 text-sm text-rose-500 font-semibold"
              >
                ← عدلي الاختيارات
              </button>
            </>
          )}
        </div>

        <div className="p-4 border-t border-rose-100 dark:border-[#34343f] shrink-0" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          {!result ? (
            <button
              onClick={handlePlan}
              disabled={selected.length === 0 || loading}
              className="w-full btn-primary disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> جاري الترتيب...</> : <>✨ رتبي يومي ({selected.length})</>}
            </button>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying || result.tasks.length === 0}
              className="w-full btn-primary disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {applying ? <><Loader2 size={18} className="animate-spin" /> جاري الإضافة...</> : <><Clock size={18} /> ضيفي للجدول</>}
            </button>
          )}
        </div>
      </div>
      {showTimePicker && (
        <TimePicker
          initial={startTime}
          onSelect={(t) => setStartTime(t)}
          onClose={() => setShowTimePicker(false)}
        />
      )}
    </div>
  );
}
