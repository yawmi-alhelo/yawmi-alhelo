export type CycleFlow = 'light' | 'medium' | 'heavy';

export interface CycleRecord {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  flow: CycleFlow;
  symptoms: string[];
  notes?: string;
  createdAt: string;
}

export const SYMPTOMS_LIST = [
  'صداع', 'تعب', 'مغص', 'غثيان', 'دوخة',
  'ألم بالظهر', 'انتفاخ', 'توتر', 'نعاس', 'شهية زايدة'
];

export const FLOW_LABELS: Record<CycleFlow, string> = {
  light: 'خفيف',
  medium: 'متوسط',
  heavy: 'غزير',
};

export const FLOW_COLORS: Record<CycleFlow, string> = {
  light: 'text-rose-300',
  medium: 'text-rose-500',
  heavy: 'text-rose-700',
};
