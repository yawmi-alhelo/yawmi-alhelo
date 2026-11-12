import { registerTool, type ToolResult } from './registry';
import { Appointments as ApptRepo } from '../repositories';
import { todayISO } from '../date';

registerTool({
  name: 'add_appointment',
  description: 'إضافة موعد جديد',
  args: [
    { name: 'title', type: 'string', description: 'عنوان الموعد', required: true },
    { name: 'date', type: 'string', description: 'YYYY-MM-DD', required: false },
    { name: 'time', type: 'string', description: 'HH:MM', required: true },
    { name: 'location', type: 'string', description: 'المكان', required: false },
    { name: 'reminderMinutes', type: 'number', description: 'التذكير قبل كم دقيقة', required: false },
  ],
  permission: 'write',
  requiresConfirm: true,
  async execute(args): Promise<ToolResult> {
    const appt = await ApptRepo.addAppointment({
      title: args.title,
      date: args.date || todayISO(),
      time: args.time,
      location: args.location || undefined,
      reminderMinutes: args.reminderMinutes ?? 15,
      repeat: 'none',
    });
    return { ok: true, message: `📅 ضفت موعد "${appt.title}" الساعة ${appt.time}`, data: { apptId: appt.id } };
  },
});

registerTool({
  name: 'list_appointments',
  description: 'عرض المواعيد (اليوم أو تاريخ محدد)',
  args: [
    { name: 'date', type: 'string', description: 'YYYY-MM-DD', required: false },
  ],
  permission: 'read',
  requiresConfirm: false,
  async execute(args): Promise<ToolResult> {
    const date = args.date || todayISO();
    const appts = await ApptRepo.getAppointmentsByDate(date);
    if (appts.length === 0) return { ok: true, message: 'ما عندج مواعيد بهذا اليوم', data: [] };
    const list = appts.map(a => `• ${a.title} — ${a.time}${a.location ? ` (${a.location})` : ''}`).join('\n');
    return { ok: true, message: list, data: appts };
  },
});
