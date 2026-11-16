import { useEffect } from 'react';

interface Props {
  achievement: {
    emoji: string;
    name: string;
    description: string;
    rewardPoints: number;
    title?: string;
    tier: string;
  };
  onClose: () => void;
}

export default function AchievementPopup({ achievement, onClose }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#252532] rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center relative overflow-hidden"
        style={{ animation: 'popIn 0.5s ease-out' }}>
        {/* شرارات */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 text-2xl animate-ping" style={{ animationDuration: '2s' }}>✨</div>
          <div className="absolute top-8 right-6 text-xl animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.3s' }}>⭐</div>
          <div className="absolute bottom-8 left-8 text-xl animate-ping" style={{ animationDuration: '2.2s', animationDelay: '0.6s' }}>🌟</div>
          <div className="absolute bottom-4 right-4 text-2xl animate-ping" style={{ animationDuration: '2.8s', animationDelay: '0.9s' }}>✨</div>
        </div>

        <p className="text-xs font-bold text-rose-500 mb-2">🎊 إنجاز جديد!</p>
        <div className="text-7xl mb-3 animate-bounce" style={{ animationDuration: '1s' }}>
          {achievement.emoji}
        </div>
        <h2 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100 mb-1">
          {achievement.name}
        </h2>
        <p className="text-sm text-ink-500 dark:text-rose-300/80 mb-4">
          {achievement.description}
        </p>

        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="px-3 py-1.5 rounded-full text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #FF8FB1 0%, #B8A4EC 100%)' }}>
            +{achievement.rewardPoints} نقطة
          </span>
          {achievement.title && (
            <span className="px-3 py-1.5 rounded-full bg-peach-100 dark:bg-[#2a2010] text-peach-300 font-bold text-sm">
              🏅 {achievement.title}
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl2 text-white font-extrabold"
          style={{ background: 'linear-gradient(135deg, #FF8FB1 0%, #B8A4EC 100%)' }}
        >
          عاشت إيدج 🌸
        </button>
      </div>
    </div>
  );
}
