import type { PeriodType } from '../../types';

export interface TaskPreset {
  id: string;
  label: string;
  emoji: string;
  defaultDuration: number;  // دقائق
  defaultPeriod: PeriodType;
  groupId: string;
}

export interface TaskGroup {
  id: string;
  label: string;
  emoji: string;
}

export interface IngredientPreset {
  id: string;
  label: string;
  emoji: string;
  groupId: string;
}

export interface IngredientGroup {
  id: string;
  label: string;
  emoji: string;
}

export interface DayPlanResult {
  tasks: Array<{
    title: string;
    period: PeriodType;
    time: string;
    duration: number;
    emoji: string;
  }>;
  summary: string;
  source: 'ai' | 'local';
}

export interface CookResult {
  dish: string;
  emoji: string;
  reason: string;
  ingredientsUsed: string[];
  missingIngredients?: string[];
  steps: string[];
  prepTime: number;   // دقائق
  cookTime: number;
  source: 'ai' | 'local';
}
