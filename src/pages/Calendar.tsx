import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin } from 'lucide-react';
import Layout from '../components/Layout';
import AppointmentForm from '../components/AppointmentForm';
import { useAppointments } from '../stores/useAppointments';
import { useTasks } from '../stores/useTasks';
import { todayISO, formatTimeAr, formatDateAr } from '../lib/date';
import { ARABIC_DAYS, ARABIC_MONTHS, PERIOD_LABELS, type Appointment } from '../types';

export default function Calendar() {
  const { items: appointments, load: loadAppts, add: addAppt, remove: removeAppt } = useAppointments();
  const { tasks, load: loadTasks } = useTasks();
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<string>(todayISO());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);

  useEffect(() => { loadAppts(); }, [loadAppts]);
  useEffect(() => { loadTasks(selected); }, [selected, loadTasks]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // أيام الشهر كشبكة 7 أعمدة (RTL: الأحد أول عمود)
  const cells = useMemo(() => {
    const arr: Array<{ day: number | null; iso: string | null; busy: boolean; isToday: boolean }> = [];
    // padding قبل اليوم الأول
    for (let i = 0; i < firstDay; i++) arr.push({ day: null, iso: null, busy: false, isToday: false });
    const today = todayISO();
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasAppt = appointments.some(a => a.date === iso);
      arr.push({ day: d, iso, busy: hasAppt, isToday: iso === today });
    }
    return arr;
  }, [year, month, firstDay, daysInMonth, appointments]);

  const dayAppointments = appointments.filter(a => a.date === selected).sort((a, b) => a.time.localeCompare(b.time));

  function prevMonth() { setCursor(new Date(year, month - 1, 1)); }
  function nextMonth() { setCursor(new Date(year, month + 1, 1)); }

  async function handleSave(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) {
    if (editing) {
      await useAppointments.getState().update(editing.id, data);
    } else {
      await addAppt(data);
    }
    setShowForm(false);
    setEditing(null);
  }

  async function handleDelete() {
    if (!editing) return;
    if (confirm('متأكدة تحذفين الموعد؟')) {
      await removeAppt(editing.id);
      setEditing(null);
      setShowForm(false);
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">التقويم 📅</h1>
          <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-0.5">{formatDateAr(selected)}</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="bg-rose-400 text-white rounded-full p-3 shadow-float active:scale-95"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* رأس الشهر */}
      <div className="card-soft mb-3">
        <div className="flex items-center justify-between mb-4">
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-[#34343f]">
            <ChevronRight size={20} className="text-rose-500" />
          </button>
          <p className="font-bold text-ink-900 dark:text-rose-100">
            {ARABIC_MONTHS[month]} {year}
          </p>
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-[#34343f]">
            <ChevronLeft size={20} className="text-rose-500" />
          </button>
        </div>

        {/* أسماء الأيام */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {ARABIC_DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-ink-500 dark:text-rose-300/80">
              {d.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* شبكة الأيام */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((c, i) => (
            <button
              key={i}
              disabled={!c.iso}
              onClick={() => c.iso && setSelected(c.iso)}
              className={`aspect-square rounded-lg text-sm font-semibold flex flex-col items-center justify-center relative transition-all ${
                !c.iso ? '' :
                c.iso === selected
                  ? 'bg-rose-400 text-white shadow-soft'
                  : c.isToday
                    ? 'bg-rose-100 dark:bg-[#34343f] text-rose-600'
                    : 'text-ink-700 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-[#34343f]'
              }`}
            >
              {c.day}
              {c.busy && (
                <span className={`w-1 h-1 rounded-full mt-0.5 ${
                  c.iso === selected ? 'bg-white' : 'bg-peach-300'
                }`} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* مواعيد اليوم المختار */}
      <div className="mb-3">
        <h2 className="text-sm font-bold text-ink-500 dark:text-rose-300/80 mb-2 px-1">مواعيد هاليوم</h2>
        {dayAppointments.length === 0 ? (
          <div className="card-soft text-center py-6 text-sm text-ink-500 dark:text-rose-300/80">
            ما عندج مواعيد بهاليوم 🌷
          </div>
        ) : (
          <div className="space-y-2">
            {dayAppointments.map(a => (
              <button
                key={a.id}
                onClick={() => { setEditing(a); setShowForm(true); }}
                className="card-soft w-full text-right border-r-4 border-lavender-300"
              >
                <p className="font-bold text-ink-900 dark:text-rose-100">{a.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-ink-500 dark:text-rose-300/80">
                  <span className="flex items-center gap-1"><Clock size={12} /> {formatTimeAr(a.time)}</span>
                  {a.location && <span className="flex items-center gap-1"><MapPin size={12} /> {a.location}</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* مهام اليوم المختار */}
      <div>
        <h2 className="text-sm font-bold text-ink-500 dark:text-rose-300/80 mb-2 px-1">مهام هاليوم</h2>
        {tasks.length === 0 ? (
          <div className="card-soft text-center py-6 text-sm text-ink-500 dark:text-rose-300/80">
            ما عندج مهام بهاليوم
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.slice(0, 5).map(t => (
              <div key={t.id} className="card-soft flex items-center gap-2 py-2.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${t.completed ? 'bg-mint-300' : 'bg-rose-300'}`} />
                <p className={`flex-1 text-sm ${t.completed ? 'line-through text-ink-300' : 'text-ink-900 dark:text-rose-100'}`}>
                  {t.title}
                </p>
                <span className="text-xs text-ink-500 dark:text-rose-300/80">{PERIOD_LABELS[t.period]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <AppointmentForm
          initial={editing || { date: selected }}
          onSave={handleSave}
          onDelete={editing ? handleDelete : undefined}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </Layout>
  );
}
