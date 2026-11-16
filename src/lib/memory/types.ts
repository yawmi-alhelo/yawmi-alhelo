export type MemoryCategory = 'identity' | 'preference' | 'fact' | 'habit' | 'goal' | 'context';

export interface MemoryEntry {
  id: string;
  category: MemoryCategory;
  key: string;          // مفتاح فريد للدمج (مثلاً "الاسم"، "وقت_الاستيقاظ")
  value: string;
  source?: string;      // كيف تم الحصول عليها
  confirmed: boolean;   // هل وافق المستخدم
  createdAt: string;
  updatedAt: string;
}

export const CATEGORY_LABELS: Record<MemoryCategory, string> = {
  identity: 'الهوية',
  preference: 'التفضيلات',
  fact: 'معلومات',
  habit: 'عادات',
  goal: 'أهداف',
  context: 'سياق',
};
