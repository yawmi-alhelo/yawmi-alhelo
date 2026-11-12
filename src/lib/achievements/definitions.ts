export type AchievementCategory = 'tasks' | 'streak' | 'focus' | 'habits' | 'cooking' | 'special' | 'social';
export type AchievementMetric = 'tasksCompleted' | 'streak' | 'focusSessions' | 'habitsCount' | 'cookingCount' | 'points' | 'messages' | 'members';

export interface AchievementDef {
  id: string;
  category: AchievementCategory;
  emoji: string;
  name: string;
  description: string;
  metric: AchievementMetric;
  threshold: number;
  rewardPoints: number;
  title?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

export const CATEGORY_LABELS: Record<AchievementCategory, { name: string; emoji: string }> = {
  tasks:    { name: 'الإنجاز',  emoji: '✅' },
  streak:   { name: 'الاستمرار', emoji: '🔥' },
  focus:    { name: 'التركيز',  emoji: '⏱️' },
  habits:   { name: 'العادات',  emoji: '🌿' },
  cooking:  { name: 'الطبخ',    emoji: '🍳' },
  social:   { name: 'المجموعة', emoji: '👥' },
  special:  { name: 'خاصة',     emoji: '⭐' },
};

export const ACHIEVEMENTS: AchievementDef[] = [
  // ✅ الإنجاز
  { id: 'tasks_1',   category: 'tasks', emoji: '🌱', name: 'أول خطوة',      description: 'أول مهمة تخلصينها',               metric: 'tasksCompleted', threshold: 1,    rewardPoints: 20,   tier: 'bronze' },
  { id: 'tasks_10',  category: 'tasks', emoji: '🌿', name: 'بداية قوية',    description: '10 مهام مكتملة',                  metric: 'tasksCompleted', threshold: 10,   rewardPoints: 50,   tier: 'bronze' },
  { id: 'tasks_50',  category: 'tasks', emoji: '🌾', name: 'منتظمة',        description: '50 مهمة مكتملة',                  metric: 'tasksCompleted', threshold: 50,   rewardPoints: 100,  tier: 'silver' },
  { id: 'tasks_200', category: 'tasks', emoji: '🌳', name: 'محترفة',        description: '200 مهمة مكتملة',                 metric: 'tasksCompleted', threshold: 200,  rewardPoints: 300,  title: 'المحترفة', tier: 'gold' },
  { id: 'tasks_500', category: 'tasks', emoji: '🌲', name: 'أسطورة',        description: '500 مهمة مكتملة',                 metric: 'tasksCompleted', threshold: 500,  rewardPoints: 1000, title: 'الأسطورة', tier: 'diamond' },

  // 🔥 الستريك
  { id: 'streak_3',   category: 'streak', emoji: '🔥', name: 'لهيب',        description: '3 أيام متواصلة',                  metric: 'streak', threshold: 3,   rewardPoints: 30,   tier: 'bronze' },
  { id: 'streak_7',   category: 'streak', emoji: '🔥🔥', name: 'أسبوع كامل', description: '7 أيام متواصلة',                  metric: 'streak', threshold: 7,   rewardPoints: 100,  title: 'الثابتة', tier: 'silver' },
  { id: 'streak_30',  category: 'streak', emoji: '💎', name: 'شهر متواصل',  description: '30 يوم متواصل',                   metric: 'streak', threshold: 30,  rewardPoints: 500,  title: 'الجوهرة', tier: 'gold' },
  { id: 'streak_100', category: 'streak', emoji: '👑', name: 'الملكة',      description: '100 يوم متواصل',                  metric: 'streak', threshold: 100, rewardPoints: 2000, title: 'ملكة الاستمرار', tier: 'diamond' },

  // ⏱️ التركيز
  { id: 'focus_5',   category: 'focus', emoji: '⏱️', name: 'المتمركزة',    description: '5 جلسات تركيز',                   metric: 'focusSessions', threshold: 5,   rewardPoints: 20,   tier: 'bronze' },
  { id: 'focus_20',  category: 'focus', emoji: '🎯', name: 'المبدعة',      description: '20 جلسة تركيز',                   metric: 'focusSessions', threshold: 20,  rewardPoints: 80,   title: 'المبدعة', tier: 'silver' },
  { id: 'focus_100', category: 'focus', emoji: '⚡', name: 'المتوهجة',     description: '100 جلسة تركيز',                  metric: 'focusSessions', threshold: 100, rewardPoints: 400,  title: 'المتوهجة', tier: 'gold' },

  // 🌿 العادات
  { id: 'habit_1',  category: 'habits', emoji: '🌱', name: 'عادة جديدة',   description: 'أول عادة أضفتيها',                metric: 'habitsCount', threshold: 1,  rewardPoints: 15,   tier: 'bronze' },
  { id: 'habit_5',  category: 'habits', emoji: '🌿', name: 'مثابرة',        description: '5 عادات عندج',                    metric: 'habitsCount', threshold: 5,  rewardPoints: 100,  title: 'المثابرة', tier: 'silver' },
  { id: 'habit_10', category: 'habits', emoji: '🌸', name: 'ملكة العادات',  description: '10 عادات عندج',                   metric: 'habitsCount', threshold: 10, rewardPoints: 300,  title: 'ملكة العادات', tier: 'gold' },

  // 🍳 الطبخ
  { id: 'cook_1',  category: 'cooking', emoji: '🍳', name: 'طباخة مبتدئة', description: 'أول وصفة للمفضلة',                metric: 'cookingCount', threshold: 1,  rewardPoints: 15,  tier: 'bronze' },
  { id: 'cook_10', category: 'cooking', emoji: '🍲', name: 'ماهرة',        description: '10 وصفات محفوظة',                 metric: 'cookingCount', threshold: 10, rewardPoints: 80,  title: 'الطباخة', tier: 'silver' },
  { id: 'cook_30', category: 'cooking', emoji: '👩‍🍳', name: 'شيف',        description: '30 وصفة محفوظة',                  metric: 'cookingCount', threshold: 30, rewardPoints: 300, title: 'الشيف', tier: 'gold' },

  // 👥 المجموعة
  { id: 'social_1',  category: 'social', emoji: '👥', name: 'اجتماعية',     description: 'انضميتي لمجموعة',                 metric: 'members', threshold: 1,  rewardPoints: 20,  tier: 'bronze' },
  { id: 'social_5',  category: 'social', emoji: '🌟', name: 'قائدة',        description: '5 أعضاء في مجموعتج',              metric: 'members', threshold: 5,  rewardPoints: 100, title: 'القائدة', tier: 'silver' },
  { id: 'social_50', category: 'social', emoji: '💬', name: 'دلوعة',        description: '50 رسالة في المجموعة',            metric: 'messages', threshold: 50, rewardPoints: 50,  tier: 'bronze' },

  // ⭐ خاصة
  { id: 'special_1000', category: 'special', emoji: '⭐', name: 'النجمة',   description: '1000 نقطة',                       metric: 'points', threshold: 1000, rewardPoints: 100,  title: 'النجمة', tier: 'gold' },
  { id: 'special_5000', category: 'special', emoji: '💫', name: 'التاج',     description: '5000 نقطة',                       metric: 'points', threshold: 5000, rewardPoints: 500,  title: 'التاج', tier: 'platinum' },
];

export const TIER_COLORS: Record<AchievementDef['tier'], { bg: string; border: string; glow: string }> = {
  bronze:   { bg: 'from-orange-200 to-orange-300', border: 'border-orange-300', glow: 'shadow-[0_0_20px_rgba(251,146,60,0.5)]' },
  silver:   { bg: 'from-gray-200 to-gray-300',     border: 'border-gray-300',   glow: 'shadow-[0_0_20px_rgba(156,163,175,0.5)]' },
  gold:     { bg: 'from-yellow-200 to-yellow-300', border: 'border-yellow-300', glow: 'shadow-[0_0_25px_rgba(250,204,21,0.6)]' },
  platinum: { bg: 'from-cyan-200 to-cyan-300',     border: 'border-cyan-300',   glow: 'shadow-[0_0_25px_rgba(34,211,238,0.6)]' },
  diamond:  { bg: 'from-purple-200 to-pink-200',   border: 'border-purple-300', glow: 'shadow-[0_0_30px_rgba(168,85,247,0.6)]' },
};
