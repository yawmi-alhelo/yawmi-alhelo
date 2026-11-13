import type { CookResult } from './types';
import { INGREDIENT_PRESETS, SWEET_INGREDIENTS, BREAKFAST_INGREDIENTS, SNACK_INGREDIENTS } from './presets';

const GROQ_KEY = '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';

async function suggestAIDish(
  meal: string, people: number, ingredientIds: string[], customIngredients: string[],
  maxTime: number, excludeNames: string[], model: string
): Promise<CookResult> {
  const allPresets = [...INGREDIENT_PRESETS, ...SWEET_INGREDIENTS, ...BREAKFAST_INGREDIENTS, ...SNACK_INGREDIENTS];
  const chipNames = ingredientIds
    .map(id => allPresets.find(p => p.id === id)?.label)
    .filter((x): x is string => !!x);
    
  const allIngredients = [...chipNames, ...customIngredients];
  if (allIngredients.length === 0) throw new Error('اختاري مكونات أولاً');

  const excludeStr = excludeNames.length > 0 ? `لا تقترحي هذه الأكلات: ${excludeNames.join('، ')}.` : '';
  const isSweet = meal === 'حلو';
  const typeRule = isSweet 
    ? '⚠️ المطلوب اقتراح حلى فقط. ممنوع أكلات مالحة.'
    : '⚠️ اقترحي أكلات مالحة أو وجبات رئيسية فقط.';
  
  const prompt = `اقترحي ${isSweet ? 'حلى' : 'أكلة'} عربية حقيقية لـ "${meal}" تكفي ${people} أشخاص، بناءً على هذي المكونات المتوفرة فقط:
${allIngredients.join('، ')}

قيود:
- الوقت: ${maxTime} دقيقة.
- ${excludeStr}
- ${typeRule}
- 5-7 خطوات تحضير واضحة.

أرجعي **JSON فقط** بدون أي نص إضافي:
{"dish":"اسم الأكلة","emoji":"🍲","reason":"جملة قصيرة","ingredientsUsed":["مكون1"],"steps":["خطوة 1"],"prepTime":15,"cookTime":45}`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({ model: model || 'openai/gpt-oss-20b', messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 2000 })
    });

    if (!res.ok) throw new Error(`Groq ${res.status}`);
    const json = await res.json();
    
    let content: string = json?.choices?.[0]?.message?.content?.trim() || '';
    content = content.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('الرد غير مفهوم. جربي مرة ثانية.');
    
    const parsed = JSON.parse(content.substring(start, end + 1));
    if (!parsed?.dish) throw new Error('ما قدر يقترح أكلة.');

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
    throw new Error(e?.message || 'فشل الاتصال');
  }
}

export async function suggestDish(opts: {
  meal: string; people: number; ingredientIds: string[]; customIngredients?: string[];
  maxTime?: number; forceNew?: boolean; exclude?: string[]; apiKey?: string; model?: string;
}): Promise<CookResult> {
  const { meal, people, ingredientIds, customIngredients = [], maxTime = 90, exclude = [], model = 'openai/gpt-oss-20b' } = opts;
  return await suggestAIDish(meal, people, ingredientIds, customIngredients, maxTime, exclude, model);
}
