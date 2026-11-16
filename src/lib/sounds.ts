export interface SoundDef {
  id: string;
  nameAr: string;
  rawFile: string;
  channelId: string;
}

export const SOUNDS: SoundDef[] = [
  { id: 'gentle',   nameAr: 'نغمة صباحية ناعمة', rawFile: 'gentle_morning', channelId: 'sound_gentle' },
  { id: 'glass',    nameAr: 'رنة زجاجية هادئة',  rawFile: 'glass_bell',     channelId: 'sound_glass' },
  { id: 'rose',     nameAr: 'نغمة وردية لطيفة',  rawFile: 'rose_soft',      channelId: 'sound_rose' },
  { id: 'ping',     nameAr: 'إشعار قصير',         rawFile: 'short_ping',     channelId: 'sound_ping' },
  { id: 'success',  nameAr: 'صوت نجاح',           rawFile: 'success',        channelId: 'sound_success' },
  { id: 'rest',     nameAr: 'تذكير بالاستراحة',  rawFile: 'rest',           channelId: 'sound_rest' },
  { id: 'focusEnd', nameAr: 'نهاية وقت التركيز', rawFile: 'focus_end',      channelId: 'sound_focus_end' },
];

export function getSound(id: string): SoundDef {
  return SOUNDS.find(s => s.id === id) || SOUNDS[0];
}

// قنوات الإشعارات (ننشئها عند بدء التطبيق)
export const CHANNELS = SOUNDS.map(s => ({
  id: s.channelId,
  name: s.nameAr,
  description: `صوت: ${s.nameAr}`,
  sound: s.rawFile,
  importance: 4,       // HIGH
  visibility: 1,       // PUBLIC
  vibration: true,
}));

// قناة إضافية صامتة
export const SILENT_CHANNEL = {
  id: 'silent',
  name: 'صامت',
  description: 'بدون صوت',
  importance: 2,
  visibility: 1,
  vibration: false,
};
