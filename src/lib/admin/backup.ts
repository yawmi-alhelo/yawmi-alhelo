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
  } catch (e: any) {
    console.warn('[backup] فشل:', e?.message);
    return false;
  }
}

export async function getCloudBackupInfo(username: string, password: string): Promise<any | null> {
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
    const tx = db.transaction([...stores, 'rewards'], 'readwrite');
    for (const store of stores) await tx.objectStore(store).clear();
    for (const store of stores) {
      for (const item of (b[store] || [])) {
        try { await tx.objectStore(store).put(item); } catch {}
      }
    }
    await tx.done;
    if (b.rewards) await db.put('rewards', b.rewards, 'state');
    return { ok: true, restored: (b.tasks || []).length };
  } catch (e: any) {
    return { ok: false, restored: 0 };
  }
}

let backupTimer: any = null;
export function scheduleAutoBackup(username: string, password: string) {
  if (!username || !password) return;
  if (backupTimer) clearTimeout(backupTimer);
  backupTimer = setTimeout(() => {
    saveBackupToCloud(username, password);
    backupTimer = null;
  }, 30000);
}
