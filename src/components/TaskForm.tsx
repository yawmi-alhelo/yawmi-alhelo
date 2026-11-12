import { useState, useEffect, useMemo } from 'react';
import { X, Trash2, Clock, Wand2 } from 'lucide-react';
import type { Task, PeriodType, PriorityType, RepeatType } from '../types';
import { PERIOD_LABELS, PERIOD_ORDER, PRIORITY_LABELS, REPEAT_LABELS } from '../types';
import { todayISO, formatTimeAr, addMinutesToTime, getPeriodNow } from '../lib/date';
import TimePicker from './flows/TimePicker';
import DatePicker from './flows/DatePicker';

const TIME_SUGGESTIONS: Record<PeriodType, string[]> = {
  morning: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
  beforeNoon: ['09:30', '10:30', '11:30'],
  noon: ['12:00', '13:00', '14:00', '15:00'],
  afternoon: ['15:00', '16:00', '17:00', '18:00'],
  maghrib: ['18:00', '19:00', '20:00'],
  evening: ['20:00', '21:00', '22:00', '23:00'],
  beforeSleep: ['22:00', '23:00', '00:00'],
};

const DURATION_CHIPS = [15, 30, 45, 60, 90, 120];

function getDefaultTime(): string {
  const now = new Date();
  const mins = Math.ceil((now.getMinutes() + 5) / 15) * 15;
  const h = mins >= 60 ? (now.getHours() + 1) % 24 : now.getHours();
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

interface Props {
  initial?: Partial<Task>;
  onSave: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function TaskForm({ initial, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const isEditing = !!initial?.id;
  const [period, setPeriod] = useState<PeriodType>(
    initial?.period || getPeriodNow(new Date().getHours())
  );
  const [scheduledTime, setScheduledTime] = useState<string>(
    isEditing ? (initial?.scheduledTime || '') : getDefaultTime()
  );
  const [duration, setDuration] = useState(initial?.durationMinutes?.toString() || '');
  const [priority, setPriority] = useState<PriorityType>(initial?.priority || 'medium');
  const [category, setCategory] = useState(initial?.category || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [repeat, setRepeat] = useState<RepeatType>(initial?.repeat || 'none');
  const [date, setDate] = useState(initial?.date || todayISO());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customTime, setCustomTime] = useState(() => {
    if (isEditing) {
      return !!initial?.scheduledTime && !TIME_SUGGESTIONS[initial?.period || 'morning'].includes(initial.scheduledTime);
    }
    const defaultPeriod = getPeriodNow(new Date().getHours());
    const defaultTime = getDefaultTime();
    return !TIME_SUGGESTIONS[defaultPeriod].includes(defaultTime);
  });
  const [customDuration, setCustomDuration] = useState(
    !!initial?.durationMinutes && !DURATION_CHIPS.includes(initial.durationMinutes)
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const endTime = useMemo(() => {
    if (!scheduledTime || !duration) return null;
    return addMinutesToTime(scheduledTime, parseInt(duration));
  }, [scheduledTime, duration]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      period,
      scheduledTime: scheduledTime || undefined,
      durationMinutes: duration ? parseInt(duration) : undefined,
      priority,
      category: category.trim() || undefined,
      notes: notes.trim() || undefined,
      repeat,
      date,
      completed: initial?.completed ?? false,
      completedAt: initial?.completedAt,
      deferred: initial?.deferred,
      deferredFrom: initial?.deferredFrom,
      soundId: initial?.soundId,
    });
  }

  const timeSuggestions = TIME_SUGGESTIONS[period] || [];
  const showCustomTimeInput = customTime || (scheduledTime && !timeSuggestions.includes(scheduledTime));

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center">
      <div className="bg-white dark:bg-[#252532] w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[94vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-[#252532] px-5 py-4 border-b border-rose-100 dark:border-[#34343f] flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-ink-900 dark:text-rose-100">
            {initial?.id ? 'تعديل المهمة' : 'شغلة جديدة 🌸'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-[#34343f]">
            <X size={20} className="text-ink-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 pb-10">
          <div>
            <label className="block text-sm font-semibold text-rose-500 mb-1.5 text-glow">شنو الشغلة؟ *</label>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="مثلاً: ترتيب البيت"
              className="w-full px-4 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400"
              autoFocus required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-rose-200 mb-1.5">الوصف (اختياري)</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)} rows={2}
              placeholder="تفاصيل أكثر عن الشغلة..."
              className="w-full px-3 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-rose-200 mb-1.5">الفترة</label>
            <div className="flex flex-wrap gap-2">
              {PERIOD_ORDER.map(p => (
                <button
                  type="button" key={p}
                  onClick={() => { setPeriod(p); if (scheduledTime && !customTime) setScheduledTime(''); }}
                  className={`px-3 py-2 rounded-xl2 text-sm font-semibold transition-all ${
                    period === p ? 'bg-rose-400 text-white shadow-soft' : 'bg-rose-50 dark:bg-[#1a1a24] text-ink-700 dark:text-rose-200'
                  }`}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-ink-700 dark:text-rose-200">الوقت</label>
              <button type="button" onClick={() => setCustomTime(!customTime)}
                className={`text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-lg ${customTime ? 'text-rose-500' : 'text-ink-500 dark:text-rose-300/80'}`}>
                <Clock size={12} /> {customTime ? 'اختيار سريع' : 'وقت يدوي'}
              </button>
            </div>
            {!customTime && (
              <div className="flex flex-wrap gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setScheduledTime('')}
                  className={`px-3 py-1.5 rounded-xl2 text-xs font-semibold ${
                    !scheduledTime ? 'bg-rose-400 text-white' : 'bg-rose-50 dark:bg-[#1a1a24] text-ink-700 dark:text-rose-200'
                  }`}
                >
                  بدون وقت
                </button>
                {timeSuggestions.map(t => (
                  <button
                    type="button" key={t}
                    onClick={() => setScheduledTime(t)}
                    className={`px-3 py-1.5 rounded-xl2 text-xs font-semibold ${
                      scheduledTime === t ? 'bg-rose-400 text-white' : 'bg-rose-50 dark:bg-[#1a1a24] text-ink-700 dark:text-rose-200'
                    }`}
                  >
                    {formatTimeAr(t)}
                  </button>
                ))}
              </div>
            )}
            {(customTime || showCustomTimeInput) && (
              <button
                  type="button"
                  onClick={() => setShowTimePicker(true)}
                  className="w-full px-3 py-3 rounded-xl2 border-2 border-rose-200 dark:border-[#34343f] text-ink-900 dark:text-rose-100 font-bold text-center tabular-nums active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, rgba(255,143,177,0.1) 0%, rgba(184,164,236,0.1) 100%)' }}
                >
                  {scheduledTime ? (() => {
                    const [h, m] = scheduledTime.split(':').map(Number);
                    const suffix = h < 12 ? 'ص' : 'م';
                    const h12 = h % 12 === 0 ? 12 : h % 12;
                    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
                  })() : 'اختاري الوقت'}
                </button>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-ink-700 dark:text-rose-200">المدة</label>
              <button type="button" onClick={() => setCustomDuration(!customDuration)}
                className={`text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-lg ${customDuration ? 'text-rose-500' : 'text-ink-500 dark:text-rose-300/80'}`}>
                <Clock size={12} /> {customDuration ? 'اختيار سريع' : 'مدة يدوية'}
              </button>
            </div>
            {!customDuration && (
              <div className="flex flex-wrap gap-2 mb-2">
                {DURATION_CHIPS.map(d => (
                  <button
                    type="button" key={d}
                    onClick={() => setDuration(d.toString())}
                    className={`px-3 py-1.5 rounded-xl2 text-xs font-semibold ${
                      duration === d.toString() ? 'bg-lavender-300 text-white' : 'bg-rose-50 dark:bg-[#1a1a24] text-ink-700 dark:text-rose-200'
                    }`}
                  >
                    {d >= 60 ? `${d / 60} ساعة` : `${d} دقيقة`}
                  </button>
                ))}
              </div>
            )}
            {customDuration && (
              <input
                type="number" min={1} value={duration} onChange={e => setDuration(e.target.value)}
                placeholder="مثلاً: 40"
                className="w-full px-3 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400"
              />
            )}
          </div>

          {scheduledTime && duration && endTime && (
            <div className="p-3 rounded-xl2 bg-mint-100 dark:bg-[#1f2a25] border border-mint-200 dark:border-[#2a3a32] text-sm text-mint-300 flex items-center gap-2">
              <Wand2 size={16} />
              <span className="font-semibold">من {formatTimeAr(scheduledTime)} إلى {formatTimeAr(endTime)}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-rose-200 mb-1.5">التاريخ</label>
            <button
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="w-full px-3 py-3 rounded-xl2 border-2 border-rose-200 dark:border-[#34343f] text-ink-900 dark:text-rose-100 font-bold text-center active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, rgba(255,143,177,0.1) 0%, rgba(184,164,236,0.1) 100%)' }}
            >
              📅 {date}
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-rose-200 mb-1.5">الأولوية</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as PriorityType[]).map(p => (
                <button
                  type="button" key={p} onClick={() => setPriority(p)}
                  className={`py-2 rounded-xl2 text-sm font-semibold ${
                    priority === p
                      ? p === 'high' ? 'bg-peach-300 text-white'
                        : p === 'medium' ? 'bg-lavender-300 text-white'
                        : 'bg-mint-300 text-white'
                      : 'bg-rose-50 dark:bg-[#1a1a24] text-ink-700 dark:text-rose-200'
                  }`}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-rose-200 mb-1.5">التصنيف (اختياري)</label>
            <input
              type="text" value={category} onChange={e => setCategory(e.target.value)}
              placeholder="مثلاً: البيت، دراسة، صحة..."
              className="w-full px-3 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-rose-200 mb-1.5">التكرار</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(REPEAT_LABELS) as RepeatType[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRepeat(r)}
                  className={`px-3 py-2 rounded-xl2 text-sm font-semibold transition-all ${
                    repeat === r
                      ? 'bg-rose-400 text-white shadow-soft'
                      : 'bg-rose-50 dark:bg-[#1a1a24] text-ink-700 dark:text-rose-200'
                  }`}
                >
                  {REPEAT_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-rose-200 mb-1.5">ملاحظات</label>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="أي شي إضافي..."
              className="w-full px-3 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            {initial?.id && onDelete && (
              <button type="button" onClick={onDelete}
                className="px-4 py-3 rounded-xl2 bg-rose-100 dark:bg-[#34343f] text-rose-600 font-semibold flex items-center gap-2">
                <Trash2 size={18} /> حذف
              </button>
            )}
            <button type="submit" className="flex-1 btn-primary">
              {initial?.id ? 'حفظ التعديلات' : 'إضافة المهمة'}
            </button>
          </div>
        </form>
        {showDatePicker && (
          <DatePicker
            initial={date}
            onSelect={(d) => setDate(d)}
            onClose={() => setShowDatePicker(false)}
          />
        )}

        {showTimePicker && (
          <TimePicker
            initial={scheduledTime || '09:00'}
            onSelect={(t) => setScheduledTime(t)}
            onClose={() => setShowTimePicker(false)}
          />
        )}

      </div>
    </div>
  );
}
