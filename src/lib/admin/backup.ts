import { supabase } from '../group/supabase';
import { getDB } from '../db';

export interface BackupSummary {
  backupAt: string;
  taskCount: number;
  habitCount: number;
  noteCount: number;
}

export async function saveBackupToCloud(deviceId: string): Promise<boolean> {
  try {
    const db = await getDB();
    const [tasks, habits, habitLogs, appointments, goals, notes, shopping, focusSessions] = await Promise.all([
      db.getAll('tasks').catch(() => []),
      db.getAll('habits').catch(() => []),
      db.getAll('habitLogs').catch(() => []),
      db.getAll('appointments').catch(() => []),
      db.getAll('goals').catch(() => []),
      db.getAll('notes').catch(() => []),
      db.getAll('shopping').catch(() => []),
      db.getAll('focusSessions').catch(() => []),
    ]);
    const rewards = await db.get('rewards', 'state').catch(() => null);
    const memory = await db.getAll('memory').catch(() => []);

    const backup = {
      version: 1,
      tasks, habits, habitLogs, appointments, goals, notes, shopping, focusSessions, rewards, memory,
    };

    const { error } = await supabase.from('app_users').update({
      backup_data: backup,
      backup_at: new Date().toISOString(),
    }).eq('device_id', deviceId);

    return !error;
  } catch (e: any) {
    console.warn('[backup] فشل الحفظ:', e?.message);
    return false;
  }
}

export async function getCloudBackupInfo(deviceId: string): Promise<BackupSummary | null> {
  try {
    const { data } = await supabase.from('app_users')
      .select('backup_at, backup_data')
      .eq('device_id', deviceId).single();
    if (!data?.backup_at) return null;
    const b = data.backup_data || {};
    return {
      backupAt: data.backup_at,
      taskCount: (b.tasks || []).length,
      habitCount: (b.habits || []).length,
      noteCount: (b.notes || []).length,
    };
  } catch { return null; }
}

export async function restoreFromCloud(deviceId: string): Promise<{ ok: boolean; restored: number }> {
  try {
    const { data } = await supabase.from('app_users')
      .select('backup_data').eq('device_id', deviceId).single();
    if (!data?.backup_data) return { ok: false, restored: 0 };

    const b = data.backup_data;
    const db = await getDB();
    const stores = ['tasks','habits','habitLogs','appointments','goals','notes','shopping','focusSessions'] as const;
    const tx = db.transaction([...stores, 'rewards'], 'readwrite');

    for (const store of stores) {
      await tx.objectStore(store).clear();
    }
    for (const store of stores) {
      for (const item of (b[store] || [])) {
        try { await tx.objectStore(store).put(item); } catch {}
      }
    }
    await tx.done;

    if (b.rewards) await db.put('rewards', b.rewards, 'state');

    return { ok: true, restored: (b.tasks || []).length };
  } catch (e: any) {
    console.warn('[restore] فشل:', e?.message);
    return { ok: false, restored: 0 };
  }
}

// حفظ تلقائي مع debounce (30 ثانية بعد أي تغيير)
let backupTimer: any = null;
export function scheduleAutoBackup(deviceId: string) {
  if (backupTimer) clearTimeout(backupTimer);
  backupTimer = setTimeout(() => {
    saveBackupToCloud(deviceId);
    backupTimer = null;
  }, 30000);
}
