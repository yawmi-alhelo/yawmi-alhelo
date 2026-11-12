import { supabase } from '../group/supabase';
import { Settings as SettingsRepo } from '../repositories';

export interface SyncResult {
  blocked: boolean;
  reason: string;
  announcement: { title: string; message: string; type: string } | null;
  aiKey: string;
  aiModel: string;
}

export async function registerAndSync(appVersion = '1.2.0'): Promise<SyncResult> {
  const result: SyncResult = { blocked: false, reason: '', announcement: null, aiKey: '', aiModel: '' };
  try {
    const settings = await SettingsRepo.getSettings();
    const deviceId = settings.deviceId;
    if (!deviceId) return result;

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
    }, { onConflict: 'device_id' }).select('is_blocked, blocked_reason').single();

    if (data) {
      result.blocked = data.is_blocked || false;
      result.reason = data.blocked_reason || '';
    }

    const { data: ann } = await supabase.from('announcements')
      .select('title, message, type').eq('is_active', true)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (ann) result.announcement = ann;

    const { data: config } = await supabase.from('app_config').select('key, value')
      .in('key', ['ai_key', 'ai_model']);
    for (const row of config || []) {
      if (row.key === 'ai_key') result.aiKey = String(row.value).replace(/"/g, '');
      if (row.key === 'ai_model') result.aiModel = String(row.value).replace(/"/g, '');
    }
  } catch (e: any) {
    console.warn('[sync] فشل:', e?.message);
  }
  return result;
}

export async function syncMyStats(deviceId: string, points: number, streak: number, achievements: Record<string, boolean>) {
  try {
    await supabase.from('app_users').update({
      total_points: points,
      streak: streak,
      achievements: achievements,
      last_seen: new Date().toISOString(),
    }).eq('device_id', deviceId);
  } catch {}
}
