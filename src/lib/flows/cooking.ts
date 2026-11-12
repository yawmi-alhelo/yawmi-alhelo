import type { CookResult } from './types';
import { INGREDIENT_PRESETS, IRAQI_DISHES } from './presets';

const CACHE_KEY = 'yawmi_cook_cache_v3';
const CACHE_TTL = 12 * 60 * 60 * 1000;

interface CacheEntry {
  key: string;
  result: CookResult;
  ts: number;
}

function getCache(): CacheEntry[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function setCache(entries: CacheEntry[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(entries.slice(-20))); } catch {}
}

function cacheKey(meal: string, people: number, ids: string[], custom: string[], maxTime: number): string {
  return meal + '|' + people + '|' + [...ids].sort().join(',') + '|' + [...custom].sort().join(',') + '|' + maxTime;
}

type IngItem = typeof INGREDIENT_PRESETS[number];

function getIngredientNames(ids: string[]): string[] {
  return ids.map(id => INGREDIENT_PRESETS.find(p => p.id === id)).filter((p): p is IngItem => p !== undefined).map(p => p.label);
}

function mapCustomToIds(custom: string[]): string[] {
  const ids: string[] = [];
  for (const c of custom) {
    const found = INGREDIENT_PRESETS.find(p => p.label.includes(c) || c.includes(p.label));
    if (found) ids.push(found.id);
  }
  return ids;
}

// ==================== محلي ====================
export function suggestLocalDish(
  meal: string, _people: number, ingredientIds: string[], customIngredients: string[],
  maxTime: number = 999, excludeNames: string[] = []
): CookResult | null {
  const allIds = new Set([...ingredientIds, ...mapCustomToIds(customIngredients)]);
  const candidates = IRAQI_DISHES
    .filter(d => d.meals.includes(meal))
    .filter(d => !excludeNames.includes(d.name))
    .filter(d => (d.prepTime + d.cookTime) <= maxTime)
    .map(d => {
      const matched = d.needs.filter(n => allIds.has(n)).length;
      const missing = d.needs.length - matched;
      return { dish: d, matched, missing, ratio: d.needs.length === 0 ? 0 : matched / d.needs.length };
    })
    // شرط صارم: على الأقل 50% من المكونات متوفرة + مكونين على الأقل
    .filter(x => x.ratio >= 0.5 && x.matched >= 2)
    .sort((a, b) => {
      if (Math.abs(a.ratio - b.ratio) > 0.001) return b.ratio - a.ratio;
      if (a.missing !== b.missing) return a.missing - b.missing;
      return b.matched - a.matched;
    });

  if (candidates.length === 0) {
    console.log('[CookLocal] ما في أكلة مناسبة، المكونات:', [...allIds]);
    return null;
  }
  const best = candidates[0];
  const dish = best.dish;
  const used = dish.needs.filter(n => allIds.has(n)).map(n => INGREDIENT_PRESETS.find(p => p.id === n)?.label || n);
  const missing = dish.needs.filter(n => !allIds.has(n)).map(n => INGREDIENT_PRESETS.find(p => p.id === n)?.label || n);

  return {
    dish: dish.name, emoji: dish.emoji,
    reason: missing.length === 0
      ? `عندج كل المكونات — يلا نسويها 🌸`
      : `عندج ${used.join('، ')} — بس تحتاجين: ${missing.slice(0, 3).join('، ')}`,
    ingredientsUsed: used,
    missingIngredients: missing,
    steps: dish.steps,
    prepTime: dish.prepTime, cookTime: dish.cookTime, source: 'local',
  };
}

