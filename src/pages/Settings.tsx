import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Moon, Bell, Volume2, Timer, Database, Info, ChevronLeft,
  Sparkles, Brain, Loader2, CheckCircle2, XCircle,
  Users, Sprout, ShoppingCart, Cloud, Download
} from 'lucide-react';
import Layout from '../components/Layout';
import { useSettings } from '../stores/useSettings';
import { checkUpdates, APP_VERSION } from '../lib/updates';
import { getCloudBackupInfo, restoreFromCloud, saveBackupToCloud } from '../lib/admin/backup';
import { testGroqKey } from '../lib/ai';

export default function Settings() {
  const nav = useNavigate();
  const { settings, update } = useSettings();

  const [showUpdateAlert, setShowUpdateAlert] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncUser, setSyncUser] = useState(settings.syncUsername || '');
  const [syncPass, setSyncPass] = useState(settings.syncPassword || '');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState<any>(null);
  const [testState, setTestState] = useState<{ status: 'idle' | 'testing' | 'ok' | 'err'; msg: string }>({ status: 'idle', msg: '' });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  async function handleTest() {
    setTestState({ status: 'testing', msg: 'جاري الاختبار...' });
    const r = await testGroqKey();
    setTestState({ status: r.ok ? 'ok' : 'err', msg: r.message });
  }

  async function handleSyncSave() {
    if (!syncUser.trim() || !syncPass.trim()) { setSyncMsg('اكتبي الاسم وكلمة السر'); return; }
    setSyncLoading(true);
    const ok = await saveBackupToCloud(syncUser, syncPass);
    if (ok) {
      await update({ syncUsername: syncUser.trim(), syncPassword: syncPass });
      setSyncMsg('✅ تم الحفظ والمزامنة');
      setTimeout(() => { setShowSyncModal(false); setSyncMsg(null); }, 1500);
    } else {
      setSyncMsg('فشل الحفظ، تأكدي من الإنترنت');
    }
    setSyncLoading(false);
  }

  async function handleSyncRestore() {
    if (!syncUser.trim() || !syncPass.trim()) { setSyncMsg('اكتبي الاسم وكلمة السر'); return; }
    setSyncLoading(true);
    const info = await getCloudBackupInfo(syncUser, syncPass);
    if (!info) {
      setSyncMsg('ما لقيت حساب أو ما في نسخة محفوظة');
      setSyncLoading(false);
      return;
    }
    setRestoreConfirm(info);
    setSyncLoading(false);
  }

  async function executeRestore() {
    setSyncLoading(true);
    const r = await restoreFromCloud(syncUser, syncPass);
    if (r.ok) {
      await update({ syncUsername: syncUser.trim(), syncPassword: syncPass });
      setSyncMsg('✅ تم الاسترجاع، جاري إعادة التحميل...');
      setTimeout(() => location.reload(), 1000);
    } else {
      setSyncMsg('فشل الاسترجاع');
    }
    setSyncLoading(false);
    setRestoreConfirm(null);
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-900 dark:text-rose-100">الإعدادات ⚙️</h1>
        <p className="text-sm text-ink-500 dark:text-rose-300/80 mt-1">خلينا نضبط التطبيق على ذوقج</p>
      </div>

      <Section title="الملف الشخصي">
        <RowButton icon={<User size={18} className="text-rose-500" />} label="ملفي 🌸" sub={settings.activeTitle ? `اللقب: ${settings.activeTitle}` : 'اختاري لقبج'} onClick={() => nav('/profile')} />
      </Section>

      <Section title="☁️ الحفظ السحابي">
        <RowButton icon={<Cloud size={18} className="text-blue-500" />} label="مزامنة الحساب" sub={settings.syncUsername ? `مربوط: ${settings.syncUsername}` : 'احفظي بياناتج باسم وكلمة سر'} onClick={() => setShowSyncModal(true)} />
      </Section>

      <Section title="التحفيز">
        <RowButton icon={<Users size={18} className="text-rose-500" />} label="إنجازاتي 🏆" sub="شوفي كل الشارات اللي حصلتي عليها" onClick={() => nav('/achievements')} />
      </Section>

      <Section title="المجموعة">
        <RowButton icon={<Users size={18} className="text-rose-500" />} label={settings.groupId ? `مجموعتنا (${settings.groupCode})` : 'انضمي لمجموعة'} sub={settings.groupId ? 'شوفي تقدم صاحباتج 🌸' : 'شاركي تقدمج مع صاحباتج'} onClick={() => nav('/group')} />
      </Section>

      <Section title="أدواتي">
        <RowButton icon={<Sprout size={18} className="text-mint-300" />} label="عاداتي اليومية 🌱" sub="شرب الماي، القراءة، إلخ" onClick={() => nav('/habits')} />
        <RowButton icon={<ShoppingCart size={18} className="text-peach-300" />} label="قائمة المشتريات 🛒" sub="شنو نشتري اليوم؟" onClick={() => nav('/shopping')} />
      </Section>

      <Section title="المظهر">
        <ToggleRow icon={<Moon size={18} className="text-lavender-300" />} label="الوضع الداكن" sub="مريح للعين بالليل"
          checked={settings.darkMode} onChange={v => update({ darkMode: v })} />
      </Section>

      <Section title="الأصوات والتنبيهات">
        <ToggleRow icon={<Bell size={18} className="text-rose-500" />} label="تفعيل الإشعارات" sub="تذكير بالمهام والمواعيد"
          checked={settings.notificationsEnabled} onChange={async (v) => {
            if (v) {
              const { requestNotificationPermission } = await import('../lib/notifications');
              const granted = await requestNotificationPermission();
              if (!granted) { alert('الإشعارات مرفوضة من النظام'); return; }
            }
            update({ notificationsEnabled: v });
          }} />
        <RowButton icon={<Volume2 size={18} className="text-rose-500" />} label="إدارة الأصوات" sub="اختاري نغمة لكل تنبيه" onClick={() => nav('/sounds')} />
        <ToggleRow icon={<Bell size={18} className="text-peach-300" />} label="تفعيل الأصوات" sub="تشغيل نغمات التنبيهات"
          checked={settings.soundsEnabled} onChange={v => update({ soundsEnabled: v })} />
        <ToggleRow icon={<Sparkles size={18} className="text-mint-300" />} label="الاهتزاز" sub="اهتزاز خفيف عند التفاعل"
          checked={settings.vibrationEnabled} onChange={v => update({ vibrationEnabled: v })} />
      </Section>

      <Section title="مؤقت التركيز">
        <RowButton icon={<Timer size={18} className="text-rose-500" />} label="افتحي المؤقت ▶️" sub="ابدئي جلسة تركيز أو استراحة" onClick={() => nav('/focus')} />
        <NumberRow icon={<Timer size={18} className="text-rose-500" />} label="مدة التركيز (دقيقة)" value={settings.focusDuration} min={5} max={90} onChange={v => update({ focusDuration: v })} />
        <NumberRow icon={<Timer size={18} className="text-lavender-300" />} label="استراحة قصيرة (دقيقة)" value={settings.shortBreakDuration} min={1} max={15} onChange={v => update({ shortBreakDuration: v })} />
        <NumberRow icon={<Timer size={18} className="text-mint-300" />} label="استراحة طويلة (دقيقة)" value={settings.longBreakDuration} min={10} max={45} onChange={v => update({ longBreakDuration: v })} />
      </Section>

      <Section title="التحديثات">
        <RowButton icon={<Download size={18} className="text-rose-500" />} label="البحث عن تحديثات" sub="تحققي إذا فيه إصدار جديد"
          onClick={async () => {
            const res = await checkUpdates();
            if (res.hasUpdate) {
              if (confirm(`تحديث جديد متوفر (v${res.latestVersion})!\nتريدين الانتقال لصفحة التنزيل؟`)) window.open(res.url, '_blank');
            } else setShowUpdateAlert(true);
          }} />
      </Section>

      <Section title="البيانات">
        <RowButton icon={<Database size={18} className="text-lavender-300" />} label="النسخ الاحتياطي" sub="حفظ واستعادة البيانات (ملف)" onClick={() => nav('/backup')} />
      </Section>

      <Section title="المساعد الذكي 🧠">
        <ToggleRow icon={<Brain size={18} className="text-lavender-300" />} label="تفعيل الذكاء الاصطناعي" sub="Groq — سريع ومجاني"
          checked={settings.aiEnabled} onChange={v => update({ aiEnabled: v })} />
        {settings.aiEnabled && (
          <div className="px-4 py-3">
            <button onClick={handleTest} disabled={testState.status === 'testing'}
              className="w-full bg-lavender-300 text-white rounded-xl2 py-2.5 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {testState.status === 'testing' ? <><Loader2 size={16} className="animate-spin" /> جاري...</> : <><Sparkles size={16} /> اختبار الاتصال</>}
            </button>
            {testState.status === 'ok' && <p className="mt-2 text-xs text-mint-300 font-semibold flex items-center gap-1"><CheckCircle2 size={14} /> {testState.msg}</p>}
            {testState.status === 'err' && <p className="mt-2 text-xs text-rose-500 font-semibold flex items-center gap-1"><XCircle size={14} /> {testState.msg}</p>}
          </div>
        )}
      </Section>

      <div className="card-soft mt-4 text-center relative overflow-hidden">
        <div className="relative">
          <Info size={20} className="mx-auto text-rose-400 mb-2" />
          <p className="text-sm font-semibold text-ink-700 dark:text-rose-100">يومي الحلو 🌸</p>
          <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-1">الإصدار {APP_VERSION}</p>
          <p className="text-xs text-ink-300 mt-3">يومك مرتب وراحتج أهم</p>
          <div className="mt-4 pt-4 border-t border-rose-100 dark:border-[#34343f]">
            <p className="text-[10px] font-bold text-ink-500 dark:text-rose-300/60 mb-1">تطوير وبرمجة</p>
            <p className="text-sm font-extrabold tracking-wide" style={{
              background: 'linear-gradient(135deg, #FF8FB1 0%, #B8A4EC 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>مهند الطائي</p>
            <p className="text-[10px] text-ink-300 dark:text-rose-300/40 mt-1">✨ بكل حب 🤍</p>
          </div>
        </div>
      </div>

      {showSyncModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowSyncModal(false)}>
          <div className="bg-white dark:bg-[#252532] rounded-3xl shadow-2xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 dark:bg-[#1e2a3a] flex items-center justify-center mb-3">
                  <Cloud size={32} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-extrabold text-ink-900 dark:text-rose-100">مزامنة الحساب</h3>
                <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-1">سجلي مرة وحدة ← استعيدي من أي جهاز</p>
              </div>
              <input type="text" value={syncUser} onChange={e => setSyncUser(e.target.value)} placeholder="اسم المستخدم (مثل: zahra)"
                className="w-full px-4 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] mb-2 text-sm text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400" />
              <input type="password" value={syncPass} onChange={e => setSyncPass(e.target.value)} placeholder="كلمة السر"
                className="w-full px-4 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] border border-rose-100 dark:border-[#34343f] mb-4 text-sm text-ink-900 dark:text-rose-100 outline-none focus:border-rose-400" />
              {syncMsg && <p className="text-xs text-center mb-3 font-bold text-rose-500">{syncMsg}</p>}
              <div className="flex gap-2">
                <button onClick={handleSyncSave} disabled={syncLoading}
                  className="flex-1 py-3 rounded-xl2 bg-blue-500 text-white font-bold text-sm active:scale-95 disabled:opacity-50">
                  {syncLoading ? '...' : '💾 حفظ'}
                </button>
                <button onClick={handleSyncRestore} disabled={syncLoading}
                  className="flex-1 py-3 rounded-xl2 bg-rose-400 text-white font-bold text-sm active:scale-95 disabled:opacity-50">
                  {syncLoading ? '...' : '📥 استعادة'}
                </button>
              </div>
              <button onClick={() => setShowSyncModal(false)} className="w-full mt-2 py-2 text-xs text-ink-500 dark:text-rose-300/80 font-semibold">إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {restoreConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setRestoreConfirm(null)}>
          <div className="bg-white dark:bg-[#252532] rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="text-6xl mb-3">⚠️</div>
            <h3 className="text-xl font-extrabold text-ink-900 dark:text-rose-100 mb-2">تأكيد الاستعادة</h3>
            <p className="text-sm text-ink-500 dark:text-rose-300/80 mb-4">
              آخر حفظ: {new Date(restoreConfirm.backupAt).toLocaleString('ar-IQ')}<br/>
              عدد المهام في هذه النسخة: {restoreConfirm.taskCount}
            </p>
            <p className="text-xs text-rose-500 font-bold mb-5">هل أنتِ متأكدة؟ البيانات الحالية في التطبيق ستُمسح وتُستبدل بهذه النسخة.</p>
            <div className="flex gap-2">
              <button onClick={() => setRestoreConfirm(null)} className="flex-1 py-3 rounded-xl2 bg-rose-100 dark:bg-[#34343f] text-ink-700 dark:text-rose-200 font-bold">إلغاء</button>
              <button onClick={executeRestore} disabled={syncLoading} className="flex-1 py-3 rounded-xl2 bg-blue-500 text-white font-bold">
                {syncLoading ? 'جاري...' : 'نعم، استعادة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpdateAlert && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowUpdateAlert(false)}>
          <div className="bg-white dark:bg-[#252532] rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-extrabold text-ink-900 dark:text-rose-100 mb-2">كلك ذوق!</h3>
            <p className="text-sm text-ink-500 dark:text-rose-300/80 mb-6">تطبيقك محدث لآخر إصدار، عاشت إيدج! 🌸</p>
            <button onClick={() => setShowUpdateAlert(false)}
              className="w-full py-3 rounded-xl2 bg-gradient-to-r from-rose-400 to-lavender-300 text-white font-bold">تمام</button>
          </div>
        </div>
      )}
    </Layout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-bold text-ink-500 dark:text-rose-300/80 mb-2 px-1">{title}</h2>
      <div className="card-soft divide-y divide-rose-50 dark:divide-[#34343f] p-0 overflow-hidden">{children}</div>
    </div>
  );
}

