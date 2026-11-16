import { useEffect, useState } from 'react';
import { Plus, Pin, Trash2, X } from 'lucide-react';
import Layout from '../components/Layout';
import { Notes as NotesRepo } from '../lib/repositories';
import type { Note } from '../types';

const COLORS = [
  { id: 'rose', bg: 'bg-rose-50 dark:bg-[#2a1f2a]', border: 'border-rose-200' },
  { id: 'lavender', bg: 'bg-lavender-100 dark:bg-[#2a2535]', border: 'border-lavender-200' },
  { id: 'peach', bg: 'bg-peach-100 dark:bg-[#2a2520]', border: 'border-peach-200' },
  { id: 'mint', bg: 'bg-mint-100 dark:bg-[#1f2a25]', border: 'border-mint-200' },
];

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('rose');

  useEffect(() => { load(); }, []);

  async function load() { setNotes(await NotesRepo.getAllNotes()); }

  function openNew() {
    setEditing(null); setTitle(''); setContent(''); setColor('rose'); setShowForm(true);
  }
  function openEdit(n: Note) {
    setEditing(n); setTitle(n.title); setContent(n.content); setColor(n.color || 'rose'); setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (editing) {
      await NotesRepo.updateNote(editing.id, { title: title.trim(), content, color });
    } else {
      await NotesRepo.addNote({ title: title.trim(), content, color, pinned: false });
    }
    setShowForm(false);
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm('تحذفين الملاحظة؟')) return;
    await NotesRepo.deleteNote(id);
    setShowForm(false);
    await load();
  }

  async function togglePin(id: string) {
    await NotesRepo.toggleNotePin(id);
    await load();
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">ملاحظاتي 📝</h1>
          <p className="text-sm text-ink-500 dark:text-rose-300/80 mt-1">كل شي بدّه ينكتب</p>
        </div>
        <button onClick={openNew} className="bg-rose-400 text-white rounded-full p-3 shadow-float active:scale-95">
          <Plus size={20} />
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="card-soft text-center py-12">
          <p className="text-5xl mb-3">📝</p>
          <p className="font-bold text-ink-700 dark:text-rose-100 mb-1">ما عندج ملاحظات</p>
          <p className="text-sm text-ink-500 dark:text-rose-300/80">اكتبي أول ملاحظة</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {notes.map(n => {
            const c = COLORS.find(x => x.id === n.color) || COLORS[0];
            return (
              <div
                key={n.id}
                onClick={() => openEdit(n)}
                className={`${c.bg} ${c.border} border rounded-xl2 p-3 relative cursor-pointer active:scale-98 transition-transform`}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); togglePin(n.id); }}
                  className={`absolute top-2 left-2 p-1 rounded-full ${n.pinned ? 'text-rose-500' : 'text-ink-300'}`}
                >
                  <Pin size={14} fill={n.pinned ? 'currentColor' : 'none'} />
                </button>
                <p className="font-bold text-sm text-ink-900 dark:text-rose-100 mb-1 pl-6 line-clamp-1">
                  {n.title}
                </p>
                <p className="text-xs text-ink-500 dark:text-rose-300/80 line-clamp-4 whitespace-pre-line">
                  {n.content || '—'}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-[#252532] w-full max-w-lg rounded-t-3xl sm:rounded-xl3 max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-[#252532] px-5 py-4 border-b border-rose-100 dark:border-[#34343f] flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-ink-900 dark:text-rose-100">
                {editing ? 'تعديل الملاحظة' : 'ملاحظة جديدة'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-[#34343f]">
                <X size={20} className="text-ink-500" />
              </button>
            </div>
            <form onSubmit={save} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink-700 dark:text-rose-200 mb-1.5">العنوان *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400"
                  autoFocus required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 dark:text-rose-200 mb-1.5">المحتوى</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} rows={6}
                  className="w-full px-3 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 dark:text-rose-200 mb-1.5">اللون</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.id)}
                      className={`w-10 h-10 rounded-full ${c.bg} ${c.border} border-2 ${color === c.id ? 'ring-2 ring-rose-400' : ''}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                {editing && (
                  <button type="button" onClick={() => handleDelete(editing.id)}
                    className="px-4 py-3 rounded-xl2 bg-rose-100 dark:bg-[#34343f] text-rose-600 font-semibold flex items-center gap-2">
                    <Trash2 size={18} /> حذف
                  </button>
                )}
                <button type="submit" className="flex-1 btn-primary">
                  {editing ? 'حفظ' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
