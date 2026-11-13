import type { PeriodType } from '../types';

const PERIOD_AR_TO_ID: Record<string, PeriodType> = {
  'الصبح': 'morning', 'قبل الظهر': 'beforeNoon', 'الظهر': 'noon',
  'العصر': 'afternoon', 'المغرب': 'maghrib', 'الليل': 'evening', 'قبل النوم': 'beforeSleep',
};

export interface AISuggestion { title: string; period: PeriodType; time: string; duration: number; }
export interface AIResult { text: string; suggestions: AISuggestion[]; }

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
      suggestions.push({ title, period, time: validateTime(time), duration: parseInt(durStr) || 30 });
    }
  }
  return { text: mainText, suggestions };
}

const GROQ_KEY = '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';

export async function callGroq(messages: any[]): Promise<AIResult> {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!res.ok) throw new Error(`Groq ${res.status}`);
    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content || '';
    if (!content) throw new Error('رد فارغ');
    return parseAIResponse(content);
  } catch (e: any) {
    throw new Error(e.message || 'فشل الاتصال');
  }
}

export async function testGroqKey(): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [{ role: 'user', content: 'ردي بكلمة واحدة: تمام' }],
        max_tokens: 10,
      }),
    });
    if (!res.ok) return { ok: false, message: `فشل (${res.status})` };
    return { ok: true, message: 'شغّال ✅' };
  } catch (e: any) {
    return { ok: false, message: e.message };
  }
}

export const GROQ_MODELS = [
  { id: 'openai/gpt-oss-20b', label: 'رفيق (سريع)' },
  { id: 'openai/gpt-oss-120b', label: 'رفيق (أذكى)' },
];
