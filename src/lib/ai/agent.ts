import type { Task } from '../../types';
import { buildToolCatalog, executeTool, getTool, getAllTools, type ToolResult } from '../tools';
import { buildMemoryContext, extractMemoryFromText, saveMemory } from '../memory';
import { generateLocalReply } from '../assistant';
import { SYSTEM_PROMPT_AGENT } from './prompts';

let lastLocalReason = '';
export function getLastLocalReason() { return lastLocalReason; }

export interface AgentAction {
  type: 'text' | 'tool';
  toolName?: string;
  toolArgs?: Record<string, any>;
  result?: ToolResult;
  text: string;
}

export interface AgentReply {
  text: string;
  source: 'ai' | 'local' | 'tool';
  actions: AgentAction[];
  pendingConfirm?: {
    toolName: string;
    args: Record<string, any>;
    preview: string;
  };
}

const PERIOD_KEYWORDS: Record<string, string> = {
  'الصبح': 'morning', 'صبح': 'morning',
  'قبل الظهر': 'beforeNoon',
  'الظهر': 'noon', 'الضهر': 'noon',
  'العصر': 'afternoon',
  'المغرب': 'maghrib',
  'الليل': 'evening',
  'قبل النوم': 'beforeSleep',
};

function detectPeriod(text: string): string | null {
  for (const k of Object.keys(PERIOD_KEYWORDS)) {
    if (text.includes(k)) return PERIOD_KEYWORDS[k];
  }
  return null;
}

function detectTime(text: string): string | null {
  const m = text.match(/(?:الساعة|الساعه|الساع|بوقت)\s+(\d{1,2})(?::(\d{2}))?/);
  if (m) {
    const h = parseInt(m[1]);
    const mm = m[2] ? parseInt(m[2]) : 0;
    return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }
  return null;
}

function detectDuration(text: string): number | null {
  if (/ساعتين/.test(text)) return 120;
  if (/ساعة\s+ونص|ساعه\s+ونص/.test(text)) return 90;
  if (/(نص|نصف)\s*ساع/.test(text)) return 30;
  if (/ربع\s*ساع/.test(text)) return 15;
  const dm = text.match(/(\d+)\s*دقيق/);
  if (dm) return parseInt(dm[1]);
  if (/ساعة|ساعه/.test(text)) return 60;
  return null;
}

interface QuickMatch { toolName: string; args: Record<string, any>; preview: string; }

export function detectQuickAction(message: string): QuickMatch | null {
  const t = message.trim();

  const addTask = t.match(/(?:أضيفي|اضيفي|ضيفيلي|ضيفي|أضيف|اضيف|أريد\s+أضيف|اريد\s+اضيف)\s+(?:مهمة|شغلة)?\s*(.+)/i);
  if (addTask && addTask[1] && addTask[1].length > 1 && addTask[1].length < 100) {
    const title = addTask[1].trim()
      .replace(/^(?:بعنوان|باسم)\s+/, '')
      .replace(/\s+(?:باجر|اليوم|الصبح|الظهر|العصر|الليل|قبل النوم|الساعة\s+\d+.*)$/i, '')
      .trim();
    if (title && title.length >= 2) {
      const args: Record<string, any> = { title };
      const period = detectPeriod(t); if (period) args.period = period;
      const time = detectTime(t); if (time) args.time = time;
      const duration = detectDuration(t); if (duration) args.duration = duration;
      return {
        toolName: 'add_task', args,
        preview: `➕ إضافة مهمة: "${title}"${time ? ` الساعة ${time}` : ''}`,
      };
    }
  }

  if (/(?:اعرضي|أعرضي|وريني|شوفي)\s*(?:عندي|عندج|مهامي|المهام|شغلاتي|اليوم)/i.test(t) ||
      /^مهامي$|^مهام اليوم$|^شغلات اليوم$/i.test(t)) {
    return { toolName: 'list_tasks', args: {}, preview: '📋 عرض مهام اليوم' };
  }

  const complete = t.match(/(?:خلصت|انهيت|أنهيت|كملت|أكملت|اكملت|علمي|سجلي)\s+(.+)/i);
  if (complete && complete[1]) {
    const query = complete[1].trim()
      .replace(/^(?:مهمة|شغلة)\s+/, '')
      .replace(/\s+(?:تم|خلص|انتهى)$/i, '').trim();
    if (query.length >= 2 && query.length < 60) {
      return {
        toolName: 'complete_task', args: { query },
        preview: `✅ تعليم "${query}" كمنجزة`,
      };
    }
  }

  const del = t.match(/(?:احذفي|أحذفي|امسحي|امسح|شيلی|شيلي|احذف)\s+(?:مهمة)?\s*(.+)/i);
  if (del && del[1]) {
    const query = del[1].trim();
    if (query.length >= 2 && query.length < 60) {
      return { toolName: 'delete_task', args: { query }, preview: `🗑️ حذف "${query}"` };
    }
  }

  const appt = t.match(/(?:أضيفي|اضيفي|ضيفيلي|ضيفي)\s+(?:موعد|ميعاد)\s+(.+)/i);
  if (appt && appt[1]) {
    const time = detectTime(t);
    if (time) {
      const title = appt[1].replace(/(?:الساعة|الساعه|بوقت)\s+\d+.*$/i, '').trim();
      if (title) {
        return {
          toolName: 'add_appointment', args: { title, time },
          preview: `📅 موعد "${title}" الساعة ${time}`,
        };
      }
    }
  }

  return null;
}

export interface AgentOptions {
  apiKey: string;
  model: string;
  userMessage: string;
  tasks: Task[];
  autoExecuteTools?: boolean;
}

