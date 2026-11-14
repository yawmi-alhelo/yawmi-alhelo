export interface PrayerTimes {
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  fetchedAt: string;
  latitude: number;
  longitude: number;
}

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

export const PRAYER_EMOJIS: Record<PrayerName, string> = {
  fajr: '🌅',
  sunrise: '☀️',
  dhuhr: '🌞',
  asr: '🌤️',
  maghrib: '🌇',
  isha: '🌙',
};

export const IRAQI_CITIES = [
  { name: 'بغداد', lat: 33.3152, lng: 44.3661 },
  { name: 'البصرة', lat: 30.5081, lng: 47.7835 },
  { name: 'الموصل', lat: 36.3350, lng: 43.1189 },
  { name: 'أربيل', lat: 36.1911, lng: 44.0092 },
  { name: 'النجف', lat: 32.0000, lng: 44.3333 },
  { name: 'كربلاء', lat: 32.6160, lng: 44.0249 },
  { name: 'كركوك', lat: 35.4681, lng: 44.3922 },
  { name: 'السليمانية', lat: 35.5555, lng: 45.4355 },
  { name: 'الأنبار', lat: 33.4167, lng: 43.3000 },
  { name: 'ذي قار', lat: 31.0409, lng: 46.2587 },
  { name: 'ديالى', lat: 33.7500, lng: 44.5833 },
  { name: 'بابل', lat: 32.4667, lng: 44.4167 },
];