// ==================== AI ====================
async function suggestAIDish(
  meal: string, people: number, ingredientIds: string[], customIngredients: string[],
  maxTime: number, excludeNames: string[], apiKey: string, model: string
): Promise<CookResult | null> {
  const chipNames = getIngredientNames(ingredientIds);
  const allIngredients = [...chipNames, ...customIngredients];
  if (allIngredients.length === 0) return null;

  const excludeStr = excludeNames.length > 0 ? `لا تقترحي هذه الأكلات (اقترحي غيرها): ${excludeNames.join('، ')}.` : '';
  
  const prompt = `اقترحي أكلة عراقية حقيقية لـ "${meal}" تكفي ${people} أشخاص، بناءً على هذي المكونات المتوفرة فقط:
${allIngredients.join('، ')}

⚠️ قواعد صارمة جداً (لا تكسرينها):
1. **لا تقترحي أكلة تحتاج مكونات مو متوفرة!** إذا المستخدمة ما ذكرت "دجاج" لا تضيفين دجاج.
2. **التزمي بالمكونات المتوفرة فقط** (+ المكونات الأساسية مثل: ملح، بهارات، زيت، ماء).
3. إذا المكونات المتوفرة **أقل من 3**، اقترحي **أكلة بسيطة جداً** (بيض، شكشوكة، سلطة) — لا تقترحين دولمة أو برياني!
4. في حقل "reason" اكتبي بصراحة: "عندج X فقط، هذا اللي ينفع" أو "تحتاجين مكونات إضافية لهذي الأكلة".
5. **الأكلة تكون عراقية** (بيض بالطماطة، شكشوكة، شوربة، مقلوبة، قيمة، برياني، إلخ).
6. 5-7 خطوات باللهجة العراقية.
7. وقت التحضير + الطبخ ≤ ${maxTime} دقيقة.

الوقت المتاح: ${maxTime} دقيقة.
${excludeStr}

أرجعي **JSON فقط** بدون أي نص إضافي:
{"dish":"اسم الأكلة","emoji":"🍲","reason":"جملة قصيرة عراقية","ingredientsUsed":["مكون1","مكون2"],"missingIngredients":["مكون ناقص1"],"steps":["خطوة 1","خطوة 2"],"prepTime":15,"cookTime":45}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    console.log('[CookAI] بدء الاتصال بـ Groq...');
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.8, max_tokens: 800 }),
    });
    clearTimeout(timer);
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.warn('[CookAI] فشل:', res.status, errBody.slice(0, 200));
      return null;
    }
    const json = await res.json();
    let content: string = json?.choices?.[0]?.message?.content?.trim() || '';
    // إزالة markdown wrappers
    content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start === -1 || end === -1) {
      console.warn('[Cooking AI] ما لقى JSON');
      return null;
    }
    let parsed;
    try {
      parsed = JSON.parse(content.substring(start, end + 1));
    } catch (e) {
      console.warn('[Cooking AI] JSON فاشل:', e, content.substring(0, 200));
      return null;
    }
    if (!parsed?.dish) return null;

    return {
      dish: String(parsed.dish), emoji: parsed.emoji || '🍲',
      reason: parsed.reason || '',
      ingredientsUsed: Array.isArray(parsed.ingredientsUsed) ? parsed.ingredientsUsed.map(String) : [],
      missingIngredients: Array.isArray(parsed.missingIngredients) ? parsed.missingIngredients.map(String) : [],
      steps: Array.isArray(parsed.steps) ? parsed.steps.map(String) : [],
      prepTime: Number(parsed.prepTime) || 10, cookTime: Number(parsed.cookTime) || 30,
      source: 'ai',
    };
  } catch (e: any) {
    console.warn('[CookAI] threw:', e?.message);
    return null;
  }
}

export async function suggestDish(opts: {
  meal: string; people: number; ingredientIds: string[]; customIngredients?: string[];
  maxTime?: number; forceNew?: boolean; exclude?: string[]; apiKey?: string; model?: string;
}): Promise<CookResult> {
  const { meal, people, ingredientIds, customIngredients = [], maxTime = 90, forceNew = false, exclude = [], apiKey, model = 'openai/gpt-oss-20b' } = opts;
  const key = cacheKey(meal, people, ingredientIds, customIngredients, maxTime);

  if (!forceNew) {
    const hit = getCache().find(c => c.key === key && Date.now() - c.ts < CACHE_TTL);
    if (hit) return hit.result;
  }

  if (apiKey) {
    const ai = await suggestAIDish(meal, people, ingredientIds, customIngredients, maxTime, exclude, apiKey, model);
    if (ai) {
      const cache = getCache();
      cache.push({ key, result: ai, ts: Date.now() });
      setCache(cache);
      return ai;
    }
  }

  const local = suggestLocalDish(meal, people, ingredientIds, customIngredients, maxTime, exclude);
  if (local) {
    const cache = getCache();
    cache.push({ key, result: local, ts: Date.now() });
    setCache(cache);
    return local;
  }

  // Fallback إذا كلشي فشل — نختار أي أكلة سريعة
  const fallback = IRAQI_DISHES.filter(d => d.meals.includes(meal) && (d.prepTime + d.cookTime) <= Math.max(maxTime, 120))[0];
  if (fallback) {
    return {
      dish: fallback.name, emoji: fallback.emoji, reason: 'أسرع أكلة متوفرة 🌸',
      ingredientsUsed: fallback.needs, steps: fallback.steps,
      prepTime: fallback.prepTime, cookTime: fallback.cookTime, source: 'local',
    };
  }

  return {
    dish: 'بيض بالطماطة', emoji: '🍳', reason: 'أسهل شي بسرعة 🌸',
    ingredientsUsed: ['بيض', 'طماطة'],
    steps: ['حمري بصل', 'ضيفي طماطة', 'ضيفي بيض', 'قدميها بالخبز'],
    prepTime: 5, cookTime: 10, source: 'local',
  };
}
