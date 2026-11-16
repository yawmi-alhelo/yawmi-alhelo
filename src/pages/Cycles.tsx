import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Droplet, Calendar, Trash2, X, Shield } from 'lucide-react';
import Layout from '../components/Layout';
import { useCycles } from '../stores/useCycles';
import { useSettings } from '../stores/useSettings';
import { predictCycle } from '../lib/cycles/predictor';
import { SYMPTOMS_LIST, FLOW_LABELS, FLOW_COLORS, type CycleFlow, type CycleRecord } from '../lib/cycles/types';
import { todayISO } from '../lib/date';

export default function Cycles() {
  const nav = useNavigate();
  const { items, load, add, remove } = useCycles();
  const { settings, update } = useSettings();
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState('');
  const [flow, setFlow] = useState<CycleFlow>('medium');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => { load(); }, [load]);

  const pred = predictCycle(items, settings.cycleLength, settings.periodLength, todayISO());

  function toggleSymptom(s: string) {
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate) return;
    await add({
      startDate,
      endDate: endDate || undefined,
      flow,
      symptoms,
      notes: notes.trim() || undefined,
    });
    setShowForm(false);
    setStartDate(todayISO()); setEndDate(''); setFlow('medium'); setSymptoms([]); setNotes('');
  }

  async function handleDelete(id: string) {
    if (!confirm('تحذفين هذا السجل؟')) return;
    await remove(id);
  }

  return (
    <Layout>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => nav(-1)} className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-[#34343f]">
          <ArrowRight size={20} className="text-ink-700 dark:text-rose-100" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">دورتي 🌸</h1>
          <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-0.5 flex items-center gap-1">
            <Shield size={10} /> خاصة على جوالج فقط
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-rose-400 text-white rounded-full p-3 shadow-float active:scale-95">
          <Plus size={20} />
        </button>
      </div>

      {/* حالة الدورة الحالية */}
      {items.length > 0 ? (
        <div className="card-soft mb-4 text-center py-6"
          style={{ background: 'linear-gradient(135deg, rgba(255,143,177,0.15) 0%, rgba(184,164,236,0.15) 100%)' }}>
          <div className="text-5xl mb-2">{pred.isCurrentlyActive ? '🌷' : '🌸'}</div>
          {pred.isCurrentlyActive ? (
            <>
              <p className="text-sm font-bold text-rose-500 mb-1">دورتج الآن</p>
              <p className="text-3xl font-extrabold text-ink-900 dark:text-rose-100">
                اليوم {pred.currentCycleDay}
              </p>
              <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-2">لا تنسين تاخذين استراحة، وتشربين ماي 💧</p>
            </>
          ) : pred.isLate ? (
            <>
              <p className="text-sm font-bold text-peach-300 mb-1">متأخرة</p>
              <p className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">
                {Math.abs(pred.daysUntilNext || 0)} يوم
              </p>
              <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-2">تأخير بسيط ممكن يكون طبيعي</p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-rose-500 mb-1">الدورة القادمة بعد</p>
              <p className="text-3xl font-extrabold text-ink-900 dark:text-rose-100">
                {pred.daysUntilNext} يوم
              </p>
              <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-2">
                متوقعة {pred.nextStartDate}
              </p>
            </>
          )}
          <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-ink-500 dark:text-rose-300/80">
            <span>متوسط الدورة: {pred.avgCycleLength} يوم</span>
            <span>·</span>
            <span>عدد السجلات: {items.length}</span>
          </div>
        </div>
      ) : (
        <div className="card-soft mb-4 text-center py-10">
          <div className="text-5xl mb-3">🌸</div>
          <p className="font-bold text-ink-700 dark:text-rose-100 mb-1">خلينا نبدأ التتبع</p>
          <p className="text-sm text-ink-500 dark:text-rose-300/80 mb-5">سجلي أول دورة عشان نبدأ التوقعات</p>
        </div>
      )}

      {/* إعدادات الدورة */}
      <div className="card-soft mb-4">
        <p className="text-xs font-bold text-ink-500 dark:text-rose-300/80 mb-2">إعدادات التوقع</p>
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-ink-700 dark:text-rose-200">طول الدورة (يوم)</span>
          <div className="flex items-center gap-2">
            <button onClick={() => update({ cycleLength: Math.max(20, settings.cycleLength - 1) })} className="w-7 h-7 rounded-full bg-rose-100 dark:bg-[#34343f] text-rose-600 font-bold">−</button>
            <span className="w-8 text-center font-bold tabular-nums">{settings.cycleLength}</span>
            <button onClick={() => update({ cycleLength: Math.min(45, settings.cycleLength + 1) })} className="w-7 h-7 rounded-full bg-rose-400 text-white font-bold">+</button>
          </div>
        </div>
        <div className="flex items-center justify-between py-2 border-t border-rose-100 dark:border-[#34343f] mt-1">
          <span className="text-sm text-ink-700 dark:text-rose-200">تذكير قبل الدورة بيومين</span>
          <button
            onClick={() => update({ cycleNotifications: !settings.cycleNotifications })}
            className={`relative w-12 h-7 rounded-full transition-colors ${settings.cycleNotifications ? 'bg-rose-400' : 'bg-rose-100 dark:bg-[#34343f]'}`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${settings.cycleNotifications ? 'right-1' : 'right-6'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-ink-700 dark:text-rose-200">طول الدورة الشهرية (يوم)</span>
          <div className="flex items-center gap-2">
            <button onClick={() => update({ periodLength: Math.max(2, settings.periodLength - 1) })} className="w-7 h-7 rounded-full bg-rose-100 dark:bg-[#34343f] text-rose-600 font-bold">−</button>
            <span className="w-8 text-center font-bold tabular-nums">{settings.periodLength}</span>
            <button onClick={() => update({ periodLength: Math.min(10, settings.periodLength + 1) })} className="w-7 h-7 rounded-full bg-rose-400 text-white font-bold">+</button>
          </div>
        </div>
      </div>

      {/* السجل */}
      <h2 className="text-sm font-bold text-ink-500 dark:text-rose-300/80 mb-2 px-1 flex items-center gap-1">
        <Calendar size={14} /> سجل الدورات ({items.length})
      </h2>
      {items.length === 0 ? (
        <p className="text-center text-sm text-ink-500 dark:text-rose-300/80 py-4">ما في سجلات بعد</p>
      ) : (
        <div className="space-y-2 mb-4">
          {items.map(c => (
            <CycleItem key={c.id} cycle={c} onDelete={() => handleDelete(c.id)} />
          ))}
        </div>
      )}

      {/* ملاحظة خصوصية */}
      <div className="card-soft bg-lavender-100 dark:bg-[#2a2535] border border-lavender-200 dark:border-[#3a3545]">
        <div className="flex items-start gap-2">
          <Shield size={16} className="text-lavender-300 shrink-0 mt-0.5" />
          <p className="text-xs text-ink-700 dark:text-rose-200 leading-relaxed">
            <strong>خصوصية تامة:</strong> بيانات دورتج محفوظة على جوالج فقط. ما تتم مزامنتها مع السحابة، ولا تظهر في النسخ الاحتياطي.
          </p>
        </div>
      </div>

      {/* نموذج الإضافة */}
      {showForm && (
        <div className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252532] rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-rose-100 dark:border-[#34343f] flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-ink-900 dark:text-rose-100">دورة جديدة 🌸</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-ink-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-ink-700 dark:text-rose-200 mb-1.5">تاريخ البداية *</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required
                  className="w-full px-3 py-2 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink-700 dark:text-rose-200 mb-1.5">تاريخ النهاية (اختياري)</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink-700 dark:text-rose-200 mb-1.5">التدفق</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'medium', 'heavy'] as CycleFlow[]).map(f => (
                    <button type="button" key={f} onClick={() => setFlow(f)}
                      className={`py-2 rounded-xl2 text-sm font-bold ${flow === f ? 'bg-rose-400 text-white' : 'bg-rose-50 dark:bg-[#1a1a24] text-ink-700 dark:text-rose-200'}`}>
                      <Droplet size={14} className="inline mr-1" />{FLOW_LABELS[f]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-ink-700 dark:text-rose-200 mb-1.5">الأعراض</label>
                <div className="flex flex-wrap gap-1.5">
                  {SYMPTOMS_LIST.map(s => (
                    <button type="button" key={s} onClick={() => toggleSymptom(s)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${symptoms.includes(s) ? 'bg-rose-400 text-white' : 'bg-rose-50 dark:bg-[#1a1a24] text-ink-700 dark:text-rose-200'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-ink-700 dark:text-rose-200 mb-1.5">ملاحظات</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none resize-none" />
              </div>
              <button type="submit" className="w-full btn-primary">💾 حفظ</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

function CycleItem({ cycle, onDelete }: { cycle: CycleRecord; onDelete: () => void }) {
  return (
    <div className="card-soft">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-bold text-ink-900 dark:text-rose-100 text-sm">
            {cycle.startDate}{cycle.endDate ? ` ← ${cycle.endDate}` : ''}
          </p>
          <p className={`text-xs ${FLOW_COLORS[cycle.flow]} font-bold mt-1`}>
            💧 تدفق {FLOW_LABELS[cycle.flow]}
          </p>
          {cycle.symptoms.length > 0 && (
            <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-1">
              {cycle.symptoms.join(' · ')}
            </p>
          )}
          {cycle.notes && (
            <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-1 italic">"{cycle.notes}"</p>
          )}
        </div>
        <button onClick={onDelete} className="text-ink-300 hover:text-rose-500 p-1">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
