import { registerTool, type ToolResult } from './registry';
import { saveMemory, searchMemory, getAllMemory } from '../memory';
import type { MemoryCategory } from '../memory/types';

registerTool({
  name: 'remember',
  description: 'حفظ معلومة عن المستخدم في الذاكرة الدائمة',
  args: [
    { name: 'category', type: 'string', description: 'identity|preference|fact|habit|goal', required: true },
    { name: 'key', type: 'string', description: 'مفتاح قصير (مثلاً "الاسم")', required: true },
    { name: 'value', type: 'string', description: 'القيمة', required: true },
  ],
  permission: 'write',
  requiresConfirm: true,
  async execute(args): Promise<ToolResult> {
    const valid: MemoryCategory[] = ['identity', 'preference', 'fact', 'habit', 'goal'];
    const cat = valid.includes(args.category as MemoryCategory)
      ? (args.category as MemoryCategory) : 'fact';
    const entry = await saveMemory({
      category: cat,
      key: args.key,
      value: args.value,
      source: 'user',
      confirmed: true,
    });
    return { ok: true, message: `🧠 حفظت: ${entry.key} = ${entry.value}`, data: entry };
  },
});

registerTool({
  name: 'search_memory',
  description: 'بحث في ذاكرة المستخدم',
  args: [
    { name: 'query', type: 'string', description: 'كلمة البحث', required: true },
  ],
  permission: 'read',
  requiresConfirm: false,
  async execute(args): Promise<ToolResult> {
    const results = await searchMemory(args.query, 8);
    if (results.length === 0) return { ok: true, message: 'ما لقيت شي بالذاكرة', data: [] };
    const list = results.map(m => `• ${m.key}: ${m.value}`).join('\n');
    return { ok: true, message: list, data: results };
  },
});

registerTool({
  name: 'list_memory',
  description: 'عرض كل ذاكرة المستخدم',
  args: [],
  permission: 'read',
  requiresConfirm: false,
  async execute(): Promise<ToolResult> {
    const all = await getAllMemory();
    if (all.length === 0) return { ok: true, message: 'الذاكرة فاضية', data: [] };
    const list = all.map(m => `• [${m.category}] ${m.key}: ${m.value}`).join('\n');
    return { ok: true, message: list, data: all };
  },
});
