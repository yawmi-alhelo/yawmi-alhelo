import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Calendar as CalIcon, Check } from 'lucide-react';
import { ARABIC_MONTHS, ARABIC_DAYS } from '../../types';
import { todayISO, addDays, formatDateAr } from '../../lib/date';

interface Props {
  initial?: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default function DatePicker({ initial, onSelect, onClose }: Props) {
  const initialDate = parseISO(initial || todayISO());
  const [selected, setSelected] = useState<string>(initial || todayISO());
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const today = todayISO();

  const cells: Array<{ day: number | null; iso: string | null }> = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: null, iso: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, iso });
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  }
  function goToday() {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelected(todayISO());
  }
  function quickAdd(days: number) {
    const iso = addDays(todayISO(), days);
    const d = parseISO(iso);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setSelected(iso);
  }
  function handleConfirm() {
    onSelect(selected);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[150] flex items-end sm:items-center justify-center">
      <div className="bg-white dark:bg-[#252532] w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
        {/* Header زهري */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #FF8FB1 0%, #B8A4EC 100%)' }}
        >
          <div className="flex items-center gap-2">
            <CalIcon size={20} className="text-white" />
            <h3 className="text-white font-extrabold">اختاري التاريخ</h3>
          </div>
          <button onClick={onClose} className="text-white p-1 rounded-full hover:bg-white/20">
            <X size={20} />
          </button>
        </div>

        {/* التاريخ المختار */}
        <div className="py-4 text-center bg-gradient-to-b from-rose-50 to-white dark:from-[#1a1a24] dark:to-[#252532]">
          <p className="text-xs text-ink-500 dark:text-rose-300/80 mb-1">التاريخ المختار</p>
          <p
            key={selected}
            className="text-xl font-extrabold animate-[fadeInScale_0.3s_ease-out]"
            style={{
              background: 'linear-gradient(135deg, #FF8FB1 0%, #B8A4EC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {formatDateAr(selected)}
          </p>
        </div>

        {/* التنقل بين الشهور */}
        <div className="px-5 flex items-center justify-between mb-2">
          <button onClick={prevMonth} className="p-2 rounded-full bg-rose-50 dark:bg-[#1a1a24]">
            <ChevronRight size={18} className="text-rose-500" />
          </button>
          <p className="font-extrabold text-ink-900 dark:text-rose-100">
            {ARABIC_MONTHS[viewMonth]} {viewYear}
          </p>
          <button onClick={nextMonth} className="p-2 rounded-full bg-rose-50 dark:bg-[#1a1a24]">
            <ChevronLeft size={18} className="text-rose-500" />
          </button>
        </div>

        {/* أيام الأسبوع */}
        <div className="px-3 grid grid-cols-7 gap-1 mb-1">
          {ARABIC_DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-ink-500 dark:text-rose-300/80 py-1">
              {d.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* شبكة الأيام */}
        <div className="px-3 grid grid-cols-7 gap-1 pb-3">
          {cells.map((c, i) => {
            const isSelected = c.iso === selected;
            const isToday = c.iso === today;
            return (
              <button
                key={i}
                disabled={!c.iso}
                onClick={() => c.iso && setSelected(c.iso)}
                className={`aspect-square rounded-xl2 text-sm font-bold flex items-center justify-center transition-all ${
                  !c.iso ? '' :
                  isSelected
                    ? 'text-white shadow-lg scale-105'
                    : isToday
                      ? 'bg-rose-100 dark:bg-[#34343f] text-rose-600'
                      : 'text-ink-700 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-[#34343f]'
                }`}
                style={isSelected ? { background: 'linear-gradient(135deg, #FF8FB1 0%, #B8A4EC 100%)' } : undefined}
              >
                {c.day}
              </button>
            );
          })}
        </div>

        {/* اختصارات */}
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          <button onClick={goToday} className="px-3 py-1.5 rounded-xl2 bg-rose-100 dark:bg-[#34343f] text-rose-500 font-bold text-xs">
            اليوم
          </button>
          <button onClick={() => quickAdd(1)} className="px-3 py-1.5 rounded-xl2 bg-rose-100 dark:bg-[#34343f] text-rose-500 font-bold text-xs">
            باجر
          </button>
          <button onClick={() => quickAdd(2)} className="px-3 py-1.5 rounded-xl2 bg-rose-100 dark:bg-[#34343f] text-rose-500 font-bold text-xs">
            بعد باجر
          </button>
          <button onClick={() => quickAdd(7)} className="px-3 py-1.5 rounded-xl2 bg-rose-100 dark:bg-[#34343f] text-rose-500 font-bold text-xs">
            +أسبوع
          </button>
        </div>

        {/* أزرار */}
        <div className="p-4 border-t border-rose-100 dark:border-[#34343f] flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl2 bg-rose-100 dark:bg-[#34343f] text-ink-700 dark:text-rose-200 font-semibold">
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl2 text-white font-extrabold flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #FF8FB1 0%, #B8A4EC 100%)' }}
          >
            <Check size={18} /> تعيين
          </button>
        </div>
      </div>
    </div>
  );
}
