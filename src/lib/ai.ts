import type { PeriodType } from '../types';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

const PERIOD_AR_TO_ID: Record<string, PeriodType> = {
  'الصبح': 'morning',
  'قبل الظهر': 'beforeNoon',
  'الظهر': 'noon',
  'العصر': 'afternoon',
  'المغرب': 'maghrib',
  'الليل': 'evening',
  'قبل النوم': 'beforeSleep',
};

const SYSTEM_PROMPT = `أنتِ "رفيق يومي" — مساعدة شخصية ودودة لتنظيم الحياة اليومية، تتحدثين باللهجة العراقية الطبيعية واللطيفة.

قواعدك:
1. تتحدثين دائماً باللهجة العراقية (مو فصحى، مو خليجية، مو مصرية).
2. أسلوبج حنون وداعم بدون مبالغة.
3. لما المستخدمة تعطيج مهام، اقترحي توزيع زمني عملي.
4. الفترات المتاحة (اكتبيها بالضبط): الصبح | قبل الظهر | الظهر | العصر | المغرب | الليل | قبل النوم
5. ردي بجمل قصيرة وواضحة بالعراقي.
6. استخدمي إيموجي خفيفة (🌸🌷☕💗).
7. لا تكتبين markdown معقد — فقط نص عادي.
8. إذا اقترحتي مهام، ضيفي في النهاية سطر "---" ثم قائمة المهام بهذا الشكل بالضبط:
   - اسم المهمة | الفترة | الساعة (HH:MM) | المدة بالدقائق
   مثال:
   - الطبخ | قبل الظهر | 11:00 | 60
9. إذا المستخدمة ما طلبت مهام، لا تضيفين قسم المهام.
10. أمثلة على العبارات: "عاشت إيدج"، "خلينا نبدأ"، "لا تنسين تاخذين استراحة".
11. التاريخ والوقت الآن: {{DATE}}

المهام الموجودة عند المستخدمة اليوم (لا تقترحي أوقات تتداخل معها):
{{TASKS}}`;

export interface AISuggestion {
  title: string;
  period: PeriodType;
  time: string;
  duration: number;
}

export interface AIResult {
  text: string;
  suggestions: AISuggestion[];
}

function validateTime(t: string): string {
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return '09:00';
  const h = Math.min(23, Math.max(0, parseInt(m[1])));
  const mm = Math.min(59, Math.max(0, parseInt(m[2])));
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function parseAIResponse(raw: string): AIResult {
  const parts = raw.split(/\n---+\n?/);
  const mainText = parts[0].trim();
  const suggestions: AISuggestion[] = [];

  if (parts[1]) {
    const lines = parts[1].split('\n').map(l => l.trim()).filter(l => l.startsWith('-') || l.startsWith('•'));
    for (const line of lines) {
      const clean = line.replace(/^[-•]\s*/, '');
      const cols = clean.split('|').map(c => c.trim());
      if (cols.length < 4) continue;
      const [title, periodAr, time, durStr] = cols;
      const period = PERIOD_AR_TO_ID[periodAr];
      if (!period) continue;
      const duration = parseInt(durStr) || 30;
      suggestions.push({ title, period, time: validateTime(time), duration });
    }
  }

  return { text: mainText, suggestions };
}

async function safeFetch(url: string, opts: RequestInit): Promise<Response> {
  try {
    return await fetch(url, opts);
  } catch (e: any) {
    throw new Error(e?.message || 'فشل الاتصال بالخادم');
  }
}

export async function callGroq(
  apiKey: string,
  model: string,
  userMessage: string,
  tasksSummary: string
): Promise<AIResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  const now = new Date();
  const dateLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const systemPrompt = SYSTEM_PROMPT
    .replace('{{DATE}}', dateLabel)
    .replace('{{TASKS}}', tasksSummary || '(ما عندها مهام مسجلة اليوم)');

  try {
    const res = await safeFetch(GROQ_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.6,
        max_tokens: 1500,
      }),
    });
    clearTimeout(timer);

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Groq ${res.status}: ${t.slice(0, 150)}`);
    }
    const json = await res.json();
    const msg = json?.choices?.[0]?.message;
    let content: string = msg?.content || '';
    // fallback: بعض النماذج تضع الرد في reasoning إذا content فاضي
    if (!content.trim() && msg?.reasoning) {
      content = msg.reasoning;
    }
    if (!content.trim()) throw new Error('رد فارغ — جربي نموذج آخر');
    return parseAIResponse(content);
  } catch (e: any) {
    clearTimeout(timer);
    if (e?.name === 'AbortError') throw new Error('انتهت المهلة — تأكدي من الإنترنت');
    throw e;
  }
}

export async function testGroqKey(
  apiKey: string,
  model: string
): Promise<{ ok: boolean; message: string }> {
  if (!apiKey || !apiKey.startsWith('gsk_')) {
    return { ok: false, message: 'المفتاح يبدأ بـ gsk_ — تأكدي من النسخ' };
  }
  try {
    const res = await safeFetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'ردي بكلمة واحدة فقط: تمام' }],
        max_tokens: 100,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, message: `فشل (${res.status}): ${t.slice(0, 80)}` };
    }
    const j = await res.json();
    const reply = j?.choices?.[0]?.message?.content || '';
    return { ok: true, message: `شغّال ✅ (رد: ${reply.trim().slice(0, 30)})` };
  } catch (e: any) {
    return { ok: false, message: `خطأ شبكة: ${e?.message || 'غير معروف'}` };
  }
}

export const GROQ_MODELS = [
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (الأذكى)' },
  { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (الأسرع)' },
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout (حديث)' },
];