function RowButton({ icon, label, sub, onClick }: { icon: React.ReactNode; label: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3.5 text-right hover:bg-rose-50/50 dark:hover:bg-[#34343f]/50">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink-900 dark:text-rose-100 text-sm">{label}</p>
        <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-0.5">{sub}</p>
      </div>
      <ChevronLeft size={18} className="text-ink-300 shrink-0" />
    </button>
  );
}

function ToggleRow({ icon, label, sub, checked, onChange }: {
  icon: React.ReactNode; label: string; sub: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink-900 dark:text-rose-100 text-sm">{label}</p>
        <p className="text-xs text-ink-500 dark:text-rose-300/80 mt-0.5">{sub}</p>
      </div>
      <button onClick={() => onChange(!checked)} className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${checked ? 'bg-rose-400' : 'bg-rose-100 dark:bg-[#34343f]'}`}>
        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? 'right-1' : 'right-6'}`} />
      </button>
    </div>
  );
}

function NumberRow({ icon, label, value, min, max, onChange }: {
  icon: React.ReactNode; label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="shrink-0">{icon}</div>
      <p className="flex-1 font-semibold text-ink-900 dark:text-rose-100 text-sm">{label}</p>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => onChange(Math.max(min, value - 5))} className="w-8 h-8 rounded-full bg-rose-100 dark:bg-[#34343f] text-rose-600 font-bold">−</button>
        <span className="w-10 text-center font-bold text-ink-900 dark:text-rose-100 tabular-nums">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 5))} className="w-8 h-8 rounded-full bg-rose-400 text-white font-bold">+</button>
      </div>
    </div>
  );
}
