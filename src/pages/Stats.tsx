import { useEffect, useState } from 'react';
import { Flame, Coffee, TrendingUp, TrendingDown } from 'lucide-react';
import Layout from '../components/Layout';
import { Tasks as TasksRepo } from '../lib/repositories';
import { Focus as FocusRepo } from '../lib/repositories';
import { addDays, todayISO, weekRange, monthRange } from '../lib/date';
import { PERIOD_LABELS, type PeriodType } from '../types';
import { getHourlyProductivity, getBestTimeOfDay, getComparison } from '../lib/analytics';
import { useRewards } from '../stores/useRewards';
import { getLevelTier } from '../lib/rewards/levels';

interface DayStat { date: string; total: number; done: number; }

export default function Stats() {
  const { state: rewards } = useRewards();
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState<DayStat[]>([]);
  const [todayStats, setTodayStats] = useState({ total: 0, done: 0 });
  const [weekStats, setWeekStats] = useState({ total: 0, done: 0 });
  const [monthStats, setMonthStats] = useState({ total: 0, done: 0 });
  const [focusToday, setFocusToday] = useState(0);
  const [focusTotal, setFocusTotal] = useState(0);

  const [bestTime, setBestTime] = useState<{ label: string; count: number; emoji: string } | null>(null);
  const [hourly, setHourly] = useState<{ hour: number; count: number }[]>([]);
  const [topPeriods, setTopPeriods] = useState<Array<{ period: PeriodType; count: number }>>([]);
  const [comparison, setComparison] = useState<{ thisWeek: number; lastWeek: number; change: number } | null>(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const today = todayISO();
    const w = weekRange(today);
    const m = monthRange(today);

    // جلب كل المهام مرة وحدة
    const allTasks = await TasksRepo.getAllTasks();

    // إحصائية اليوم (بناءً على المهام المجدولة لليوم)
    const todayTasks = allTasks.filter(t => t.date === today);
    setTodayStats({ total: todayTasks.length, done: todayTasks.filter(t => t.completed).length });

    // إحصائية الأسبوع (بناءً على المهام المجدولة في هذا الأسبوع)
    const weekTasks = allTasks.filter(t => t.date >= w.start && t.date <= w.end);
    setWeekStats({ total: weekTasks.length, done: weekTasks.filter(t => t.completed).length });

    // إحصائية الشهر
    const monthTasks = allTasks.filter(t => t.date >= m.start && t.date <= m.end);
    setMonthStats({ total: monthTasks.length, done: monthTasks.filter(t => t.completed).length });

    // آخر 7 أيام (بناءً على تاريخ الإنجاز الفعلي)
    const last7: DayStat[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(today, -i);
      const totalOnDay = allTasks.filter(t => t.date === d).length;
      const doneOnDay = allTasks.filter(t => t.completed && t.completedAt && t.completedAt.startsWith(d)).length;
      last7.push({ date: d, total: totalOnDay, done: doneOnDay });
    }
    setWeek(last7);

    // التركيز
    const todayFocus = await FocusRepo.getTodayFocusSessions();
    setFocusToday(todayFocus.filter(s => s.type === 'focus' && s.completed).reduce((sum, s) => sum + s.durationMinutes, 0));
    setFocusTotal(await FocusRepo.getTotalFocusMinutes());

    // تحليلات متقدمة (بناءً على completedAt)
    const completedTasks = allTasks.filter(t => t.completed && t.completedAt);
    
    const buckets = getHourlyProductivity(completedTasks);
    setHourly(buckets.map(b => ({ hour: b.hour, count: b.count })));
    setBestTime(getBestTimeOfDay(buckets));
    
    const byPeriod = new Map<PeriodType, number>();
    for (const t of completedTasks) byPeriod.set(t.period, (byPeriod.get(t.period) || 0) + 1);
    setTopPeriods(Array.from(byPeriod.entries()).map(([p, c]) => ({ period: p, count: c })).sort((a, b) => b.count - a.count).slice(0, 5));


    setComparison(await getComparison());

    setLoading(false);
  }

  const maxBar = Math.max(1, ...week.map(d => d.total));
  const maxHourly = Math.max(1, ...hourly.map(h => h.count));
  const tier = getLevelTier(rewards.points);

  if (loading) {
    return (
      <Layout>
        <div className="card-soft text-center py-16 mt-8">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink-500 dark:text-rose-300/80 text-sm">جاري التحميل...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">إحصائياتي 📊</h1>
        <p className="text-sm text-ink-500 dark:text-rose-300/80 mt-1">شوفي شكد إنجاز مسوية 🌷</p>
      </div>

      {/* بطاقة المكافآت (مدمجة مع الإحصائيات) */}
      <div className={`card-soft mb-4 flex items-center gap-3 py-3 border-2 ${tier.border}`}>
        <div className={`text-4xl w-14 h-14 rounded-2xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center shadow-soft`}>{tier.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <p className="text-sm font-extrabold text-ink-900 dark:text-rose-100">المستوى {Math.floor(rewards.points / 100) + 1}</p>
            <p className="text-xs text-rose-500 font-bold">{rewards.points} نقطة</p>
          </div>
          <p className="text-[10px] text-ink-500 dark:text-rose-300/80 mt-1">
            {rewards.flowers} وردة · 🔥 {rewards.streak || 0} يوم ستريك
          </p>
        </div>
      </div>

      {/* 3 بطاقات النسب */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatCard label="اليوم" done={todayStats.done} total={todayStats.total} color="rose" />
        <StatCard label="الأسبوع" done={weekStats.done} total={weekStats.total} color="lavender" />
        <StatCard label="الشهر" done={monthStats.done} total={monthStats.total} color="mint" />
      </div>

      {/* مقارنة الأسبوع */}
      {comparison && (
        <div className="card-soft mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-ink-500 dark:text-rose-300/80">هذا الأسبوع vs اللي قبله</p>
            {comparison.change !== 0 && (
              <span className={`flex items-center gap-1 text-xs font-extrabold ${comparison.change > 0 ? 'text-mint-300' : 'text-rose-500'}`}>
                {comparison.change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(comparison.change)}%
              </span>
            )}
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1 text-center">
              <p className="text-2xl font-extrabold text-rose-500">{comparison.thisWeek}</p>
              <p className="text-xs text-ink-500 dark:text-rose-300/80">هذا الأسبوع</p>
            </div>
            <div className="w-px h-10 bg-rose-100 dark:bg-[#34343f]" />
            <div className="flex-1 text-center">
              <p className="text-2xl font-extrabold text-lavender-300">{comparison.lastWeek}</p>
              <p className="text-xs text-ink-500 dark:text-rose-300/80">الأسبوع الماضي</p>
            </div>
          </div>
        </div>
      )}

      {/* آخر 7 أيام */}
      <div className="card-soft mb-4">
        <p className="text-xs font-bold text-ink-500 dark:text-rose-300/80 mb-4">آخر 7 أيام</p>
        <div className="flex items-end justify-between gap-2 h-32">
          {week.map((d, i) => {
            const h = maxBar === 0 ? 0 : (d.total / maxBar) * 100;
            const doneH = d.total === 0 ? 0 : (d.done / maxBar) * 100;
            const isToday = i === week.length - 1;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="relative w-full h-full flex items-end justify-center">
                  <div className="w-full bg-rose-100 dark:bg-[#34343f] rounded-t-lg" style={{ height: `${h}%` }} />
                  <div className={`absolute bottom-0 w-full rounded-t-lg ${isToday ? 'bg-rose-400' : 'bg-rose-300'}`} style={{ height: `${doneH}%` }} />
                </div>
                <span className={`text-[10px] ${isToday ? 'font-bold text-rose-500' : 'text-ink-500 dark:text-rose-300/80'}`}>
                  {d.date.slice(8)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* الإنتاجية بالساعات */}
      <div className="card-soft mb-4">
        <p className="text-xs font-bold text-ink-500 dark:text-rose-300/80 mb-3">الإنتاجية بالساعات (هالشهر)</p>
        <div className="flex items-end gap-0.5 h-24">
          {hourly.map(h => {
            const height = maxHourly === 0 ? 0 : (h.count / maxHourly) * 100;
            const isBest = bestTime && (
              (bestTime.label === 'صباح' && h.hour >= 5 && h.hour < 12) ||
              (bestTime.label === 'ظهر' && h.hour >= 12 && h.hour < 17) ||
              (bestTime.label === 'مساء' && h.hour >= 17 && h.hour < 21) ||
              (bestTime.label === 'ليل' && (h.hour >= 21 || h.hour < 5))
            );
            return (
              <div key={h.hour} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className="w-full rounded-sm transition-all" style={{
                  height: `${Math.max(2, height)}%`,
                  background: isBest ? 'linear-gradient(to top, #FF8FB1, #B8A4EC)' : 'rgba(255,143,177,0.35)'
                }} />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1 text-[8px] text-ink-500 dark:text-rose-300/80">
          <span>12ص</span><span>6ص</span><span>12م</span><span>6م</span><span>12ص</span>
        </div>
      </div>

      {/* الفترات والتصنيفات */}
      <div className="card-soft mb-4">
        <p className="text-xs font-bold text-ink-500 dark:text-rose-300/80 mb-3">أكثر فتراتج إنتاجية</p>
        {topPeriods.length === 0 ? (
          <p className="text-sm text-ink-500 dark:text-rose-300/80 text-center py-4">بعد ما عندج بيانات</p>
        ) : (
          <div className="space-y-2">
            {topPeriods.map(({ period, count }) => {
              const max = topPeriods[0].count;
              const w = (count / max) * 100;
              return (
                <div key={period} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-ink-700 dark:text-rose-200 w-20">{PERIOD_LABELS[period]}</span>
                  <div className="flex-1 h-2 rounded-full bg-rose-100 dark:bg-[#34343f] overflow-hidden">
                    <div className="h-full bg-gradient-to-l from-lavender-300 to-rose-400" style={{ width: `${w}%` }} />
                  </div>
                  <span className="text-xs font-bold text-rose-500 tabular-nums w-8 text-left">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* التركيز */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card-soft text-center">
          <Coffee size={22} className="mx-auto text-lavender-300 mb-2" />
          <p className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">{focusToday}</p>
          <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-1">دقيقة تركيز اليوم</p>
          <p className="text-[10px] text-ink-300 dark:text-rose-300/50 mt-2">إجمالي: {focusTotal}</p>
        </div>
        <div className="card-soft text-center">
          <Flame size={22} className="mx-auto text-peach-300 mb-2" />
          <p className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">{rewards.streak || 0}</p>
          <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-1">يوم متتالي</p>
          <p className="text-[10px] text-ink-300 dark:text-rose-300/50 mt-2">لا تنكسر السلسلة 🔥</p>
        </div>
      </div>

      {todayStats.done > 0 && (
        <div className="card-soft text-center bg-gradient-to-br from-rose-50 to-lavender-100 dark:from-[#252532] dark:to-[#2a2a3a]">
          <p className="text-sm font-bold text-rose-500 mb-1">
            {Math.round((todayStats.done / Math.max(1, todayStats.total)) * 100) >= 80 ? 'اليوم إنجازج خارق! 🌟' : Math.round((todayStats.done / Math.max(1, todayStats.total)) * 100) >= 50 ? 'عاشت إيدج، نص الطريق ✨' : 'بداية طيبة، كملي 💪'}
          </p>
          <p className="text-xs text-ink-500 dark:text-rose-300/80">شغلاتج محفوظة دايمياً 💾</p>
        </div>
      )}
    </Layout>
  );
}

function StatCard({ label, done, total, color }: { label: string; done: number; total: number; color: 'rose' | 'lavender' | 'mint' }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="card-soft text-center py-4">
      <div className="relative w-14 h-14 mx-auto mb-2">
        <svg className="-rotate-90" width="56" height="56">
          <circle cx="28" cy="28" r="22" stroke="#FFE4EC" strokeWidth="6" fill="none" />
          <circle cx="28" cy="28" r="22" stroke={`url(#g_${color})`} strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={2 * Math.PI * 22} strokeDashoffset={2 * Math.PI * 22 * (1 - pct / 100)} />
          <defs>
            <linearGradient id={`g_${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color === 'rose' ? '#FF8FB1' : color === 'lavender' ? '#B8A4EC' : '#7DD3A8'} />
              <stop offset="100%" stopColor={color === 'rose' ? '#FFA8C0' : color === 'lavender' ? '#D4C5F9' : '#A8E6CF'} />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-ink-900 dark:text-rose-100">{pct}%</span>
      </div>
      <p className="text-xs font-bold text-ink-500 dark:text-rose-300/80">{label}</p>
      <p className="text-[10px] mt-0.5 text-rose-500 font-bold">{done}/{total}</p>
    </div>
  );
}
