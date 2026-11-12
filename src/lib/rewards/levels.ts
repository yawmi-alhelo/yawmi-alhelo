export interface LevelTier {
  minPoints: number;
  maxPoints: number;
  name: string;
  emoji: string;
  gradient: string;
  border: string;
  chatBubble: string;
  chatText: string;
}

export const LEVELS: LevelTier[] = [
  { minPoints: 0,     maxPoints: 199,      name: 'بذرة',        emoji: '🌱', gradient: 'from-mint-200 to-mint-300',         border: 'border-mint-300',       chatBubble: 'bg-mint-100 dark:bg-[#1f2a25]',       chatText: 'text-mint-300' },
  { minPoints: 200,   maxPoints: 399,      name: 'برعم',        emoji: '🌷', gradient: 'from-rose-200 to-rose-300',         border: 'border-rose-300',       chatBubble: 'bg-rose-100 dark:bg-[#2a1f2a]',       chatText: 'text-rose-600' },
  { minPoints: 400,   maxPoints: 899,      name: 'زهرة',        emoji: '🌸', gradient: 'from-rose-300 to-lavender-300',     border: 'border-rose-400',       chatBubble: 'bg-rose-200 dark:bg-[#3a1f2a]',       chatText: 'text-rose-700' },
  { minPoints: 900,   maxPoints: 1899,     name: 'وردة',        emoji: '🌹', gradient: 'from-rose-400 to-rose-500',         border: 'border-rose-500',       chatBubble: 'bg-rose-300 dark:bg-[#4a1f2a]',       chatText: 'text-white' },
  { minPoints: 1900,  maxPoints: 2899,     name: 'عبّاد شمس',   emoji: '🌻', gradient: 'from-peach-200 to-peach-300',       border: 'border-peach-300',      chatBubble: 'bg-peach-100 dark:bg-[#2a2010]',      chatText: 'text-peach-300' },
  { minPoints: 2900,  maxPoints: 4899,     name: 'باقة',        emoji: '💐', gradient: 'from-lavender-200 to-lavender-300', border: 'border-lavender-300',   chatBubble: 'bg-lavender-100 dark:bg-[#2a2535]',   chatText: 'text-lavender-300' },
  { minPoints: 4900,  maxPoints: Infinity, name: 'ملكة الورد',  emoji: '👑', gradient: 'from-peach-300 to-rose-500',        border: 'border-peach-300',      chatBubble: 'bg-peach-200 dark:bg-[#3a2a10]',      chatText: 'text-peach-300' },
];

export function getLevelTier(points: number): LevelTier {
  for (const tier of LEVELS) {
    if (points >= tier.minPoints && points <= tier.maxPoints) return tier;
  }
  return LEVELS[0];
}

export function getNextTier(points: number): LevelTier | null {
  const current = getLevelTier(points);
  const idx = LEVELS.indexOf(current);
  return idx >= 0 && idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}
