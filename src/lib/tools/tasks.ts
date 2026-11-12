import { registerTool, type ToolResult } from './registry';
import { Tasks as TasksRepo } from '../repositories';
import { todayISO } from '../date';
import type { Task, PeriodType, PriorityType } from '../../types';

const PERIOD_MAP: Record<string, PeriodType> = {
  'الصبح': 'morning', 'قبل الظهر': 'beforeNoon', 'الظهر': 'noon',
  'العصر': 'afternoon', 'المغرب': 'maghrib', 'الليل': 'evening', 'قبل النوم': 'beforeSleep',
};

registerTool({
  name: 'add_task',
  description: 'إضافة مهمة جديدة لجدول المستخدم',
  args: [
    { name: 'title', type: 'string', description: 'عنوان المهمة', required: true },
    { name: 'period', type: 'string', description: 'الفترة: الصبح|قبل الظهر|الظهر|العصر|المغرب|الليل|قبل النوم', required: false },
    { name: 'time', type: 'string', description: 'الوقت HH:MM', required: false },
    { name: 'duration', type: 'number', description: 'المدة بالدقائق', required: false },
    { name: 'priority', type: 'string', description: 'low|medium|high', required: false },
    { name: 'date', type: 'string', description: 'YYYY-MM-DD (افتراضي: اليوم)', required: false },
  ],
  permission: 'write',
  requiresConfirm: true,
  async execute(args): Promise<ToolResult> {
    const period = PERIOD_MAP[args.period] || 'morning';
    const priority = (['low', 'medium', 'high'].includes(args.priority) ? args.priority : 'medium') as PriorityType;
    const task = await TasksRepo.addTask({
      title: args.title,
      period,
      scheduledTime: args.time || undefined,
      durationMinutes: args.duration || undefined,
      priority,
      completed: false,
      repeat: 'none',
      date: args.date || todayISO(),
    });
    return {
      ok: true,
      message: `✅ ضفت "${task.title}" لجدولج`,
      data: { taskId: task.id },
    };
  },
});

registerTool({
  name: 'list_tasks',
  description: 'عرض قائمة المهام (اليوم أو تاريخ محدد)',
  args: [
    { name: 'date', type: 'string', description: 'YYYY-MM-DD', required: false },
    { name: 'filter', type: 'string', description: 'all|done|pending', required: false },
  ],
  permission: 'read',
  requiresConfirm: false,
  async execute(args): Promise<ToolResult> {
    const date = args.date || todayISO();
    const tasks = await TasksRepo.getTasksByDate(date);
    const filter = args.filter || 'all';
    const filtered = filter === 'done' ? tasks.filter(t => t.completed)
      : filter === 'pending' ? tasks.filter(t => !t.completed)
      : tasks;
    if (filtered.length === 0) return { ok: true, message: 'ما عندج مهام', data: [] };
    const list = filtered.map(t =>
      `${t.completed ? '✓' : '○'} ${t.title}${t.scheduledTime ? ` (${t.scheduledTime})` : ''}`
    ).join('\n');
    return { ok: true, message: list, data: filtered };
  },
});

registerTool({
  name: 'complete_task',
  description: 'تعليم مهمة كمنجزة (بالبحث عن اسمها)',
  args: [
    { name: 'query', type: 'string', description: 'اسم المهمة (أو جزء منه)', required: true },
  ],
  permission: 'write',
  requiresConfirm: true,
  async execute(args): Promise<ToolResult> {
    const today = todayISO();
    const tasks = await TasksRepo.getTasksByDate(today);
    const q = args.query.toLowerCase();
    const match = tasks.find(t => !t.completed && t.title.toLowerCase().includes(q));
    if (!match) return { ok: false, message: `ما لقيت مهمة باسم "${args.query}" اليوم` };
    await TasksRepo.updateTask(match.id, { completed: true, completedAt: new Date().toISOString() });
    return { ok: true, message: `✅ خلصتي "${match.title}" — عاشت إيدج 🌸`, data: { taskId: match.id } };
  },
});

registerTool({
  name: 'delete_task',
  description: 'حذف مهمة (بالبحث عن اسمها)',
  args: [
    { name: 'query', type: 'string', description: 'اسم المهمة', required: true },
  ],
  permission: 'delete',
  requiresConfirm: true,
  async execute(args): Promise<ToolResult> {
    const today = todayISO();
    const tasks = await TasksRepo.getTasksByDate(today);
    const q = args.query.toLowerCase();
    const match = tasks.find(t => t.title.toLowerCase().includes(q));
    if (!match) return { ok: false, message: `ما لقيت مهمة باسم "${args.query}"` };
    await TasksRepo.deleteTask(match.id);
    return { ok: true, message: `🗑️ حذفت "${match.title}"`, data: { taskId: match.id } };
  },
});

registerTool({
  name: 'update_task',
  description: 'تعديل مهمة موجودة (العنوان/الوقت/المدة)',
  args: [
    { name: 'query', type: 'string', description: 'اسم المهمة الحالي', required: true },
    { name: 'newTitle', type: 'string', description: 'العنوان الجديد', required: false },
    { name: 'newTime', type: 'string', description: 'الوقت الجديد HH:MM', required: false },
    { name: 'newDuration', type: 'number', description: 'المدة الجديدة بالدقائق', required: false },
  ],
  permission: 'write',
  requiresConfirm: true,
  async execute(args): Promise<ToolResult> {
    const tasks = await TasksRepo.getTasksByDate(todayISO());
    const q = args.query.toLowerCase();
    const match = tasks.find(t => t.title.toLowerCase().includes(q));
    if (!match) return { ok: false, message: `ما لقيت مهمة "${args.query}"` };
    const patch: Partial<Task> = {};
    if (args.newTitle) patch.title = args.newTitle;
    if (args.newTime) patch.scheduledTime = args.newTime;
    if (args.newDuration) patch.durationMinutes = args.newDuration;
    if (Object.keys(patch).length === 0) {
      return { ok: false, message: 'ما في شي يتعدل' };
    }
    await TasksRepo.updateTask(match.id, patch);
    return { ok: true, message: `✏️ عدلت "${match.title}"`, data: { taskId: match.id } };
  },
});
