import { create } from 'zustand';
import { Tasks as TasksRepo } from '../lib/repositories';
import { todayISO } from '../lib/date';
import { scheduleTaskReminder, cancelTaskReminder } from '../lib/notifications';
import { useSettings } from './useSettings';
import { useRewards } from './useRewards';
import { saveBackupToCloud } from '../lib/admin/backup';
import { updateMyActivity } from '../lib/group';
import type { Task } from '../types';

interface TasksState {
  date: string;
  tasks: Task[];
  loading: boolean;
  setDate: (d: string) => Promise<void>;
  load: (d?: string) => Promise<void>;
  add: (input: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  update: (id: string, patch: Partial<Task>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggle: (id: string) => Promise<void>;
  defer: (id: string, newDate: string) => Promise<void>;
}


async function triggerCloudSave() {
  const s = useSettings.getState().settings;
  if (s.syncUsername && s.syncPassword) {
    await saveBackupToCloud(s.syncUsername, s.syncPassword).catch(() => {});
  }
}

export const useTasks = create<TasksState>((set, get) => ({
  date: todayISO(),
  tasks: [],
  loading: false,
  setDate: async (d) => { set({ date: d }); await get().load(d);
    triggerCloudSave(); },
  load: async (d) => {
    set({ loading: true });
    const date = d || get().date;
    const tasks = await TasksRepo.getTasksByDate(date);
    set({ tasks, loading: false, date });
  },
  add: async (input) => {
    const soundId = useSettings.getState().settings.notificationSound;
    const task = await TasksRepo.addTask(input);
    try {
      if (useSettings.getState().settings.soundsEnabled) {
        await scheduleTaskReminder(task, soundId);
      }
    } catch (e) {
      console.warn('[add] notification فشل:', e);
    }
    // 🔑 نستخدم تاريخ المهمة نفسها، ليس date القديم
    await get().load(input.date);
    triggerCloudSave();
  },
  update: async (id, patch) => {
    await cancelTaskReminder(id);
    const prevTask = get().tasks.find(t => t.id === id);
    const wasCompleted = prevTask?.completed;
    
    const patchWithDate = { ...patch };
    if (patch.completed && !wasCompleted) {
      patchWithDate.completedAt = new Date().toISOString();
    }
    
    const updated = await TasksRepo.updateTask(id, patchWithDate);
    const soundId = useSettings.getState().settings.notificationSound;
    if (updated && !updated.completed && useSettings.getState().settings.soundsEnabled) {
      await scheduleTaskReminder(updated, soundId);
    }
    // 🔑 مكافأة عند التحويل من غير مكتمل إلى مكتمل
    if (updated?.completed && !wasCompleted) {
      try {
        await useRewards.getState().complete();
      } catch (e) {
        console.error('[Rewards] فشل:', e);
      }
    }
    await get().load();
    triggerCloudSave();
  },
  remove: async (id) => {
    await cancelTaskReminder(id);
    await TasksRepo.deleteTask(id);
    await get().load();
    triggerCloudSave();
  },
  toggle: async (id) => {
    const prevTask = get().tasks.find(t => t.id === id);
    const updated = await TasksRepo.toggleTask(id);
    if (updated?.completed) {
      await cancelTaskReminder(id);
      // 🔑 مكافأة عند الإكمال
      if (!prevTask?.completed) {
        try {
          await useRewards.getState().complete();
          console.log('[Rewards] +10 نقطة، المجموع:', useRewards.getState().state.points);
        } catch (e) {
          console.error('[Rewards] فشل:', e);
        }
        // تسجيل النشاط للستريك الجماعي
        const settings = useSettings.getState().settings;
        if (settings.groupId && settings.deviceId) {
          try {
            await updateMyActivity(settings.groupId, settings.deviceId);
          } catch (e) {
            console.warn('[activity] فشل:', e);
          }
        }
      }
    } else if (updated) {
      const soundId = useSettings.getState().settings.notificationSound;
      await scheduleTaskReminder(updated, soundId);
    }
    await get().load();
    triggerCloudSave();
  },
  defer: async (id, newDate) => {
    const t = get().tasks.find(x => x.id === id);
    if (!t) return;
    await cancelTaskReminder(id);
    const updated = await TasksRepo.updateTask(id, { date: newDate, deferred: true, deferredFrom: t.date });
    if (updated) {
      const soundId = useSettings.getState().settings.notificationSound;
      await scheduleTaskReminder(updated, soundId);
    }
    await get().load();
    triggerCloudSave();
  },
}));