function buildGroqTools() {
  return getAllTools().map(t => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: {
        type: 'object',
        properties: Object.fromEntries(t.args.map(a => [
          a.name, { type: a.type, description: a.description },
        ])),
        required: t.args.filter(a => a.required).map(a => a.name),
      },
    },
  }));
}

export async function runAgent(opts: AgentOptions): Promise<AgentReply> {
  const { apiKey, model, userMessage, tasks, autoExecuteTools = true } = opts;

  // [1] استخراج ذاكرة محلياً (0 tokens)
  try {
    const extracted = extractMemoryFromText(userMessage);
    for (const m of extracted) {
      await saveMemory({ ...m, source: 'auto', confirmed: true });
    }
  } catch {}

  // [2] كشف عمليات بسيطة (0 tokens)
  const quick = detectQuickAction(userMessage);

  if (quick && autoExecuteTools) {
    const result = await executeTool(quick.toolName, quick.args);
    return {
      text: result.message, source: 'tool',
      actions: [{ type: 'tool', toolName: quick.toolName, toolArgs: quick.args, result, text: result.message }],
    };
  }

  if (quick && !autoExecuteTools) {
    return {
      text: `تحبين أسويها؟\n${quick.preview}`, source: 'local', actions: [],
      pendingConfirm: { toolName: quick.toolName, args: quick.args, preview: quick.preview },
    };
  }

  // [3] AI — بدون مفتاح
  if (!apiKey) {
    lastLocalReason = 'ما في مفتاح AI محفوظ';
    const local = generateLocalReply(userMessage, tasks);
    return { text: local.text, source: 'local', actions: [] };
  }

  const memoryCtx = await buildMemoryContext(8).catch(() => '');
  const tasksCtx = tasks.slice(0, 15).map(t =>
    `- ${t.title}${t.scheduledTime ? ` (${t.scheduledTime})` : ''}${t.completed ? ' ✓' : ''}`
  ).join('\n') || '(ما عندها مهام اليوم)';
  const dateCtx = new Date().toISOString().slice(0, 16).replace('T', ' ');

  // محاولة 1: AI مع أدوات
  try {
    const toolsCatalog = buildToolCatalog();
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT_AGENT
              .replace('{{TOOLS}}', toolsCatalog)
              .replace('{{DATE}}', dateCtx)
              .replace('{{MEMORY}}', memoryCtx || '(فارغة)')
              .replace('{{TASKS}}', tasksCtx),
          },
          { role: 'user', content: userMessage },
        ],
        tools: buildGroqTools(),
        tool_choice: 'auto',
        temperature: 0.5,
        max_tokens: 800,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      const msg = json?.choices?.[0]?.message;

      if (msg?.tool_calls && msg.tool_calls.length > 0) {
        const actions: AgentAction[] = [];
        for (const call of msg.tool_calls) {
          const toolName = call.function?.name;
          let args: any = {};
          try { args = JSON.parse(call.function?.arguments || '{}'); }
          catch { continue; }
          const toolDef = getTool(toolName);
          if (!toolDef) continue;
          const result = await executeTool(toolName, args);
          actions.push({ type: 'tool', toolName, toolArgs: args, result, text: result.message });
        }
        const finalText = msg.content?.trim() || actions.map(a => a.result?.message).filter(Boolean).join('\n');
        if (finalText) return { text: finalText, source: 'ai', actions };
      }

      const text = msg?.content?.trim();
      if (text) { lastLocalReason = ''; return { text, source: 'ai', actions: [] }; }
      console.warn('[AI-1] رد فارغ، نجرب بدون أدوات');
    } else {
      const errTxt = await res.text().catch(() => '');
      lastLocalReason = `AI-1 ${res.status}: ${errTxt.slice(0, 100)}`;
      console.warn('[AI-1] فشل:', res.status, errTxt.slice(0, 200));
    }
  } catch (e: any) {
    console.warn('[AI-1] threw:', e?.message);
  }

  // محاولة 2: AI بدون أدوات (أبسط وأكثر موثوقية)
  try {
    const simplePrompt = `أنتِ "رفيق يومي" — مساعدة ودودة باللهجة العراقية. ردي بجملة أو جملتين قصيرة ومفيدة.

الوقت: ${dateCtx}
${memoryCtx ? `معلومات عن المستخدم:\n${memoryCtx}\n` : ''}${tasksCtx !== '(ما عندها مهام اليوم)' ? `مهام اليوم:\n${tasksCtx}\n` : ''}
قواعد: إيموجي خفيفة، لهجة عراقية، لا تقولين "أضفت" أو "حذفت" إلا لو تأكدتي.`;

    const res2 = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: simplePrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.6,
        max_tokens: 400,
      }),
    });

    if (res2.ok) {
      const json2 = await res2.json();
      const text2 = json2?.choices?.[0]?.message?.content?.trim();
      if (text2) return { text: text2, source: 'ai', actions: [] };
      console.warn('[AI-2] رد فارغ');
    } else {
      const errTxt2 = await res2.text().catch(() => '');
      lastLocalReason = `AI-2 ${res2.status}: ${errTxt2.slice(0, 100)}`;
      console.warn('[AI-2] فشل:', res2.status, errTxt2.slice(0, 200));
    }
  } catch (e: any) {
    console.warn('[AI-2] threw:', e?.message);
  }

  // محاولة 3: محلي
  try {
    const local = generateLocalReply(userMessage, tasks);
    return { text: local.text, source: 'local', actions: [] };
  } catch {
    return { text: 'ما قدرت أرد هالمرة 🤔', source: 'local', actions: [] };
  }
}

export async function executePending(toolName: string, args: Record<string, any>): Promise<ToolResult> {
  return executeTool(toolName, args);
}
