export interface CloudBackupInfo {
  backupAt: string;
  taskCount: number;
  habitCount: number;
  noteCount: number;
}

import { errMsg } from '../errors';
import { supabase } from '../group/supabase';
import { getDB } from '../db';

export async function saveBackupToCloud(username: string, password?: string): Promise<boolean> {
  if (!username || !password) return false;
  try {
    const db = await getDB();
    const [tasks, habits, habitLogs, appointments, goals, notes, shopping, focusSessions, memory] = await Promise.all([
      db.getAll('tasks').catch(() => []),
      db.getAll('habits').catch(() => []),
      db.getAll('habitLogs').catch(() => []),
      db.getAll('appointments').catch(() => []),
      db.getAll('goals').catch(() => []),
      db.getAll('notes').catch(() => []),
      db.getAll('shopping').catch(() => []),
      db.getAll('focusSessions').catch(() => []),
      db.getAll('memory').catch(() => []),
    ]);
    const rewards = await db.get('rewards', 'state').catch(() => null);
    const backup = { version: 2, tasks, habits, habitLogs, appointments, goals, notes, shopping, focusSessions, rewards, memory };

    const { error } = await supabase.from('user_sync_accounts').upsert({
      username: username.trim().toLowerCase(),
      password,
      backup_data: backup,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'username' });

    return !error;
  } catch (e) {
    console.warn('[backup] فشل:', errMsg(e));
    return false;
  }
}

export async function getCloudBackupInfo(username: string, password: string): Promise<CloudBackupInfo | null> {
  if (!username || !password) return null;
  try {
    const { data } = await supabase.from('user_sync_accounts')
      .select('updated_at, backup_data')
      .eq('username', username.trim().toLowerCase())
      .eq('password', password)
      .single();
    if (!data || !data.backup_data) return null;
    const b = data.backup_data;
    return {
      backupAt: data.updated_at,
      taskCount: (b.tasks || []).length,
      habitCount: (b.habits || []).length,
      noteCount: (b.notes || []).length,
    };
  } catch { return null; }
}

export async function restoreFromCloud(username: string, password: string): Promise<{ ok: boolean; restored: number }> {
  if (!username || !password) return { ok: false, restored: 0 };
  try {
    const { data } = await supabase.from('user_sync_accounts')
      .select('backup_data')
      .eq('username', username.trim().toLowerCase())
      .eq('password', password)
      .single();
    if (!data?.backup_data) return { ok: false, restored: 0 };

    const b = data.backup_data;
    const db = await getDB();
    const stores = ['tasks','habits','habitLogs','appointments','goals','notes','shopping','focusSessions'] as const;
    const tx = db.transaction([...stores, 'rewards', 'achievements'], 'readwrite');
    for (const store of stores) await tx.objectStore(store).clear();
    for (const store of stores) {
      for (const item of (b[store] || [])) {
        try { await tx.objectStore(store).put(item); } catch { /* ignore */ }
      }
    }
    // استعادة الإنجازات
    await tx.objectStore('achievements').clear();
    const ach = b.achievements || {};
    for (const [id, unlocked] of Object.entries(ach)) {
      if (unlocked) {
        await tx.objectStore('achievements').put({ id, unlockedAt: new Date().toISOString() });
      }
    }
    await tx.done;
    if (b.rewards) await db.put('rewards', b.rewards, 'state');
    return { ok: true, restored: (b.tasks || []).length };
  } catch {
    return { ok: false, restored: 0 };
  }
}

let backupTimer: ReturnType<typeof setTimeout> | null = null;
export function scheduleAutoBackup(username: string, password: string) {
  if (!username || !password) return;
  if (backupTimer) clearTimeout(backupTimer);
  backupTimer = setTimeout(() => {
    saveBackupToCloud(username, password);
    backupTimer = null;
  }, 30000);
}


// مزامنة المكافآت والإنجازات فقط، دون لمس بقية البيانات المحلية
export async function syncRewardsAndAchievementsFromCloud(
  username: string,
  password: string
): Promise<boolean> {
  if (!username || !password) return false;

  try {
    const { data, error } = await supabase
      .from('user_sync_accounts')
      .select('backup_data')
      .eq('username', username.trim().toLowerCase())
      .eq('password', password)
      .single();

    if (error || !data?.backup_data) return false;

    const backup = data.backup_data;
    const db = await getDB();

    // ⛔ لا تستبدل التقدم المحلي ببيانات سحابية أسوأ
    const localRewards = await db.get('rewards', 'state').catch(() => null);
    const cloudPoints = Number(backup.rewards?.points) || 0;
    const localPoints = Number(localRewards?.points) || 0;

    if (backup.rewards && cloudPoints >= localPoints) {
      await db.put('rewards', backup.rewards, 'state');
    } else {
      console.log('[sync] تجاهل السحابة لأن المحلي أفضل (' + localPoints + ' > ' + cloudPoints + ')');
    }

    const achievements = backup.achievements || {};
    for (const [id, unlocked] of Object.entries(achievements)) {
      if (unlocked === true) {
        await db.put('achievements', {
          id,
          unlockedAt: new Date().toISOString(),
        });
      }
    }

    return true;
  } catch (e) {
    console.warn('[cloud rewards sync] فشل:', errMsg(e));
    return false;
  }
}
