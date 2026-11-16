import { useEffect } from 'react';
import { useRewards } from '../stores/useRewards';
import { getLevelTier } from '../lib/rewards/levels';

export default function RewardBadge() {
  const { state, load, lastUnlock, lastTierUnlock, clearUnlock } = useRewards();

  useEffect(() => {
    load();
  }, [load]);

  const tier = getLevelTier(state.points);
  const flower = tier.emoji;
  const level = Math.floor(state.points / 100) + 1;
  const progress = state.points % 100;

  return (
    <>
      <div className={`card-soft flex items-center gap-3 py-3 border-2 ${tier.border}`}>
        <div className={`text-4xl w-14 h-14 rounded-2xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center shadow-soft`}>{flower}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <p className="text-sm font-extrabold text-ink-900 dark:text-rose-100">
              المستوى {level}
            </p>
            <p className="text-xs text-rose-500 font-bold">
              {state.points} نقطة
            </p>
          </div>
          <div className="h-1.5 rounded-full bg-rose-100 dark:bg-[#34343f] mt-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #FF8FB1 0%, #B8A4EC 100%)',
              }}
            />
          </div>
          <p className="text-[10px] text-ink-500 dark:text-rose-300/80 mt-1">
            {state.flowers} وردة · {state.tasksCompleted} مهمة · 🔥 {state.streak || 0} يوم
          </p>
        </div>
      </div>

      {/* Tier Unlock Overlay */}
      {lastTierUnlock && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center pointer-events-none">
          <div
            className="rounded-3xl shadow-2xl p-6 text-center animate-[popIn_0.4s_ease-out] mx-4"
            style={{ background: 'linear-gradient(135deg, #FF8FB1 0%, #B8A4EC 100%)' }}
          >
            <div className="text-7xl mb-2 animate-bounce">{lastTierUnlock.emoji}</div>
            <p className="text-2xl font-extrabold text-white mb-1">🎊 ترقية!</p>
            <p className="text-lg font-bold text-white">إنتي هسة {lastTierUnlock.name}</p>
            <p className="text-xs text-white/80 mt-2">عاشت إيدج 🌸</p>
          </div>
        </div>
      )}

      {/* Celebration overlay */}
      {lastUnlock && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
          onClick={clearUnlock}
        >
          <div className="bg-white dark:bg-[#252532] rounded-3xl shadow-2xl p-6 text-center animate-[popIn_0.4s_ease-out] mx-4">
            {lastUnlock.flowerUnlocked ? (
              <>
                <div className="text-7xl mb-2 animate-bounce">🌸</div>
                <p className="text-xl font-extrabold text-rose-500 mb-1">تفتحت وردة! 🌷</p>
                <p className="text-sm text-ink-500 dark:text-rose-300/80">
                  عاشت إيدج، كملي هيك!
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-2">🎉</div>
                <p className="text-lg font-extrabold text-rose-500 mb-1">
                  +{lastUnlock.pointsEarned} نقطة
                </p>
                <p className="text-sm text-ink-500 dark:text-rose-300/80">
                  عاشت إيدج، خلصتيها!
                </p>
              </>
            )}
            <p className="text-xs text-rose-400 font-bold mt-3">
              المجموع: {lastUnlock.newPoints} نقطة
            </p>
          </div>
        </div>
      )}
    </>
  );
}
