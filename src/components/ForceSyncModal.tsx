import { useState } from 'react';
import { useSettings } from '../stores/useSettings';
import { Cloud } from 'lucide-react';

export function ForceSyncModal() {
  const settings = useSettings((s) => s.settings);
  const update = useSettings((s) => s.update);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);

  // حماية: إذا لم يتم تحميل الإعدادات بعد، لا نعرض شيئاً
  if (!settings || !update) return null;
  
  // إذا كان المستخدم مسجل دخول مسبقاً، لا تظهر النافذة
  if (settings.syncUsername) return null;

  const handleSave = async () => {
    if (!user.trim() || !pass.trim()) return;
    setBusy(true);
    try {
      await update({ syncUsername: user.trim(), syncPassword: pass });
      window.location.reload(); // إعادة تحميل التطبيق لسحب البيانات من السحابة
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#0f0f13] p-4" dir="rtl">
       <div className="bg-[#1a1a24] border border-white/10 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative overflow-hidden">
          {/* خلفية جمالية */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-pink-500"></div>
          
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
            <Cloud className="text-blue-400" size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">مزامنة الحساب</h2>
          <p className="text-sm text-gray-400 mb-6">أهلاً بكِ! يرجى تسجيل الدخول لمزامنة تقدمك وحفظ بياناتك.</p>
          
          <input 
            type="text" 
            placeholder="اسم المستخدم (مثال: zoe)" 
            value={user} onChange={e => setUser(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white mb-3 text-center focus:border-blue-500 outline-none transition"
            dir="ltr"
          />
          <input 
            type="password" 
            placeholder="كلمة المرور" 
            value={pass} onChange={e => setPass(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white mb-4 text-center focus:border-blue-500 outline-none transition"
            dir="ltr"
          />
          <button 
            onClick={handleSave} 
            disabled={busy}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50"
          >
            {busy ? 'جاري المزامنة...' : 'دخول ومزامنة'}
          </button>
       </div>
    </div>
  );
}
