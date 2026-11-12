import { supabase } from './supabase';
import { nanoid } from 'nanoid';

export interface Stats {
  level: number;
  points: number;
  streak: number;
  flowers: number;
  title?: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  device_id: string;
  nickname: string;
  nickname_normalized?: string;
  level: number;
  points: number;
  streak: number;
  flowers: number;
  title?: string;
  updated_at: string;
}

export interface RoomInfo {
  roomId: string;
  code: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  device_id: string;
  nickname: string;
  text: string;
  created_at: string;
}

export function generateDeviceId(): string {
  return nanoid(16);
}

// تطبيع عربي شامل — لمقارنة الأسماء
export function normalizeArabic(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[\u064B-\u0652\u0670]/g, '')  // إزالة التشكيل
    .replace(/[\u200B-\u200D\uFEFF]/g, '')   // zero-width
    .replace(/\s+/g, ' ')
    .replace(/[.،,؛;:!?؟\-_]/g, '')
    .trim();
}

// اقتراح اسم بديل عند التكرار
function suggestAlternative(base: string, attempt: number): string {
  if (attempt === 1) return `${base} 2`;
  if (attempt === 2) return `${base} 3`;
  if (attempt === 3) return `${base} 4`;
  return `${base} ${Math.floor(Math.random() * 99) + 5}`;
}

// هل الاسم متكرر في المجموعة؟
export async function isNameTaken(
  roomId: string, normalizedName: string, excludeDeviceId?: string
): Promise<boolean> {
  const { data } = await supabase
    .from('room_members')
    .select('device_id, nickname_normalized')
    .eq('room_id', roomId)
    .eq('nickname_normalized', normalizedName);
  if (!data) return false;
  return data.some(m => m.device_id !== excludeDeviceId);
}

// محاولة إنشاء عضوة جديدة (مع retry للاسم)
async function tryInsertMember(
  roomId: string, deviceId: string, nickname: string, stats: Stats, attempt = 0
): Promise<{ nickname: string }> {
  const currentName = attempt === 0 ? nickname : suggestAlternative(nickname, attempt);
  const normalized = normalizeArabic(currentName);

  const { error } = await supabase.from('room_members').insert({
    room_id: roomId,
    device_id: deviceId,
    nickname: currentName,
    nickname_normalized: normalized,
    ...stats,
  });

  if (!error) return { nickname: currentName };

  // إذا فشل بسبب UNIQUE (كود 23505)، نجرب اسم بديل
  if (error.code === '23505' && attempt < 4) {
    return tryInsertMember(roomId, deviceId, nickname, stats, attempt + 1);
  }

  throw new Error(`فشل الإضافة: ${error.message}`);
}

export async function createRoom(
  nickname: string, deviceId: string, stats: Stats
): Promise<RoomInfo & { finalNickname: string }> {
  const code = nanoid(6).toUpperCase();
  const { data: room, error: roomErr } = await supabase
    .from('rooms')
    .insert({ code, name: 'مجموعتنا' })
    .select()
    .single();
  if (roomErr) throw new Error(`فشل إنشاء المجموعة: ${roomErr.message}`);

  const { nickname: finalNickname } = await tryInsertMember(room.id, deviceId, nickname, stats);
  return { roomId: room.id, code, name: room.name, finalNickname };
}

export async function joinRoom(
  code: string, nickname: string, deviceId: string, stats: Stats
): Promise<RoomInfo & { finalNickname: string }> {
  const { data: room, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();
  if (error || !room) throw new Error('ما لقيت مجموعة بهذا الكود — تأكدي منه');

  // هل إحنا موجودين أصلاً؟
  const { data: existing } = await supabase
    .from('room_members')
    .select('*')
    .eq('room_id', room.id)
    .eq('device_id', deviceId)
    .maybeSingle();

  if (existing) {
    // عضوة موجودة — نحدّث بدون تغيير الاسم
    await supabase.from('room_members')
      .update({ ...stats, title: stats.title || '', updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    return { roomId: room.id, code: room.code, name: room.name, finalNickname: existing.nickname };
  }

  // عضوة جديدة — نستخدم retry
  const { nickname: finalNickname } = await tryInsertMember(room.id, deviceId, nickname, stats);
  return { roomId: room.id, code: room.code, name: room.name, finalNickname };
}

export async function getRoomMembers(roomId: string): Promise<RoomMember[]> {
  const { data, error } = await supabase
    .from('room_members')
    .select('*')
    .eq('room_id', roomId)
    .order('points', { ascending: false });
  if (error) throw new Error(`فشل جلب الأعضاء: ${error.message}`);
  return data || [];
}

export async function syncMyStats(
  roomId: string, deviceId: string, stats: Stats
): Promise<void> {
  await supabase.from('room_members')
    .update({ ...stats, updated_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('device_id', deviceId);
}

export async function leaveRoom(roomId: string, deviceId: string): Promise<void> {
  await supabase.from('room_members')
    .delete()
    .eq('room_id', roomId)
    .eq('device_id', deviceId);
}

export function subscribeToRoom(roomId: string, callback: () => void): () => void {
  const channel = supabase
    .channel(`room_${roomId}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'room_members', filter: `room_id=eq.${roomId}` },
      () => callback())
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

export async function sendMessage(
  roomId: string, deviceId: string, nickname: string, text: string
): Promise<void> {
  const { error } = await supabase.from('room_messages').insert({
    room_id: roomId,
    device_id: deviceId,
    nickname,
    text: text.trim(),
  });
  if (error) throw new Error(`فشل إرسال الرسالة: ${error.message}`);
}

export async function getMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
  const { data } = await supabase
    .from('room_messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
    .limit(limit);
  return data || [];
}

export function subscribeToMessages(roomId: string, callback: () => void): () => void {
  const channel = supabase
    .channel(`messages_${roomId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'room_messages', filter: `room_id=eq.${roomId}` },
      () => callback())
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
