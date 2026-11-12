import { useEffect, useState } from 'react';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import Layout from '../components/Layout';
import { useShopping } from '../stores/useShopping';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';

export default function Shopping() {
  const { items, load, add, toggle, remove, clearChecked } = useShopping();
  const [newItem, setNewItem] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.trim()) return;
    await add(newItem.trim());
    setNewItem('');
  }

  const active = items.filter(i => !i.checked);
  const done = items.filter(i => i.checked);

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">قائمة المشتريات 🛒</h1>
        <p className="text-sm text-ink-500 dark:text-rose-300/80 mt-1">شنسوي بالسوق؟</p>
      </div>

      <form onSubmit={handleAdd} className="mb-4">
        <div className="bg-white dark:bg-[#252532] rounded-xl3 shadow-card p-2 flex items-center gap-2 border border-rose-100 dark:border-[#34343f]">
          <input
            type="text"
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            placeholder="شنو نشتري؟ (مثلاً: حليب)"
            className="flex-1 px-3 py-2 bg-transparent text-ink-900 dark:text-rose-100 outline-none text-sm"
          />
          <button type="submit" disabled={!newItem.trim()}
            className="w-10 h-10 rounded-full bg-rose-400 text-white flex items-center justify-center disabled:opacity-40 shrink-0">
            <Plus size={20} />
          </button>
        </div>
      </form>

      {active.length === 0 && done.length === 0 && (
        <div className="card-soft text-center py-12">
          <ShoppingCart size={48} className="mx-auto text-rose-300 mb-4" />
          <p className="font-bold text-ink-700 dark:text-rose-100 mb-1">القائمة فاضية</p>
          <p className="text-sm text-ink-500 dark:text-rose-300/80">أضيفي أول شي</p>
        </div>
      )}

      {active.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-ink-500 dark:text-rose-300/80 mb-2 px-1">للشراء ({active.length})</h2>
          <div className="card-soft divide-y divide-rose-50 dark:divide-[#34343f] p-0 overflow-hidden">
            {active.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => toggle(item.id)}
                  className="w-6 h-6 rounded-full border-2 border-rose-200 shrink-0" />
                <p className="flex-1 text-sm font-semibold text-ink-900 dark:text-rose-100">{item.name}</p>
                <button onClick={() => remove(item.id)} className="text-ink-300 hover:text-rose-500 p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-sm font-bold text-ink-500 dark:text-rose-300/80">خلصنا ({done.length})</h2>
            <button onClick={() => setShowClearConfirm(true)}
              className="text-xs font-semibold text-rose-500">امسحي المشطوب</button>
          </div>
          <div className="card-soft divide-y divide-rose-50 dark:divide-[#34343f] p-0 overflow-hidden">
            {done.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => toggle(item.id)}
                  className="w-6 h-6 rounded-full bg-mint-300 border-2 border-mint-300 shrink-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </button>
                <p className="flex-1 text-sm text-ink-300 dark:text-rose-300/50 line-through">{item.name}</p>
                <button onClick={() => remove(item.id)} className="text-ink-300 hover:text-rose-500 p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="مسح المشطوب"
        message="هل تريدين مسح كل الأشياء اللي تم شراؤها من القائمة؟"
        confirmText="نعم، امسحي"
        onConfirm={() => { clearChecked(); setShowClearConfirm(false); }}
        onCancel={() => setShowClearConfirm(false)}
        variant="danger"
      />
      <AlertModal
        isOpen={!!alertMsg}
        title="تنبيه"
        message={alertMsg || ''}
        onClose={() => setAlertMsg(null)}
        variant="warning"
      />
    </Layout>
  );
}
