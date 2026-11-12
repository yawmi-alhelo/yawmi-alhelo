import { useState } from 'react';
import { X, Check, Loader2, ChefHat, Sparkles, WifiOff, Plus, Clock, Heart, ShoppingCart } from 'lucide-react';
import { INGREDIENT_GROUPS, INGREDIENT_PRESETS } from '../../lib/flows/presets';
import { suggestDish } from '../../lib/flows/cooking';
import type { CookResult } from '../../lib/flows/types';

const MEALS = [
  { id: 'فطور', emoji: '🥐' },
  { id: 'غداء', emoji: '🍲' },
  { id: 'عشاء', emoji: '🍽️' },
  { id: 'نواشف', emoji: '🍪' },
  { id: 'حلو', emoji: '🍮' },
];

const TIME_OPTIONS = [
  { label: '١٥ دقيقة', value: 15 },
  { label: '٣٠ دقيقة', value: 30 },
  { label: 'ساعة', value: 60 },
  { label: 'ساعتين', value: 120 },
  { label: 'أي وقت', value: 999 },
];

interface Props {
  apiKey?: string;
  model?: string;
  onClose: () => void;
  onSave?: (result: CookResult, meal: string) => void;
}

export default function CookingModal({ apiKey, model, onClose, onSave }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [meal, setMeal] = useState<string>('');
  const [people, setPeople] = useState(2);
  const [selected, setSelected] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [maxTime, setMaxTime] = useState(999);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CookResult | null>(null);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [favState, setFavState] = useState<'idle'|'saving'|'saved'>('idle');
  const [shoppingAdded, setShoppingAdded] = useState(false);

  async function handleSaveFavorite() {
    if (!result) return;
    setFavState('saving');
    const { addFavorite } = await import('../../lib/favorites');
    await addFavorite(result, meal);
    setFavState('saved');
    // فحص إنجازات الطبخ
    try {
      const { checkForNewAchievements } = await import('../../lib/achievements');
      const { useRewards } = await import('../../stores/useRewards');
      const newAch = await checkForNewAchievements();
      if (newAch.length > 0) {
        useRewards.setState({ lastAchievement: newAch[0] });
        setTimeout(() => useRewards.setState({ lastAchievement: null }), 6500);
      }
    } catch {}
  }

  async function handleAddMissingToShopping() {
    if (!result?.missingIngredients || result.missingIngredients.length === 0) return;
    const { Shopping } = await import('../../lib/repositories');
    for (const name of result.missingIngredients) {
      await Shopping.addShoppingItem(name);
    }
    setShoppingAdded(true);
  }

  function toggleIngredient(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function parseCustom(text: string): string[] {
    return text.split(/[,،\n\s]+/).map(x => x.trim()).filter(x => x.length > 0);
  }

  async function handleSuggest(forceNew = false) {
    const custom = parseCustom(customInput);
    if (selected.length === 0 && custom.length === 0) return;
    setLoading(true);
    try {
      const r = await suggestDish({
        meal, people,
        ingredientIds: selected,
        customIngredients: custom,
        maxTime,
        forceNew,
        exclude: forceNew ? excluded : [],
        apiKey, model,
      });
      setResult(r);
      setFavState('idle');
      setShoppingAdded(false);
      if (forceNew) setExcluded([...excluded, r.dish]);
      else setExcluded([r.dish]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSecondSuggestion() {
    await handleSuggest(true);
  }

  function handleDone() {
    if (result && onSave) onSave(result, meal);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center">
      <div className="bg-white dark:bg-[#252532] w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[94vh] flex flex-col">
        <div className="px-5 py-4 border-b border-rose-100 dark:border-[#34343f] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-ink-900 dark:text-rose-100">شنو أطبخ؟ 👩‍🍳</h2>
            <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-0.5">الخطوة {step} من 3</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-[#34343f]">
            <X size={20} className="text-ink-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {result ? (
            <div>
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">{result.emoji}</div>
                <div className="flex items-center justify-center gap-1 mb-1 text-[10px] font-bold">
                  {result.source === 'ai'
                    ? <span className="text-lavender-300 flex items-center gap-1"><Sparkles size={10} /> ذكاء اصطناعي</span>
                    : <span className="text-ink-300 flex items-center gap-1"><WifiOff size={10} /> محلي</span>}
                </div>
                <h3 className="text-xl font-extrabold text-ink-900 dark:text-rose-100">{result.dish}</h3>
                {result.reason && <p className="text-sm text-ink-500 dark:text-rose-300/80 mt-1 px-4">{result.reason}</p>}
                <div className="flex items-center justify-center gap-3 mt-2 text-xs text-ink-500 dark:text-rose-300/80">
                  <span>⏱️ تحضير {result.prepTime} د</span>
                  <span>·</span>
                  <span>🔥 طبخ {result.cookTime} د</span>
                </div>
              </div>
              {result.missingIngredients && result.missingIngredients.length > 0 && (
                <div className="mb-3 p-3 rounded-xl2 bg-peach-100 dark:bg-[#2a2010] border-2 border-peach-200 dark:border-[#3a3020]">
                  <p className="text-xs font-bold text-peach-300 mb-1 flex items-center gap-1">
                    ⚠️ تحتاجين بعد
                  </p>
                  <p className="text-sm font-bold text-ink-900 dark:text-rose-100">
                    {result.missingIngredients.join(' · ')}
                  </p>
                </div>
              )}
              {result.ingredientsUsed.length > 0 && (
                <div className="mb-4 p-3 rounded-xl2 bg-mint-100 dark:bg-[#1f2a25] border border-mint-200 dark:border-[#2a3a32]">
                  <p className="text-xs font-bold text-mint-300 mb-1">🎯 من اللي عندج</p>
                  <p className="text-sm text-ink-700 dark:text-rose-100">{result.ingredientsUsed.join(' · ')}</p>
                </div>
              )}
              {result.steps.length > 0 && (
                <div className="p-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24]">
                  <p className="text-xs font-bold text-rose-500 mb-2">📝 الخطوات</p>
                  <ol className="space-y-2">
                    {result.steps.map((s, i) => (
                      <li key={i} className="text-sm text-ink-700 dark:text-rose-100 leading-relaxed">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-400 text-white text-xs font-bold ml-1 align-middle">{i + 1}</span>
                        <span className="mr-1">{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleSaveFavorite}
                  disabled={favState !== 'idle'}
                  className={`flex-1 py-2.5 rounded-xl2 font-bold text-sm flex items-center justify-center gap-2 ${
                    favState === 'saved'
                      ? 'bg-rose-400 text-white'
                      : 'bg-rose-100 dark:bg-[#34343f] text-rose-500'
                  }`}
                >
                  <Heart size={16} fill={favState === 'saved' ? 'currentColor' : 'none'} />
                  {favState === 'saved' ? 'محفوظة ❤️' : favState === 'saving' ? '...' : 'للمفضلة'}
                </button>
                {result.missingIngredients && result.missingIngredients.length > 0 && (
                  <button
                    onClick={handleAddMissingToShopping}
                    disabled={shoppingAdded}
                    className={`flex-1 py-2.5 rounded-xl2 font-bold text-sm flex items-center justify-center gap-2 ${
                      shoppingAdded ? 'bg-mint-300 text-white' : 'bg-peach-100 dark:bg-[#34343f] text-peach-300'
                    }`}
                  >
                    <ShoppingCart size={16} />
                    {shoppingAdded ? 'انضافت ✓' : `للتسوق (${result.missingIngredients.length})`}
                  </button>
                )}
              </div>
            </div>
          ) : step === 1 ? (
            <div>
              <p className="text-sm font-bold text-rose-500 mb-3 text-glow">شنو الوجبة؟</p>
              <div className="grid grid-cols-3 gap-2">
                {MEALS.map(m => (
                  <button key={m.id} onClick={() => { setMeal(m.id); setStep(2); }} className="card-soft py-5 text-center active:scale-95 transition-transform">
                    <div className="text-4xl mb-2">{m.emoji}</div>
                    <p className="font-bold text-ink-900 dark:text-rose-100">{m.id}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : step === 2 ? (
            <div>
              <p className="text-sm font-bold text-rose-500 mb-3 text-glow">لكم شخص؟</p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 4, 6, 8, 10].map(n => (
                  <button key={n} onClick={() => setPeople(n)} className={`py-4 rounded-xl2 font-bold ${people === n ? 'bg-rose-400 text-white' : 'bg-rose-50 dark:bg-[#1a1a24] text-ink-700 dark:text-rose-200'}`}>{n}</button>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl2 bg-rose-100 dark:bg-[#34343f] text-ink-700 dark:text-rose-200 font-semibold">← رجوع</button>
                <button onClick={() => setStep(3)} className="flex-1 btn-primary">التالي →</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-3 rounded-xl2 border-2 border-dashed border-peach-200 dark:border-[#34343f] bg-peach-100/40 dark:bg-[#1a1a24]/50">
                <label className="block text-xs font-bold text-rose-500 mb-2 text-glow">
                  <Clock size={12} className="inline" /> كم وقت عندج؟
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIME_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setMaxTime(opt.value)}
                      className={`px-3 py-1.5 rounded-xl2 text-xs font-semibold ${maxTime === opt.value ? 'bg-peach-300 text-white' : 'bg-white dark:bg-[#252532] text-ink-700 dark:text-rose-200 border border-rose-100 dark:border-[#34343f]'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-sm font-bold text-rose-500 mb-3 text-glow">شنو موجود بالثلاجة؟</p>
              {INGREDIENT_GROUPS.map(group => {
                const items = INGREDIENT_PRESETS.filter(i => i.groupId === group.id);
                return (
                  <div key={group.id} className="mb-4">
                    <p className="text-xs font-bold text-ink-500 dark:text-rose-300/80 mb-1.5">{group.emoji} {group.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {items.map(item => {
                        const on = selected.includes(item.id);
                        return (
                          <button key={item.id} onClick={() => toggleIngredient(item.id)}
                            className={`px-3 py-1.5 rounded-xl2 text-xs font-semibold flex items-center gap-1 ${on ? 'bg-mint-300 text-white' : 'bg-rose-50 dark:bg-[#1a1a24] text-ink-700 dark:text-rose-200'}`}>
                            {on && <Check size={12} />} {item.emoji} {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <div className="mt-4 p-3 rounded-xl2 border-2 border-dashed border-rose-200 dark:border-[#34343f] bg-rose-50/50 dark:bg-[#1a1a24]/50">
                <label className="block text-xs font-bold text-rose-500 mb-2 text-glow">
                  <Plus size={12} className="inline" /> إضافة مكونات يدوياً
                </label>
                <input type="text" value={customInput} onChange={e => setCustomInput(e.target.value)}
                  placeholder="مثلاً: بامية، لحم، رز، شلغم..."
                  className="w-full px-3 py-2 rounded-xl2 bg-white dark:bg-[#252532] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400 text-sm" />
              </div>
              <button onClick={() => setStep(2)} className="py-2 text-xs text-rose-500 font-semibold mt-2">← عدلي عدد الأشخاص</button>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-rose-100 dark:border-[#34343f] shrink-0" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          {result ? (
            <div className="flex gap-2">
              <button onClick={handleSecondSuggestion} disabled={loading} className="flex-1 py-3 rounded-xl2 bg-rose-100 dark:bg-[#34343f] text-ink-700 dark:text-rose-200 font-semibold disabled:opacity-50">
                {loading ? '⏳' : 'اقتراح ثاني'}
              </button>
              <button onClick={handleDone} className="flex-1 btn-primary">تمام</button>
            </div>
          ) : step === 3 ? (
            <button onClick={() => handleSuggest(false)} disabled={(selected.length === 0 && customInput.trim().length === 0) || loading}
              className="w-full btn-primary disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={18} className="animate-spin" /> جاري الاقتراح...</> : <><ChefHat size={18} /> اقترحي أكلة ({selected.length + parseCustom(customInput).length})</>}
            </button>
          ) : (
            <div className="h-4" />
          )}
        </div>
      </div>
    </div>
  );
}
