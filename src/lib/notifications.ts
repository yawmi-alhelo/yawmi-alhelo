import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { CHANNELS, SILENT_CHANNEL, getSound } from './sounds';
import type { Task, Appointment } from '../types';

const isNative = Capacitor.isNativePlatform();

// ==================== التهيئة ====================
let initialized = false;

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNative) return false;
  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display === 'granted') return true;
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch {
    return false;
  }
}

export async function initNotifications(): Promise<void> {
  if (!isNative || initialized) return;
  initialized = true;
  try {
    await requestNotificationPermission();
    if (Capacitor.getPlatform() === 'android') {
      for (const ch of CHANNELS) {
        try {
          await LocalNotifications.createChannel({
            id: ch.id, name: ch.name, description: ch.description,
            importance: ch.importance as 1 | 2 | 3 | 4 | 5,
            visibility: ch.visibility as -1 | 0 | 1,
            vibration: ch.vibration, sound: ch.sound,
          });
        } catch (e) { console.warn('[Notif] channel فشل', ch.id); }
      }
      try {
        await LocalNotifications.createChannel({
          id: SILENT_CHANNEL.id, name: SILENT_CHANNEL.name,
          description: SILENT_CHANNEL.description,
          importance: SILENT_CHANNEL.importance as 1 | 2 | 3 | 4 | 5,
          visibility: SILENT_CHANNEL.visibility as -1 | 0 | 1,
          vibration: SILENT_CHANNEL.vibration,
        });
      } catch {}
    }
  } catch (e) { console.warn('[Notif] init فشل', e); }
}

// ==================== أدوات مساعدة ====================
function hashId(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 2147483647;
}

function dateTimeFrom(task: Task): Date | null {
  if (!task.scheduledTime || !task.date) return null;
  const [hh, mm] = task.scheduledTime.split(':').map(Number);
  const [y, m, d] = task.date.split('-').map(Number);
  const dt = new Date(y, m - 1, d, hh, mm, 0);
  dt.setMinutes(dt.getMinutes() - 5);
  return dt;
}

function dateTimeFromAppt(appt: Appointment): Date | null {
  if (!appt.time || !appt.date) return null;
  const [hh, mm] = appt.time.split(':').map(Number);
  const [y, m, d] = appt.date.split('-').map(Number);
  const dt = new Date(y, m - 1, d, hh, mm, 0);
  dt.setMinutes(dt.getMinutes() - (appt.reminderMinutes || 15));
  return dt;
}

// ==================== جدولة المهام ====================
export async function scheduleTaskReminder(task: Task, soundId: string): Promise<boolean> {
  if (!isNative || task.completed) return false;
  const when = dateTimeFrom(task);
  if (!when || when.getTime() < Date.now()) return false;
  const sound = getSound(soundId);
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id: hashId(task.id),
        title: '⏰ تذكير مهمة',
        body: `بعد شوية: ${task.title}`,
        schedule: { at: when, allowWhileIdle: true },
        channelId: sound.channelId,
        smallIcon: 'ic_stat_icon_config_sample',
        sound: sound.rawFile,
        extra: { taskId: task.id, type: 'task' },
      }],
    });
    return true;
  } catch { return false; }
}

export async function cancelTaskReminder(taskId: string): Promise<void> {
  if (!isNative) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: hashId(taskId) }] });
  } catch {}
}

// ==================== جدولة المواعيد ====================
export async function scheduleAppointmentReminder(appt: Appointment, soundId: string): Promise<boolean> {
  if (!isNative || !appt.reminderMinutes) return false;
  const when = dateTimeFromAppt(appt);
  if (!when || when.getTime() < Date.now()) return false;
  const sound = getSound(soundId);
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id: hashId(appt.id),
        title: '📅 تذكير موعد',
        body: `بعد ${appt.reminderMinutes} دقيقة: ${appt.title}`,
        schedule: { at: when, allowWhileIdle: true },
        channelId: sound.channelId,
        smallIcon: 'ic_stat_icon_config_sample',
        sound: sound.rawFile,
        extra: { apptId: appt.id, type: 'appointment' },
      }],
    });
    return true;
  } catch { return false; }
}

export async function cancelAppointmentReminder(apptId: string): Promise<void> {
  if (!isNative) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: hashId(apptId) }] });
  } catch {}
}

// ==================== مؤقت التركيز ====================
export async function scheduleFocusTimer(seconds: number, type: string): Promise<void> {
  if (!isNative) return;
  try {
    // نلغي أي مؤقت قديم
    await LocalNotifications.cancel({ notifications: [{ id: 88888 }] });
    if (seconds <= 0) return;
    
    const when = new Date(Date.now() + seconds * 1000);
    await LocalNotifications.schedule({
      notifications: [{
        id: 88888,
        title: type === 'focus' ? '🎉 خلص وقت التركيز!' : '🌿 خلص وقت الاستراحة',
        body: type === 'focus' ? 'عاشت إيدج، خذي استراحة' : 'يلا نرجع نكمل',
        schedule: { at: when, allowWhileIdle: true },
        channelId: type === 'focus' ? 'sound_success' : 'sound_rest',
        smallIcon: 'ic_stat_icon_config_sample',
      }],
    });
  } catch (e) { console.warn('[Notif] focus فشل', e); }
}

export async function cancelFocusTimer(): Promise<void> {
  if (!isNative) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: 88888 }] });
  } catch {}
}

// ==================== إشعار محادثة المجموعة ====================
export async function notifyGroupMessage(senderName: string, text: string): Promise<void> {
  if (!isNative) return;
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id: hashId('chat_' + Date.now()),
        title: `💬 ${senderName}`,
        body: text.slice(0, 100),
        channelId: 'sound_ping',
        smallIcon: 'ic_stat_icon_config_sample',
      }],
    });
  } catch {}
}

// ==================== إشعارات عامة ====================
export async function notifyNow(title: string, body: string, soundId: string): Promise<boolean> {
  if (!isNative) return false;
  const sound = getSound(soundId);
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id: hashId(title + body + Date.now()),
        title, body,
        channelId: sound.channelId,
        sound: sound.rawFile,
        smallIcon: 'ic_stat_icon_config_sample',
      }],
    });
    return true;
  } catch { return false; }
}

export async function scheduleDailySummary(hour: number, minute: number): Promise<boolean> {
  if (!isNative) return false;
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id: 900000 + hour * 100 + minute,
        title: '🌸 يومي الحلو',
        body: 'خلينا نشوف شغلات اليوم سوا',
        schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true },
        channelId: 'sound_gentle',
        smallIcon: 'ic_stat_icon_config_sample',
      }],
    });
    return true;
  } catch { return false; }
}

export async function getPendingCount(): Promise<number> {
  if (!isNative) return 0;
  try {
    const pending = await LocalNotifications.getPending();
    return pending.notifications.length;
  } catch { return 0; }
}
