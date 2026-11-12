import { getDB } from '../db';
import { nanoid } from 'nanoid';
import type { ShoppingItem } from '../../types';

export async function getAllShopping(): Promise<ShoppingItem[]> {
  const db = await getDB();
  const items = await db.getAll('shopping');
  return items.sort((a, b) => {
    if (a.checked !== b.checked) return a.checked ? 1 : -1;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export async function addShoppingItem(name: string, quantity?: string, category?: string): Promise<ShoppingItem> {
  const db = await getDB();
  const item: ShoppingItem = {
    id: nanoid(),
    name,
    quantity,
    category,
    checked: false,
    createdAt: new Date().toISOString(),
  };
  await db.put('shopping', item);
  return item;
}

export async function toggleShoppingItem(id: string): Promise<void> {
  const db = await getDB();
  const it = await db.get('shopping', id);
  if (!it) return;
  await db.put('shopping', { ...it, checked: !it.checked });
}

export async function deleteShoppingItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('shopping', id);
}

export async function clearCheckedShopping(): Promise<void> {
  const db = await getDB();
  const all = await db.getAll('shopping');
  const tx = db.transaction('shopping', 'readwrite');
  for (const it of all) if (it.checked) await tx.store.delete(it.id);
  await tx.done;
}
