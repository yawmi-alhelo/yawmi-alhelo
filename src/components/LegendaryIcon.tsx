import { CheckCircle2, ListChecks, CalendarCheck, Award, Trophy, Flame, Zap, TrendingUp, Crown, Timer, Target, Brain, Leaf, Sparkles, Flower2, Utensils, ChefHat, Cake, Users, Heart, MessageCircle, Star, Gem } from 'lucide-react';

const getIcon = (id: string, size: number) => {
  switch (id) {
    case 'tasks_1': return <CheckCircle2 size={size} strokeWidth={2.5} />;
    case 'tasks_10': return <ListChecks size={size} strokeWidth={2.5} />;
    case 'tasks_50': return <CalendarCheck size={size} strokeWidth={2.5} />;
    case 'tasks_200': return <Award size={size} strokeWidth={2.5} />;
    case 'tasks_500': return <Trophy size={size} strokeWidth={2.5} />;
    case 'streak_3': return <Flame size={size} strokeWidth={2.5} />;
    case 'streak_7': return <Zap size={size} strokeWidth={2.5} />;
    case 'streak_30': return <TrendingUp size={size} strokeWidth={2.5} />;
    case 'streak_100': return <Crown size={size} strokeWidth={2.5} />;
    case 'focus_5': return <Timer size={size} strokeWidth={2.5} />;
    case 'focus_20': return <Target size={size} strokeWidth={2.5} />;
    case 'focus_100': return <Brain size={size} strokeWidth={2.5} />;
    case 'habit_1': return <Leaf size={size} strokeWidth={2.5} />;
    case 'habit_5': return <Sparkles size={size} strokeWidth={2.5} />;
    case 'habit_10': return <Flower2 size={size} strokeWidth={2.5} />;
    case 'cook_1': return <Utensils size={size} strokeWidth={2.5} />;
    case 'cook_10': return <ChefHat size={size} strokeWidth={2.5} />;
    case 'cook_30': return <Cake size={size} strokeWidth={2.5} />;
    case 'social_1': return <Users size={size} strokeWidth={2.5} />;
    case 'social_5': return <Heart size={size} strokeWidth={2.5} />;
    case 'social_50': return <MessageCircle size={size} strokeWidth={2.5} />;
    case 'special_1000': return <Star size={size} strokeWidth={2.5} />;
    case 'special_5000': return <Gem size={size} strokeWidth={2.5} />;
    default: return <Trophy size={size} strokeWidth={2.5} />;
  }
};

const TIER_COLORS = {
  bronze: { glow: '#cd7f32' },
  silver: { glow: '#e0e0e0' },
  gold: { glow: '#ffd700' },
  platinum: { glow: '#00ffff' },
  diamond: { glow: '#ff00ff' },
};

export const LegendaryIcon = ({ id, tier }: { id: string, tier: string }) => {
  const t = TIER_COLORS[tier as keyof typeof TIER_COLORS] || TIER_COLORS.gold;

  return (
    <div className="relative flex items-center justify-center w-[64px] h-[64px] shrink-0">
      <div className="absolute inset-0 rounded-full blur-lg opacity-50 animate-pulse" style={{ background: t.glow }} />
      <div className="absolute inset-0 rounded-full bg-gray-900 border border-gray-700/50 shadow-[inset_0_0_15px_rgba(0,0,0,0.9)]" />
      <div className="relative z-10 animate-float-slow" style={{ color: t.glow, filter: `drop-shadow(0 0 10px ${t.glow})` }}>
        {getIcon(id, 30)}
      </div>
    </div>
  );
};
