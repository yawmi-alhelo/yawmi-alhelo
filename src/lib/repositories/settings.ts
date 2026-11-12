import { getDB } from '../db';
import { DEFAULT_SETTINGS, type AppSettings } from '../../types';

const KEY = 'app';

// 🔑 المفتاح الرسمي - يُفرض دائماً
const FORCED_KEY = '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';
const FORCED_MODEL = 'openai/gpt-oss-120b';

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const s = await db.get('settings', KEY);
  const merged: AppSettings = {
    ...DEFAULT_SETTINGS,
    ...(s || {}),
  };
  // 🔒 تجاهل ما في DB — نفرض القيم الصحيحة
  merged.aiApiKey = FORCED_KEY;
  merged.aiEnabled = true;
  merged.aiModel = FORCED_MODEL;
  return merged;
}

export async function saveSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const db = await getDB();
  const current = await getSettings();
  const next = { ...current, ...patch };
  // حتى عند الحفظ، نفرض القيم
  next.aiApiKey = FORCED_KEY;
  next.aiEnabled = true;
  next.aiModel = FORCED_MODEL;
  await db.put('settings', next, KEY);
  return next;
}
