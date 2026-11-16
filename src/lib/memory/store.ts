import { getDB } from '../db';
import { nanoid } from 'nanoid';
import type { MemoryEntry, MemoryCategory } from './types';

export async function getAllMemory(): Promise<MemoryEntry[]> {
  const db = await getDB();
  return db.getAll('memory');
}

export async function getMemoryByCategory(category: MemoryCategory): Promise<MemoryEntry[]> {
  const db = await getDB();
  return db.getAllFromIndex('memory', 'by-category', category);
}

export async function saveMemory(input: {
  category: MemoryCategory;
  key: string;
  value: string;
  source?: string;
  confirmed?: boolean;
}): Promise<MemoryEntry> {
  const db = await getDB();
  const all = await db.getAll('memory');
  const normalizedKey = input.key.trim();
  // ابحث عن مدخل بنفس الفئة والمفتاح (dedup)
  const existing = all.find(
    m => m.category === input.category && m.key === normalizedKey
  );
  const now = new Date().toISOString();
  if (existing) {
    const updated: MemoryEntry = {
      ...existing,
      value: input.value.trim(),
      source: input.source || existing.source,
      confirmed: input.confirmed ?? existing.confirmed,
      updatedAt: now,
    };
    await db.put('memory', updated);
    return updated;
  }
  const entry: MemoryEntry = {
    id: nanoid(),
    category: input.category,
    key: normalizedKey,
    value: input.value.trim(),
    source: input.source,
    confirmed: input.confirmed ?? false,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('memory', entry);
  return entry;
}

export async function deleteMemory(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('memory', id);
}

export async function searchMemory(query: string, limit = 5): Promise<MemoryEntry[]> {
  const all = await getAllMemory();
  const q = query.trim().toLowerCase();
  if (!q) return all.slice(0, limit);
  const scored = all.map(m => {
    const text = `${m.key} ${m.value} ${m.category}`.toLowerCase();
    let score = 0;
    for (const word of q.split(/\s+/)) {
      if (word.length < 2) continue;
      if (text.includes(word)) score += 1;
      if (m.key.toLowerCase().includes(word)) score += 2;
    }
    return { m, score };
  });
  return scored
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.m);
}

// يبني سياق مختصر للذكاء الاصطناعي — فقط المعلومات المؤكدة
export async function buildMemoryContext(maxEntries = 12): Promise<string> {
  const all = await getAllMemory();
  const confirmed = all.filter(m => m.confirmed);
  if (confirmed.length === 0) return '';
  // أولوية: هوية > تفضيلات > عادات > أهداف > معلومات > سياق
  const order: MemoryCategory[] = ['identity', 'preference', 'habit', 'goal', 'fact', 'context'];
  confirmed.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
  const top = confirmed.slice(0, maxEntries);
  return top.map(m => `- ${m.key}: ${m.value}`).join('\n');
}

// استخراج بسيط من نص المستخدم — قواعد بدون AI (توفير توكنات)
export function extractMemoryFromText(text: string): Array<{
  category: MemoryCategory; key: string; value: string;
}> {
  const out: Array<{ category: MemoryCategory; key: string; value: string }> = [];
  const t = text.trim();

  // الاسم
  const nameMatch = t.match(/(?:اسمي|أنا|انا)\s+([^\s،.،]{2,20})(?:\s|$|،|\.)/);
  if (nameMatch) {
    out.push({ category: 'identity', key: 'الاسم', value: nameMatch[1] });
  }

  // العمر
  const ageMatch = t.match(/عمري\s+(\d{1,3})/);
  if (ageMatch) {
    out.push({ category: 'identity', key: 'العمر', value: ageMatch[1] + ' سنة' });
  }

  // المدينة
  const cityMatch = t.match(/(?:أسكن|اسكن|أعيش|اعيش)\s+(?:في|بـ)\s+([^\s،.،]{3,20})/);
  if (cityMatch) {
    out.push({ category: 'identity', key: 'المدينة', value: cityMatch[1] });
  }

  // العمل / الدراسة
  const workMatch = t.match(/(?:أشتغل|اشتغل|أعمل|اعمل|أدرس|ادرس)\s+(?:في|بـ|كـ)?\s*([^\s،.،]{3,30})/);
  if (workMatch) {
    out.push({ category: 'fact', key: 'العمل/الدراسة', value: workMatch[1] });
  }

  // تفضيلات
  const likeMatch = t.match(/(?:أحب|احب|أفضل|افضل|أكره|اكره)\s+([^\s،.،]{2,30})/);
  if (likeMatch) {
    out.push({ category: 'preference', key: 'تفضيل', value: likeMatch[1] });
  }

  // وقت الاستيقاظ
  const wakeMatch = t.match(/أصحى\s+(?:الساعة|الساعه)?\s*(\d{1,2})(?::(\d{2}))?/);
  if (wakeMatch) {
    const h = wakeMatch[1], m = wakeMatch[2] || '00';
    out.push({ category: 'habit', key: 'وقت الاستيقاظ', value: `${h}:${m}` });
  }

  return out;
}
