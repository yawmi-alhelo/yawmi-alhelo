export type ToolPermission = 'read' | 'write' | 'delete';
export type ToolArgType = 'string' | 'number' | 'boolean';

export interface ToolArg {
  name: string;
  type: ToolArgType;
  description: string;
  required: boolean;
}

export interface ToolResult {
  ok: boolean;
  message: string;
  data?: unknown;
  needsConfirm?: boolean;
  preview?: string;
}

export interface ToolContext {
  settings?: Record<string, unknown>;
}

export interface Tool {
  name: string;
  description: string;
  args: ToolArg[];
  permission: ToolPermission;
  requiresConfirm: boolean;
  execute: (args: Record<string, string>, ctx: ToolContext) => Promise<ToolResult>;
}

const registry = new Map<string, Tool>();

export function registerTool(tool: Tool) {
  registry.set(tool.name, tool);
}

export function getTool(name: string): Tool | undefined {
  return registry.get(name);
}

export function getAllTools(): Tool[] {
  return Array.from(registry.values());
}

// يبني وصف نصي للأدوات — للـ system prompt
export function buildToolCatalog(): string {
  return getAllTools().map(t => {
    const args = t.args.map(a => `${a.name}:${a.type}${a.required ? '' : '?'}`).join(', ');
    return `- ${t.name}(${args}) — ${t.description}`;
  }).join('\n');
}

// تنفيذ آمن مع تحقق من المدخلات
export async function executeTool(
  name: string,
  rawArgs: Record<string, unknown>,
  ctx: ToolContext = {}
): Promise<ToolResult> {
  const tool = getTool(name);
  if (!tool) {
    return { ok: false, message: `الأداة "${name}" غير موجودة` };
  }
  // تحقق من المدخلات
  const args: Record<string, string> = {};
  for (const def of tool.args) {
    const val = rawArgs?.[def.name] as unknown;
    if (def.required && (val === undefined || val === null || val === '')) {
      return { ok: false, message: `ناقص حقل: ${def.name}` };
    }
    if (val === undefined) continue;
    if (def.type === 'number') {
      const n = Number(val);
      if (isNaN(n)) return { ok: false, message: `${def.name} لازم يكون رقم` };
      args[def.name] = String(n);
    } else if (def.type === 'boolean') {
      args[def.name] = String(Boolean(val));
    } else {
      args[def.name] = String(val).trim();
    }
  }
  try {
    return await tool.execute(args, ctx);
  } catch (e) {
    return { ok: false, message: `فشل التنفيذ: ${e instanceof Error ? e.message : 'خطأ غير معروف'}` };
  }
}
