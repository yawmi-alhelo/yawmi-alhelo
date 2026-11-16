import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Crown, Check, Trophy } from 'lucide-react';
import Layout from '../components/Layout';
import { useSettings } from '../stores/useSettings';
import { useRewards } from '../stores/useRewards';
import { getLevelTier } from '../lib/rewards/levels';
import { getAllAchievementStatuses, type AchievementStatus } from '../lib/achievements';

export default function Profile() {
  const nav = useNavigate();
  const { settings, update } = useSettings();
  const { state: rewards } = useRewards();
  const [statuses, setStatuses] = useState<AchievementStatus[]>([]);

  useEffect(() => {
    getAllAchievementStatuses().then(setStatuses);
  }, []);

  const tier = getLevelTier(rewards.points || 0);
  const level = Math.floor((rewards.points || 0) / 100) + 1;
  const nextLevelProgress = (rewards.points || 0) % 100;

  const unlockedTitles = statuses
    .filter(s => s.unlocked && s.def.title)
    .map(s => s.def);

  function selectTitle(title: string) {
    update({ activeTitle: title });
  }

  return (
    <Layout>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => nav(-1)} className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-[#34343f]">
          <ArrowRight size={20} className="text-ink-700 dark:text-rose-100" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">ملفي 🌸</h1>
          <p className="text-sm text-ink-500 dark:text-rose-300/80 mt-0.5">هويتج في يومي الحلو</p>
        </div>
      </div>

      {/* بطاقة الهوية */}
      <div className="card-soft mb-4 text-center py-6 border-2 border-rose-200 dark:border-[#34343f]"
        style={{ background: 'linear-gradient(135deg, rgba(255,143,177,0.15) 0%, rgba(184,164,236,0.15) 100%)' }}>
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${tier.gradient} flex items-center justify-center mx-auto mb-3 text-5xl shadow-lg`}>
          {tier.emoji}
        </div>
        <h2 className="text-xl font-extrabold text-ink-900 dark:text-rose-100">
          {settings.nickname || settings.userName || 'بدون اسم'}
        </h2>
        {settings.activeTitle && (
          <p className="text-sm font-bold text-peach-300 mt-1">🏅 {settings.activeTitle}</p>
        )}
        <div className="flex items-center justify-center gap-3 mt-3 text-xs text-ink-500 dark:text-rose-300/80">
          <span className="font-bold text-rose-500">المستوى {level} · {tier.name}</span>
        </div>

        <div className="mt-3 mx-6">
          <div className="h-1.5 rounded-full bg-white/60 dark:bg-[#34343f] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-lavender-300 transition-all"
              style={{ width: `${nextLevelProgress}%` }} />
          </div>
          <p className="text-[10px] text-ink-500 dark:text-rose-300/80 mt-1">{nextLevelProgress} / 100 للمستوى القادم</p>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="card-soft text-center py-3">
          <p className="text-2xl font-extrabold text-rose-500">{rewards.points || 0}</p>
          <p className="text-[10px] text-ink-500 dark:text-rose-300/80">نقطة</p>
        </div>
        <div className="card-soft text-center py-3">
          <p className="text-2xl font-extrabold text-peach-300">{rewards.flowers || 0}</p>
          <p className="text-[10px] text-ink-500 dark:text-rose-300/80">وردة</p>
        </div>
        <div className="card-soft text-center py-3">
          <p className="text-2xl font-extrabold text-mint-300">{rewards.streak || 0}</p>
          <p className="text-[10px] text-ink-500 dark:text-rose-300/80">يوم ستريك</p>
        </div>
      </div>

      {/* الألقاب */}
      <h2 className="text-sm font-bold text-ink-500 dark:text-rose-300/80 mb-2 px-1 flex items-center gap-1">
        <Crown size={14} /> ألقابي ({unlockedTitles.length})
      </h2>

      {unlockedTitles.length === 0 ? (
        <div className="card-soft text-center py-8 mb-4">
          <Trophy size={32} className="mx-auto text-rose-300 mb-2" />
          <p className="text-sm font-bold text-ink-700 dark:text-rose-100 mb-1">ما عندج ألقاب بعد</p>
          <p className="text-xs text-ink-500 dark:text-rose-300/80">كملي إنجازاتج لتفتحين ألقاب</p>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          <button
            onClick={() => selectTitle('')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl2 border-2 transition-all ${
              !settings.activeTitle
                ? 'border-rose-400 bg-rose-50 dark:bg-[#2a1f2a]'
                : 'border-rose-100 dark:border-[#34343f] bg-white dark:bg-[#252532]'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-[#34343f] flex items-center justify-center">
              <span className="text-sm">—</span>
            </div>
            <p className="flex-1 text-right font-bold text-sm text-ink-700 dark:text-rose-100">بدون لقب</p>
            {!settings.activeTitle && <Check size={18} className="text-rose-500" />}
          </button>

          {unlockedTitles.map(def => {
            const isActive = settings.activeTitle === def.title;
            return (
              <button
                key={def.id}
                onClick={() => selectTitle(def.title!)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl2 border-2 transition-all ${
                  isActive
                    ? 'border-rose-400 bg-rose-50 dark:bg-[#2a1f2a]'
                    : 'border-rose-100 dark:border-[#34343f] bg-white dark:bg-[#252532]'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-peach-100 dark:bg-[#2a2010] flex items-center justify-center text-lg">
                  {def.emoji}
                </div>
                <div className="flex-1 text-right">
                  <p className="font-bold text-sm text-ink-900 dark:text-rose-100">{def.title}</p>
                  <p className="text-[10px] text-ink-500 dark:text-rose-300/80">{def.description}</p>
                </div>
                {isActive && <Check size={18} className="text-rose-500" />}
              </button>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs text-ink-300 dark:text-rose-300/50 mb-4">
        💡 لقبج يظهر في المجموعة والمحادثة
      </p>
    </Layout>
  );
}
