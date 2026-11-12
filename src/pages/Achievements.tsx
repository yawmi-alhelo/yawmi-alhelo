import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, CheckCircle2, Trophy } from 'lucide-react';
import Layout from '../components/Layout';
import { getAllAchievementStatuses, type AchievementStatus } from '../lib/achievements';
import { CATEGORY_LABELS, TIER_COLORS, type AchievementCategory } from '../lib/achievements/definitions';

const CATEGORIES: AchievementCategory[] = ['tasks', 'streak', 'focus', 'habits', 'cooking', 'social', 'special'];

export default function Achievements() {
  const nav = useNavigate();
  const [statuses, setStatuses] = useState<AchievementStatus[]>([]);
  const [activeCat, setActiveCat] = useState<AchievementCategory>('tasks');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const all = await getAllAchievementStatuses();
      setStatuses(all);
      setLoading(false);
    })();
  }, []);

  const filtered = statuses.filter(s => s.def.category === activeCat);
  const totalUnlocked = statuses.filter(s => s.unlocked).length;
  const total = statuses.length;

  return (
    <Layout>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => nav(-1)} className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-[#34343f]">
          <ArrowRight size={20} className="text-ink-700 dark:text-rose-100" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">إنجازاتي 🏆</h1>
          <p className="text-sm text-ink-500 dark:text-rose-300/80 mt-0.5">
            {totalUnlocked} من {total} إنجاز
          </p>
        </div>
      </div>

      {/* شريط التقدم العام */}
      <div className="card-soft mb-4">
        <div className="flex items-center gap-3 mb-2">
          <Trophy size={20} className="text-peach-300" />
          <p className="font-bold text-ink-900 dark:text-rose-100 text-sm">التقدم الكلي</p>
          <p className="ml-auto text-sm font-extrabold text-rose-500">
            {Math.round((totalUnlocked / total) * 100)}%
          </p>
        </div>
        <div className="h-2.5 rounded-full bg-rose-100 dark:bg-[#34343f] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${(totalUnlocked / total) * 100}%`,
              background: 'linear-gradient(90deg, #FF8FB1 0%, #B8A4EC 100%)',
            }}
          />
        </div>
      </div>

      {/* تبويبات الفئات */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-4 px-4 no-scrollbar">
        {CATEGORIES.map(cat => {
          const info = CATEGORY_LABELS[cat];
          const catUnlocked = statuses.filter(s => s.def.category === cat && s.unlocked).length;
          const catTotal = statuses.filter(s => s.def.category === cat).length;
          const active = activeCat === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`shrink-0 px-3 py-2 rounded-xl2 text-xs font-bold transition-all ${
                active
                  ? 'bg-rose-400 text-white shadow-soft'
                  : 'bg-white dark:bg-[#252532] text-ink-700 dark:text-rose-200 border border-rose-100 dark:border-[#34343f]'
              }`}
            >
              {info.emoji} {info.name}
              <span className={`mr-1 text-[10px] ${active ? 'opacity-80' : 'opacity-60'}`}>
                ({catUnlocked}/{catTotal})
              </span>
            </button>
          );
        })}
      </div>

      {/* شبكة الإنجازات */}
      {loading ? (
        <div className="card-soft text-center py-12 text-sm text-ink-500">جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="card-soft text-center py-12 text-sm text-ink-500">ما في إنجازات بهذي الفئة</div>
      ) : (
        <div className="space-y-3 mb-4">
          {filtered.map(({ def, unlocked, progress, percent }) => {
            const tier = TIER_COLORS[def.tier];
            return (
              <div
                key={def.id}
                className={`relative rounded-xl2 p-4 border-2 transition-all ${
                  unlocked
                    ? `bg-white dark:bg-[#252532] ${tier.border} ${tier.glow}`
                    : 'bg-rose-50/50 dark:bg-[#1a1a24]/50 border-rose-100 dark:border-[#34343f] opacity-70'
                }`}
              >
                {unlocked && (
                  <div className={`absolute top-2 left-2 w-7 h-7 rounded-full bg-gradient-to-br ${tier.bg} flex items-center justify-center shadow`}>
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
                    unlocked
                      ? `bg-gradient-to-br ${tier.bg} ${tier.glow}`
                      : 'bg-rose-100 dark:bg-[#34343f] grayscale'
                  }`}>
                    {unlocked ? def.emoji : <Lock size={20} className="text-ink-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-extrabold text-sm ${unlocked ? 'text-ink-900 dark:text-rose-100' : 'text-ink-500 dark:text-rose-300/60'}`}>
                        {def.name}
                      </p>
                      {unlocked && def.title && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-peach-100 dark:bg-[#2a2010] text-peach-300 font-bold">
                          🏅 {def.title}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-500 dark:text-rose-300/80 mb-2">{def.description}</p>

                    {!unlocked && (
                      <>
                        <div className="h-1.5 rounded-full bg-rose-100 dark:bg-[#34343f] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${percent}%`,
                              background: 'linear-gradient(90deg, #FF8FB1 0%, #B8A4EC 100%)',
                            }}
                          />
                        </div>
                        <p className="text-[10px] mt-1 font-bold text-rose-500">
                          {progress} / {def.threshold}
                        </p>
                      </>
                    )}

                    {unlocked && (
                      <p className="text-[10px] font-bold text-mint-300 flex items-center gap-1">
                        <CheckCircle2 size={10} /> مفتوح · +{def.rewardPoints} نقطة
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
