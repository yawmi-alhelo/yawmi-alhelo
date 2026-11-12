import { getDB } from '../db';
import { nanoid } from 'nanoid';
import type { CookResult } from '../flows/types';

export interface FavoriteRecipe {
  id: string;
  dish: string;
  emoji: string;
  meal: string;
  ingredientsUsed: string[];
  steps: string[];
  prepTime: number;
  cookTime: number;
  source: 'ai' | 'local';
  savedAt: string;
}

export async function getAllFavorites(): Promise<FavoriteRecipe[]> {
  const db = await getDB();
  const all = await db.getAll('favorites');
  return all.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export async function isFavorite(dish: string): Promise<boolean> {
  const db = await getDB();
  const found = await db.getAllFromIndex('favorites', 'by-dish', dish);
  return found.length > 0;
}

export async function addFavorite(result: CookResult, meal: string): Promise<FavoriteRecipe> {
  const db = await getDB();
  const existing = await db.getAllFromIndex('favorites', 'by-dish', result.dish);
  if (existing.length > 0) return existing[0];
  const fav: FavoriteRecipe = {
    id: nanoid(),
    dish: result.dish,
    emoji: result.emoji,
    meal,
    ingredientsUsed: result.ingredientsUsed,
    steps: result.steps,
    prepTime: result.prepTime,
    cookTime: result.cookTime,
    source: result.source,
    savedAt: new Date().toISOString(),
  };
  await db.put('favorites', fav);
  return fav;
}

export async function removeFavorite(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('favorites', id);
}
