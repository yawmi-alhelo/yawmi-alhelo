import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { getSound } from '../sounds';
import type { CycleRecord } from './types';
import { addDays } from '../date';

const isNative = Capacitor.isNativePlatform();

function hashId(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 2147483647;
}

export async function scheduleCycleReminder(
  cycle: CycleRecord, cycleLength: number, daysBefore = 2
): Promise<boolean> {
  if (!isNative) return false;
  const notifyDate = addDays(cycle.startDate, cycleLength - daysBefore);
  const [y, m, d] = notifyDate.split('-').map(Number);
  const when = new Date(y, m - 1, d, 9, 0, 0);
  if (when.getTime() < Date.now()) return false;
  const sound = getSound('gentle');
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id: hashId('cycle_' + cycle.id),
        title: '🌸 تذكير لطيف',
        body: `دورتج المتوقعة بعد ${daysBefore} يوم — جهزي احتياطج 💗`,
        schedule: { at: when, allowWhileIdle: true },
        channelId: sound.channelId,
        smallIcon: 'ic_notif_flower',
        sound: sound.rawFile,
      }],
    });
    return true;
  } catch { return false; }
}

export async function cancelCycleReminder(cycleId: string): Promise<void> {
  if (!isNative) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: hashId('cycle_' + cycleId) }] });
  } catch { /* ignore */ }
}
