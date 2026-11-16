import { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, MapPin, Plus, ArrowRight, Pencil } from 'lucide-react';
import Layout from '../components/Layout';
import AppointmentForm from '../components/AppointmentForm';
import { useAppointments } from '../stores/useAppointments';
import { todayISO, formatTimeAr } from '../lib/date';
import type { Appointment } from '../types';

type AppointmentInput = Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>;

export default function Appointments() {
  const { items, loading, load, add, update, remove } = useAppointments();
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void load().catch((err) => {
      console.error('Appointments load failed:', err);
      setError('تعذر تحميل المواعيد. حاولي تحديث الصفحة.');
    });
  }, [load]);

  const sorted = useMemo(
    () => [...items].sort((a, b) =>
      (a.date + 'T' + a.time).localeCompare(b.date + 'T' + b.time)
    ),
    [items]
  );

  const today = todayISO();
  const todayItems = sorted.filter(item => item.date === today);
  const upcoming = sorted.filter(item => item.date > today);
  const previous = sorted.filter(item => item.date < today);

  async function handleSave(data: AppointmentInput) {
    setError('');
    try {
      if (editing) {
        await update(editing.id, data);
      } else {
        await add(data);
      }
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      console.error('Appointment save failed:', err);
      setError('ما قدرنا نحفظ الموعد. تأكدي من البيانات وحاولي مرة ثانية.');
    }
  }

  async function handleDelete() {
    if (!editing) return;
    if (!window.confirm('متأكد تريد حذف هذا الموعد؟')) return;

    setError('');
    try {
      await remove(editing.id);
      setEditing(null);
      setShowForm(false);
    } catch (err) {
      console.error('Appointment delete failed:', err);
      setError('تعذر حذف الموعد. حاولي مرة ثانية.');
    }
  }

  function openNew() {
    setEditing(null);
    setShowForm(true);
  }

  function renderSection(title: string, list: Appointment[], emoji: string) {
    return (
      <section className="mb-6">
        <h2 className="font-extrabold text-ink-800 dark:text-rose-100 mb-3 flex items-center gap-2">
          <span>{emoji}</span>{title}
          <span className="text-xs text-ink-400 font-semibold">({list.length})</span>
        </h2>
        {list.length === 0 ? (
          <div className="card-soft text-center py-5 text-sm text-ink-400">
            ماكو مواعيد بهذا القسم
          </div>
        ) : (
          <div className="space-y-3">
            {list.map(item => (
              <article key={item.id} className="card-soft">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-[#34343f] flex items-center justify-center text-xl shrink-0">
                    📅
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-ink-900 dark:text-rose-100 break-words">
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-ink-500 dark:text-rose-300/80">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />{item.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} />{formatTimeAr(item.time)}
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} />{item.location}
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-2 whitespace-pre-wrap">
                        {item.notes}
                      </p>
                    )}
                    <p className="text-[11px] text-rose-400 mt-2">
                      {(item.reminderMinutes ?? 0) > 0
                        ? '🔔 تذكير قبل ' + (item.reminderMinutes ?? 0) + ' دقيقة'
                        : '🔕 بدون تذكير'}
                    </p>
                  </div>
                  <button
                    onClick={() => { setEditing(item); setShowForm(true); }}
                    aria-label="تعديل الموعد"
                    className="p-2 rounded-xl bg-rose-50 dark:bg-[#34343f] text-rose-500"
                  >
                    <Pencil size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-[#34343f]"
            aria-label="رجوع"
          >
            <ArrowRight size={20} className="text-ink-700 dark:text-rose-100" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">المواعيد</h1>
            <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-1">
              رتّبي مواعيدج وخلي تذكيراتج تساعدج 🌷
            </p>
          </div>
        </div>
        <button
          onClick={openNew}
          aria-label="إضافة موعد"
          className="bg-rose-400 text-white rounded-full p-3 shadow-float active:scale-95"
        >
          <Plus size={21} />
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-100 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="card-soft text-center py-10 text-rose-500">جاري تحميل المواعيد...</div>
      ) : sorted.length === 0 ? (
        <div className="card-soft text-center py-12">
          <p className="text-5xl mb-3">🗓️</p>
          <p className="font-bold text-ink-800 dark:text-rose-100 mb-2">ما عندج مواعيد حالياً</p>
          <p className="text-sm text-ink-500 dark:text-rose-300/80 mb-4">ضيفي أول موعد حتى نذكّرج بيه</p>
          <button onClick={openNew} className="btn-primary inline-flex items-center gap-2">
            <Plus size={18} /> إضافة موعد
          </button>
        </div>
      ) : (
        <>
          {renderSection('مواعيد اليوم', todayItems, '🌸')}
          {renderSection('المواعيد القادمة', upcoming, '✨')}
          {renderSection('المواعيد السابقة', previous, '📚')}
        </>
      )}

      {showForm && (
        <AppointmentForm
          initial={editing || undefined}
          onSave={handleSave}
          onDelete={editing ? handleDelete : undefined}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </Layout>
  );
}
