import type { IngredientPreset } from './types';

export const BREAKFAST_INGREDIENTS: IngredientPreset[] = [
  // أساسيات الفطور
  { id: 'b_bread', label: 'خبز', emoji: '🍞', groupId: 'breakfast' },
  { id: 'b_eggs', label: 'بيض', emoji: '🥚', groupId: 'breakfast' },
  { id: 'b_cheese', label: 'جبن', emoji: '🧀', groupId: 'breakfast' },
  { id: 'b_beans', label: 'فول', emoji: '🫘', groupId: 'breakfast' },
  { id: 'b_yogurt', label: 'لبن', emoji: '🥛', groupId: 'breakfast' },
  
  // حلويات الصبح
  { id: 'b_dibs', label: 'دبس', emoji: '🍯', groupId: 'breakfast' },
  { id: 'b_qaimar', label: 'قشطة', emoji: '🍦', groupId: 'breakfast' },
  { id: 'b_honey', label: 'عسل', emoji: '🍯', groupId: 'breakfast' },
  
  // مشروبات
  { id: 'b_tea', label: 'شاي', emoji: '🍵', groupId: 'breakfast' },
  { id: 'b_coffee', label: 'قهوة', emoji: '☕', groupId: 'breakfast' },
  { id: 'b_nescafe', label: 'نسكافيه', emoji: '☕', groupId: 'breakfast' },
  { id: 'b_juice', label: 'عصير', emoji: '🧃', groupId: 'breakfast' },
  { id: 'b_milk', label: 'حليب', emoji: '🥛', groupId: 'breakfast' },
  
  // إضافات
  { id: 'b_butter', label: 'زبدة', emoji: '🧈', groupId: 'breakfast' },
  { id: 'b_olive_oil', label: 'زيت زيتون', emoji: '🫒', groupId: 'breakfast' },
  { id: 'b_tahini', label: 'طحينية', emoji: '🥣', groupId: 'breakfast' },
  { id: 'b_dates', label: 'تمر', emoji: '🌴', groupId: 'breakfast' },
  { id: 'b_nuts', label: 'مكسرات', emoji: '🥜', groupId: 'breakfast' },
];
