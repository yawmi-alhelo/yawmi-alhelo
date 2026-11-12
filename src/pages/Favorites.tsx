import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Trash2, Heart } from 'lucide-react';
import Layout from '../components/Layout';
import { getAllFavorites, removeFavorite, type FavoriteRecipe } from '../lib/favorites';

export default function Favorites() {
  const nav = useNavigate();
  const [items, setItems] = useState<FavoriteRecipe[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() { setItems(await getAllFavorites()); }
  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm('تحذفين هذي الوصفة من المفضلة؟')) return;
    await removeFavorite(id);
    await load();
  }

  return (
    <Layout>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => nav(-1)} className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-[#34343f]">
          <ArrowRight size={20} className="text-ink-700 dark:text-rose-100" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">وصفاتي ❤️</h1>
          <p className="text-sm text-ink-500 dark:text-rose-300/80 mt-0.5">{items.length} وصفة محفوظة</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card-soft text-center py-12">
          <Heart size={48} className="mx-auto text-rose-300 mb-4" />
          <p className="font-bold text-ink-700 dark:text-rose-100 mb-1">ما عندج وصفات محفوظة</p>
          <p className="text-sm text-ink-500 dark:text-rose-300/80">
            روحي لـ «شنو أطبخ؟» واحفظي الأكلات اللي تعجبج
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(fav => (
            <div key={fav.id} className="card-soft">
              <div className="flex items-start gap-3">
                <div className="text-4xl">{fav.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink-900 dark:text-rose-100">{fav.dish}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500 dark:text-rose-300/80 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-[#34343f] text-rose-500 font-semibold">{fav.meal}</span>
                    <span>⏱️ {fav.prepTime + fav.cookTime} د</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(fav.id)} className="text-ink-300 hover:text-rose-500 p-1">
                  <Trash2 size={16} />
                </button>
              </div>
              <button onClick={() => setExpanded(expanded === fav.id ? null : fav.id)}
                className="text-xs text-rose-500 font-semibold mt-2">
                {expanded === fav.id ? '← إخفاء الخطوات' : 'عرض الخطوات →'}
              </button>
              {expanded === fav.id && (
                <ol className="mt-3 space-y-2">
                  {fav.steps.map((st, i) => (
                    <li key={i} className="text-sm text-ink-700 dark:text-rose-100 leading-relaxed flex gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-400 text-white text-xs font-bold shrink-0">{i + 1}</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
