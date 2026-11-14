import { useState } from 'react';
import { X, Plus, Check, ShoppingCart } from 'lucide-react';
import { Shopping } from '../../lib/repositories';

interface Props {
  onClose: () => void;
  onAdded?: () => void;
}

const CATEGORIES = [
  { id: 'protein', label: '🥩 بروتين', items: ['دجاج', 'لحم', 'سمك', 'بيض', 'تونة'] },
  { id: 'veggies', label: '🥬 خضار', items: ['بصل', 'طماطة', 'بطاطا', 'جزر', 'خيار', 'باذنجان', 'كوسة', 'فلفل'] },
  { id: 'grains', label: '🌾 حبوب', items: ['رز', 'برغل', 'معكرونة', 'عدس', 'حمص', 'فاصوليا'] },
  { id: 'dairy', label: '🧀 ألبان', items: ['حليب', 'لبن', 'جبن', 'زبدة', 'كريمة'] },
  { id: 'pantry', label: '🧂 أساسيات', items: ['ملح', 'بهارات', 'زيت', 'معجون طماطة', 'سكر', 'طحين', 'ليمون', 'خبز'] },
  { id: 'sweets', label: '🍯 حلويات', items: ['نشا', 'كاكاو', 'فانيليا', 'بيكنج باودر', 'قشطة', 'فستق', 'جوز'] },
];

export default function ShoppingQuickAdd({ onClose, onAdded }: Props) {
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<string | null>(null);

  async function addItem(name: string) {
    if (added.has(name)) return;
    setSaving(name);
    try {
      await Shopping.addShoppingItem(name);
      setAdded(prev => new Set([...prev, name]));
      onAdded?.();
    } catch (e) {
      alert('فشل الإضافة، جربي مرة ثانية');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[160] bg-black/70 flex items-end sm:items-center justify-center">
      <div className="bg-white dark:bg-[#252532] w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col">
        <div className="px-5 py-4 border-b border-rose-100 dark:border-[#34343f] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-ink-900 dark:text-rose-100">🛒 نضيف للسوق</h2>
            <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-0.5">
              اختاري كل اللي تحتاجينه — يضاف تلقائياً لقائمة التسوق
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-[#34343f]">
            <X size={20} className="text-ink-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="mb-4">
              <p className="text-xs font-bold text-ink-500 dark:text-rose-300/80 mb-2">{cat.label}</p>
              <div className="flex flex-wrap gap-2">
                {cat.items.map(item => {
                  const isAdded = added.has(item);
                  const isSaving = saving === item;
                  return (
                    <button
                      key={item}
                      onClick={() => addItem(item)}
                      disabled={isAdded || isSaving}
                      className={`px-3 py-2 rounded-xl2 text-xs font-semibold flex items-center gap-1 transition-all ${
                        isAdded
                          ? 'bg-mint-300 text-white'
                          : 'bg-rose-50 dark:bg-[#1a1a24] text-ink-700 dark:text-rose-200 active:scale-95'
                      }`}
                    >
                      {isAdded ? <Check size={12} /> : <Plus size={12} />}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-rose-100 dark:border-[#34343f] shrink-0">
          <button
            onClick={onClose}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            {added.size > 0 ? `تم — أضفت ${added.size} للمشتريات` : 'إغلاق'}
          </button>
        </div>
      </div>
    </div>
  );
}
