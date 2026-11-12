import { supabase } from '../group/supabase';
import { Settings as SettingsRepo } from '../repositories';

export interface SyncResult {
  blocked: boolean;
  reason: string;
  announcement: { title: string; message: string; type: string; priority: string } | null;
  directMessage: { title: string; message: string } | null;
  aiKey: string;
  aiModel: string;
  maintenance: boolean;
  minVersion: string;
  forceUpdate: boolean;
  overrideApplied: boolean;
}

async function applyAdminOverride(deviceId: string, userData: any): Promise<boolean> {
  try {
    const { getDB } = await import('../db');
    const db = await getDB();
    
    const existing = await db.get('rewards', 'state');
    const newRewards = {
      points: userData.total_points || 0,
      streak: userData.streak || 0,
      flowers: Math.floor((userData.total_points || 0) / 50),
      tasksCompleted: existing?.tasksCompleted || 0,
      lastCompletionAt: existing?.lastCompletionAt || '',
      milestones: existing?.milestones || [],
    };
    await db.put('rewards', newRewards, 'state');
    
    const achMap = userData.achievements || {};
    const allExisting = await db.getAll('achievements');
    for (const a of allExisting) {
      await db.delete('achievements', a.id);
    }
    for (const [id, unlocked] of Object.entries(achMap)) {
      if (unlocked) {
        await db.put('achievements', { id, unlockedAt: new Date().toISOString() });
      }
    }
    
    if (userData.nickname) {
      const settings = await db.get('settings', 'app');
      if (settings) {
        settings.nickname = userData.nickname;
        await db.put('settings', settings, 'app');
      }
    }
    
    await supabase.from('app_users').update({ override_pending: false }).eq('device_id', deviceId);
    return true;
  } catch (e: any) {
    console.warn('[override] فشل:', e?.message);
    return false;
  }
}

export async function registerAndSync(appVersion = '1.2.0'): Promise<SyncResult> {
  const r: SyncResult = {
    blocked: false, reason: '', announcement: null, directMessage: null,
    aiKey: '', aiModel: '', maintenance: false, minVersion: '0.0.0', forceUpdate: false, overrideApplied: false,
  };
  try {
    const settings = await SettingsRepo.getSettings();
    let deviceId = settings.deviceId;
    if (!deviceId) {
      const { nanoid } = await import('nanoid');
      deviceId = nanoid(16);
      await SettingsRepo.saveSettings({ deviceId });
    }

    let ip = '';
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
      ip = (await ipRes.json()).ip || '';
    } catch {}

    const deviceInfo = {
      ua: navigator.userAgent,
      platform: (navigator as any).platform || '',
      lang: navigator.language,
      screen: `${screen.width}x${screen.height}`,
    };

    const { data } = await supabase.from('app_users').upsert({
      device_id: deviceId,
      nickname: settings.nickname || settings.userName || '',
      device_info: deviceInfo,
      ip_address: ip,
      app_version: appVersion,
      platform: 'android',
      last_seen: new Date().toISOString(),
    }, { onConflict: 'device_id' }).select('*').single();

    if (data) {
      r.blocked = data.is_blocked || false;
      r.reason = data.blocked_reason || '';
      if (data.blocked_until && new Date(data.blocked_until) < new Date()) {
        r.blocked = false;
        await supabase.from('app_users').update({ is_blocked: false, blocked_until: null }).eq('device_id', deviceId);
      }
      if (data.override_pending) {
        r.overrideApplied = await applyAdminOverride(deviceId, data);
      }
    }

    const now = new Date().toISOString();
    const { data: ann } = await supabase.from('announcements')
      .select('title, message, type, priority')
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (ann) r.announcement = ann;

    const { data: dm } = await supabase.from('direct_messages')
      .select('id, title, message')
      .eq('device_id', deviceId).eq('is_read', false)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (dm) {
      r.directMessage = { title: dm.title, message: dm.message };
      supabase.from('direct_messages').update({ is_read: true }).eq('id', dm.id).then();
    }

    const { data: flags } = await supabase.from('system_flags').select('key, value')
      .in('key', ['maintenance_mode', 'min_app_version', 'force_update']);
    for (const f of flags || []) {
      const v = typeof f.value === 'string' ? f.value.replace(/"/g, '') : f.value;
      if (f.key === 'maintenance_mode') r.maintenance = v === true || v === 'true';
      if (f.key === 'min_app_version') r.minVersion = String(v).replace(/"/g, '');
      if (f.key === 'force_update') r.forceUpdate = v === true || v === 'true';
    }

    const { data: config } = await supabase.from('app_config').select('key, value')
      .in('key', ['ai_key', 'ai_model']);
    for (const row of config || []) {
      if (row.key === 'ai_key') r.aiKey = String(row.value).replace(/"/g, '');
      if (row.key === 'ai_model') r.aiModel = String(row.value).replace(/"/g, '');
    }
  } catch (e: any) {
    console.warn('[sync] فشل:', e?.message);
  }
  return r;
}

export async function syncMyStats(deviceId: string, points: number, streak: number, achievements: Record<string, boolean>) {
  try {
    await supabase.from('app_users').update({
      total_points: points, streak, achievements,
      last_seen: new Date().toISOString(),
    }).eq('device_id', deviceId);
  } catch {}
}
