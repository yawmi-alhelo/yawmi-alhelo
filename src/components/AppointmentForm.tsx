import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { Appointment, RepeatType } from '../types';
import { REPEAT_LABELS } from '../types';
import { todayISO } from '../lib/date';
import TimePicker from './flows/TimePicker';
import DatePicker from './flows/DatePicker';

interface Props {
  initial?: Partial<Appointment>;
  onSave: (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function AppointmentForm({ initial, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title || '');
  const [date, setDate] = useState(initial?.date || todayISO());
  const [time, setTime] = useState(initial?.time || '09:00');
  const [location, setLocation] = useState(initial?.location || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [reminder, setReminder] = useState(initial?.reminderMinutes?.toString() || '15');
  const [repeat, setRepeat] = useState<RepeatType>(initial?.repeat || 'none');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      date,
      time,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      reminderMinutes: parseInt(reminder) || 0,
      repeat,
      linkedTaskId: initial?.linkedTaskId,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#252532] w-full max-w-lg rounded-t-3xl sm:rounded-xl3 max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-[#252532] px-5 py-4 border-b border-rose-100 dark:border-[#34343f] flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-ink-900 dark:text-rose-100">
            {initial?.id ? 'تعديل الموعد' : 'موعد جديد 📅'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-[#34343f]">
            <X size={20} className="text-ink-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-rose-200 mb-1.5">الموعد *</label>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="مثلاً: موعد طبيبة"
              className="w-full px-4 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400"
              autoFocus required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
              <label className="block text-sm font-semibold text-ink-700 dark:text-rose-200 mb-1.5">الوقت</label>
              <button
                type="button"
                onClick={() => setShowTimePicker(true)}
                className="w-full px-3 py-3 rounded-xl2 border-2 border-rose-200 dark:border-[#34343f] text-ink-900 dark:text-rose-100 font-bold text-center tabular-nums active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, rgba(255,143,177,0.1) 0%, rgba(184,164,236,0.1) 100%)' }}
              >
                {(() => {
                  const [h, m] = time.split(':').map(Number);
                  const suffix = h < 12 ? 'ص' : 'م';
                  const h12 = h % 12 === 0 ? 12 : h % 12;
                  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
                })()}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-rose-200 mb-1.5">المكان (اختياري)</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)}
              placeholder="مثلاً: مستشفى الكندي"
              className="w-full px-3 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-700 dark:text-rose-200 mb-1.5">التذكير قبل</label>
            <select value={reminder} onChange={e => setReminder(e.target.value)}
              className="w-full px-3 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400">
              <option value="5">5 دقائق</option>
              <option value="15">15 دقيقة</option>
              <option value="30">30 دقيقة</option>
              <option value="60">ساعة</option>
              <option value="0">بدون تذكير</option>
            </select>
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
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              className="w-full px-3 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            {initial?.id && onDelete && (
              <button type="button" onClick={onDelete}
                className="px-4 py-3 rounded-xl2 bg-rose-100 dark:bg-[#34343f] text-rose-600 font-semibold flex items-center gap-2">
                <Trash2 size={18} /> حذف
              </button>
            )}
            <button type="submit" className="flex-1 btn-primary">
              {initial?.id ? 'حفظ' : 'إضافة الموعد'}
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
            initial={time || '09:00'}
            onSelect={(t) => setTime(t)}
            onClose={() => setShowTimePicker(false)}
          />
        )}

      </div>
    </div>
  );
}
