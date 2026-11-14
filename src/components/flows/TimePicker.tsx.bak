import { useState, useEffect, useRef } from 'react';
import { X, Clock, Sparkles, Check } from 'lucide-react';

interface Props {
  initial?: string;
  onSelect: (time: string) => void;
  onClose: () => void;
}

function parseTime(t?: string): { h24: number; m: number } {
  if (t) {
    const [h, m] = t.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) return { h24: h, m };
  }
  const now = new Date();
  return { h24: now.getHours(), m: Math.ceil(now.getMinutes() / 5) * 5 % 60 };
}

export default function TimePicker({ initial, onSelect, onClose }: Props) {
  const init = parseTime(initial);
  const [h24, setH24] = useState(init.h24);
  const [minute, setMinute] = useState(init.m);
  const [prevTime, setPrevTime] = useState('');
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  const isPM = h24 >= 12;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const displayH = String(h12).padStart(2, '0');
  const displayM = String(minute).padStart(2, '0');
  const display = `${displayH}:${displayM} ${isPM ? 'م' : 'ص'}`;

  // أنميشن عند تغيير الوقت
  useEffect(() => {
    if (prevTime && prevTime !== display) setPrevTime(display);
    else if (!prevTime) setPrevTime(display);
  }, [display, prevTime]);

  // تمرير للعنصر المختار
  useEffect(() => {
    if (hoursRef.current) {
      const el = hoursRef.current.querySelector('[data-selected="hour"]') as HTMLElement;
      if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, []);
  useEffect(() => {
    if (minutesRef.current) {
      const el = minutesRef.current.querySelector('[data-selected="minute"]') as HTMLElement;
      if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, []);

  function setHour12(h: number) {
    if (isPM) setH24(h === 12 ? 12 : h + 12);
    else setH24(h === 12 ? 0 : h);
  }
  function toggleAMPM() {
    setH24(isPM ? h24 - 12 : h24 + 12);
  }
  function setNow() {
    const n = new Date();
    setH24(n.getHours());
    setMinute(Math.ceil(n.getMinutes() / 5) * 5 % 60);
  }
  function addMinutes(mins: number) {
    const total = h24 * 60 + minute + mins;
    setH24(Math.floor(((total % 1440) + 1440) % 1440 / 60));
    setMinute(total % 60);
  }
  function handleSave() {
    onSelect(`${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    onClose();
  }

  const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div className="fixed inset-0 bg-black/70 z-[150] flex items-end sm:items-center justify-center">
      <div className="bg-white dark:bg-[#252532] w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
        {/* Header زهري */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #FF8FB1 0%, #B8A4EC 100%)' }}
        >
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-white" />
            <h3 className="text-white font-extrabold">اختاري الوقت</h3>
          </div>
          <button onClick={onClose} className="text-white p-1 rounded-full hover:bg-white/20">
            <X size={20} />
          </button>
        </div>

        {/* عرض رقمي كبير مع أنميشن */}
        <div className="py-6 text-center bg-gradient-to-b from-rose-50 to-white dark:from-[#1a1a24] dark:to-[#252532]">
          <div
            key={display}
            className="inline-block text-6xl font-extrabold tabular-nums tracking-wider animate-[fadeInScale_0.35s_ease-out]"
            style={{
              background: 'linear-gradient(135deg, #FF8FB1 0%, #B8A4EC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {displayH}
            <span className="mx-1 animate-pulse" style={{ WebkitTextFillColor: '#FFA8C0' }}>:</span>
            {displayM}
          </div>
          <p className="text-sm font-bold text-rose-400 mt-1">{isPM ? 'مساءً' : 'صباحاً'}</p>
        </div>

        {/* ساعات */}
        <div className="px-5 pb-3">
          <p className="text-xs font-bold text-ink-500 dark:text-rose-300/80 mb-2">الساعة</p>
          <div
            ref={hoursRef}
            className="flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 no-scrollbar"
            style={{ scrollbarWidth: 'none' }}
          >
            {HOURS.map(h => {
              const sel = h12 === h;
              return (
                <button
                  key={h}
                  data-selected={sel ? 'hour' : undefined}
                  onClick={() => setHour12(h)}
                  className={`shrink-0 w-12 h-14 rounded-xl2 font-extrabold text-lg snap-center transition-all duration-300 ${
                    sel
                      ? 'text-white shadow-lg scale-110'
                      : 'bg-rose-50 dark:bg-[#1a1a24] text-ink-700 dark:text-rose-200'
                  }`}
                  style={sel ? { background: 'linear-gradient(135deg, #FF8FB1 0%, #B8A4EC 100%)' } : undefined}
                >
                  {String(h).padStart(2, '0')}
                </button>
              );
            })}
          </div>
        </div>

        {/* دقائق */}
        <div className="px-5 pb-3">
          <p className="text-xs font-bold text-ink-500 dark:text-rose-300/80 mb-2">الدقيقة</p>
          <div
            ref={minutesRef}
            className="flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 no-scrollbar"
            style={{ scrollbarWidth: 'none' }}
          >
            {MINUTES.map(m => {
              const sel = minute === m;
              return (
                <button
                  key={m}
                  data-selected={sel ? 'minute' : undefined}
                  onClick={() => setMinute(m)}
                  className={`shrink-0 w-12 h-14 rounded-xl2 font-extrabold snap-center transition-all duration-300 ${
                    sel
                      ? 'text-white shadow-lg scale-110'
                      : 'bg-rose-50 dark:bg-[#1a1a24] text-ink-700 dark:text-rose-200'
                  }`}
                  style={sel ? { background: 'linear-gradient(135deg, #FF8FB1 0%, #B8A4EC 100%)' } : undefined}
                >
                  {String(m).padStart(2, '0')}
                </button>
              );
            })}
          </div>
        </div>

        {/* أزرار سريعة */}
        <div className="px-5 pb-4 flex flex-wrap gap-2">
          <button
            onClick={toggleAMPM}
            className="px-3 py-2 rounded-xl2 text-white font-bold text-xs flex items-center gap-1"
            style={{ background: 'linear-gradient(135deg, #FF8FB1 0%, #B8A4EC 100%)' }}
          >
            <Sparkles size={12} />
            {isPM ? '→ صباحاً' : '→ مساءً'}
          </button>
          <button onClick={setNow} className="px-3 py-2 rounded-xl2 bg-rose-100 dark:bg-[#34343f] text-rose-500 font-bold text-xs">
            الآن
          </button>
          <button onClick={() => addMinutes(30)} className="px-3 py-2 rounded-xl2 bg-rose-100 dark:bg-[#34343f] text-rose-500 font-bold text-xs">
            +30 د
          </button>
          <button onClick={() => addMinutes(60)} className="px-3 py-2 rounded-xl2 bg-rose-100 dark:bg-[#34343f] text-rose-500 font-bold text-xs">
            +1 س
          </button>
        </div>

        {/* أزرار الإجراءات */}
        <div className="p-4 border-t border-rose-100 dark:border-[#34343f] flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl2 bg-rose-100 dark:bg-[#34343f] text-ink-700 dark:text-rose-200 font-semibold">
            إلغاء
          </button>
          <button
            onClick={handleSave}
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
