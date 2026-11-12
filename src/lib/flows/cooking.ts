import type { CookResult } from './types';
import { INGREDIENT_PRESETS, SWEET_INGREDIENTS, BREAKFAST_INGREDIENTS, SNACK_INGREDIENTS } from './presets';

async function suggestAIDish(
  meal: string, people: number, ingredientIds: string[], customIngredients: string[],
  maxTime: number, excludeNames: string[], apiKey: string, model: string
): Promise<CookResult> {
  const allPresets = [...INGREDIENT_PRESETS, ...SWEET_INGREDIENTS, ...BREAKFAST_INGREDIENTS, ...SNACK_INGREDIENTS];
  const chipNames = ingredientIds
    .map(id => allPresets.find(p => p.id === id)?.label)
    .filter((x): x is string => !!x);
  const allIngredients = [...chipNames, ...customIngredients];
  if (allIngredients.length === 0) throw new Error('اختاري مكونات أولاً');

  const excludeStr = excludeNames.length > 0 ? `لا تقترحي: ${excludeNames.join('، ')}.` : '';
  
  let typeRule = '';
  if (meal === 'فطور') {
    typeRule = `⚠️ فطور صباحي بحت. المسموح فقط:
- أساسيات: بيض، جبن، فول، لبن، خبز
- حلويات الصبح: دبس، قشطة، عسل، زبدة، طحينية، زيت زيتون
- مشروبات: شاي، قهوة، نسكافيه، عصير، حليب
- إضافات: تمر، مكسرات

⛔ ممنوع تماماً: دجاج، لحم، سمك، رز، معكرونة، دولمة، بامية، برياني، مقلوبة، كبسة، كبة، أو أي وجبة رئيسية ثقيلة.
إذا المكونات قليلة، اقترحي فطور بسيط (بيض بالخبز، جبن وزعتر، قشطة وعسل، أو شاي مع خبز).`;
  } else if (meal === 'نواشف') {
    typeRule = `⚠️ نواشف (مقليات فقط). المسموح:
- سمبوسة (باللحم أو الجبن)
- فلافل
- بطاطا مقلية
- كبة مقلية
- بصل مقلي
- رقاق مقلي

⛔ ممنوع: أي أكلة مطبوخة (مرقة، رز، دولمة، إلخ).
اقترحي فقط شي يُقلى بالزيت ويكون كنوع من المقبلات أو العشاء الخفيف.`;
  } else if (meal === 'حلو') {
    typeRule = '⚠️ هذا حلى. اقترحي فقط حلويات (كيك، حلى بارد، بسكويت، كنافة). ممنوع اقتراح أكلات مالحة.';
  } else {
    typeRule = `⚠️ هذا ${meal}. اقترحي وجبة رئيسية مالحة. ممنوع اقتراح حلويات.`;
  }
  
  const prompt = `اقترحي ${meal === 'حلو' ? 'حلى' : 'أكلة'} عربية حقيقية لـ "${meal}" لـ ${people} أشخاص، بناءً على هذي المكونات فقط:
${allIngredients.join('، ')}

قيود:
- الوقت: ${maxTime} دقيقة.
- ${excludeStr}
- ${typeRule}
- التزمي بالمكونات المتوفرة. لو قليلة، اقترحي شي بسيط.
- 5-7 خطوات تحضير واضحة.

أرجعي JSON فقط بدون أي نص آخر:
{"dish":"اسم الأكلة","emoji":"🍲","reason":"جملة قصيرة","ingredientsUsed":["مكون1"],"steps":["خطوة 1"],"prepTime":15,"cookTime":45}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ 
        model, 
        messages: [{ role: 'user', content: prompt }], 
        temperature: 0.6, 
        max_tokens: 2000
      }),
    });
    clearTimeout(timer);
    
    if (!res.ok) {
      if (res.status === 429) throw new Error('وصلتي للحد اليومي. جربي باجر.');
      if (res.status === 401) throw new Error('مفتاح AI غير صالح. روحي للإعدادات.');
      throw new Error(`فشل الاتصال (كود ${res.status})`);
    }
    
    const json = await res.json();
    const msg = json?.choices?.[0]?.message;
    let content: string = msg?.content?.trim() || '';
    if (!content && msg?.reasoning) content = msg.reasoning;
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
    if (e.name === 'AbortError') throw new Error('انتهت المهلة. تحققي من الإنترنت.');
    throw e;
  }
}

export async function suggestDish(opts: {
  meal: string; people: number; ingredientIds: string[]; customIngredients?: string[];
  maxTime?: number; forceNew?: boolean; exclude?: string[]; apiKey?: string; model?: string;
}): Promise<CookResult> {
  const { meal, people, ingredientIds, customIngredients = [], maxTime = 90, exclude = [], apiKey, model = 'openai/gpt-oss-20b' } = opts;
  if (!apiKey) throw new Error('AI غير مفعل. روحي للإعدادات.');
  return await suggestAIDish(meal, people, ingredientIds, customIngredients, maxTime, exclude, apiKey, model);
}
