// ==================== الأنواع الأساسية ====================

export type PeriodType =
  | 'morning'      // الصبح
  | 'beforeNoon'   // قبل الظهر
  | 'noon'         // الظهر
  | 'afternoon'    // العصر
  | 'maghrib'      // المغرب
  | 'evening'      // الليل
  | 'beforeSleep'; // قبل النوم

export type PriorityType = 'low' | 'medium' | 'high';
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly';
export type HabitFrequency = 'daily' | 'weekly';
export type FocusType = 'focus' | 'shortBreak' | 'longBreak';

// ==================== المهام ====================

export interface Task {
  id: string;
  title: string;
  description?: string;
  period: PeriodType;
  scheduledTime?: string;        // "HH:mm"
  durationMinutes?: number;
  priority: PriorityType;
  category?: string;
  soundId?: string;
  completed: boolean;
  completedAt?: string;
  deferred?: boolean;
  deferredFrom?: string;         // التاريخ الأصلي قبل التأجيل
  notes?: string;
  repeat: RepeatType;
  date: string;                  // "YYYY-MM-DD"
  createdAt: string;
  updatedAt: string;
}

// ==================== المواعيد ====================

export interface Appointment {
  id: string;
  title: string;
  date: string;                  // "YYYY-MM-DD"
  time: string;                  // "HH:mm"
  location?: string;
  notes?: string;
  reminderMinutes?: number;
  repeat: RepeatType;
  linkedTaskId?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== العادات ====================

export interface Habit {
  id: string;
  title: string;
  icon?: string;                 // إيموجي أو اسم أيقونة
  frequency: HabitFrequency;
  targetDays?: number;           // للأسبوعية
  color?: string;
  createdAt: string;
}

export interface HabitLog {
  id: string;                    // `${habitId}_${date}`
  habitId: string;
  date: string;                  // "YYYY-MM-DD"
  completed: boolean;
}

// ==================== الأهداف ====================

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  progress: number;              // 0-100
  linkedTaskIds: string[];
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== الملاحظات ====================

export interface Note {
  id: string;
  title: string;
  content: string;
  color?: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== قائمة المشتريات ====================

export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: string;
  category?: string;
  checked: boolean;
  createdAt: string;
}

// ==================== جلسات التركيز ====================

export interface FocusSession {
  id: string;
  type: FocusType;
  durationMinutes: number;
  startedAt: string;
  endedAt?: string;
  completed: boolean;
}

// ==================== الإعدادات ====================

export interface AppSettings {
  userName: string;
  onboarded: boolean;
  darkMode: boolean;
  soundsEnabled: boolean;
  notificationsEnabled: boolean;
  vibrationEnabled: boolean;
  notificationSound: string;
  completeSound: string;
  breakSound: string;
  dndStart?: string;             // "HH:mm"
  dndEnd?: string;
  focusDuration: number;         // دقائق
  shortBreakDuration: number;
  longBreakDuration: number;
  weatherEnabled: boolean;
  aiEnabled: boolean;
  aiApiKey: string;
  aiModel: string;
  groupId: string;
  groupCode: string;
  groupName: string;
  deviceId: string;
  nickname: string;
  activeTitle: string;
  language: 'ar';
}

// ==================== التسميات العربية ====================

export const PERIOD_LABELS: Record<PeriodType, string> = {
  morning: 'الصبح',
  beforeNoon: 'قبل الظهر',
  noon: 'الظهر',
  afternoon: 'العصر',
  maghrib: 'المغرب',
  evening: 'الليل',
  beforeSleep: 'قبل النوم',
};

export const PERIOD_ORDER: PeriodType[] = [
  'morning', 'beforeNoon', 'noon', 'afternoon', 'maghrib', 'evening', 'beforeSleep',
];

export const PRIORITY_LABELS: Record<PriorityType, string> = {
  low: 'عادية',
  medium: 'مهمة',
  high: 'ضرورية',
};

export const REPEAT_LABELS: Record<RepeatType, string> = {
  none: 'بدون تكرار',
  daily: 'يومياً',
  weekly: 'أسبوعياً',
  monthly: 'شهرياً',
};

export const ARABIC_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
export const ARABIC_MONTHS = [
  'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
  'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول',
];

// ==================== الإعدادات الافتراضية ====================

export const DEFAULT_SETTINGS: AppSettings = {
  userName: '',
  onboarded: false,
  darkMode: false,
  soundsEnabled: true,
  notificationsEnabled: true,
  vibrationEnabled: true,
  notificationSound: 'gentle',
  completeSound: 'success',
  breakSound: 'rest',
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  weatherEnabled: false,
  aiEnabled: true,
  aiApiKey: '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',
  aiModel: 'openai/gpt-oss-120b',
  groupId: '',
  groupCode: '',
  groupName: '',
  deviceId: '',
  nickname: '',
  activeTitle: '',
  language: 'ar',
};
