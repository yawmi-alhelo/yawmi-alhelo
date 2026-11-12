import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {useEffect , useState} from 'react';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Habits from './pages/Habits';
import Goals from './pages/Goals';
import Focus from './pages/Focus';
import Settings from './pages/Settings';
import Sounds from './pages/Sounds';
import Assistant from './pages/Assistant';
import Group from './pages/Group';
import Achievements from './pages/Achievements';
import Profile from './pages/Profile';
import AchievementPopup from './components/AchievementPopup';
import { useRewards } from './stores/useRewards';
import { registerAndSync } from './lib/admin/sync';
import { useSettings } from './stores/useSettings';
import Stats from './pages/Stats';
import Notes from './pages/Notes';
import Shopping from './pages/Shopping';
import Backup from './pages/Backup';
import Placeholder from './pages/Placeholder';
import ErrorBoundary from './components/ErrorBoundary';
import { initNotifications } from './lib/notifications';
import { ensureTicker, useFocusTimer } from './stores/useFocusTimer';

function AchievementNotifier() {
  const { lastAchievement, clearUnlock } = useRewards();
  if (!lastAchievement) return null;
  return <AchievementPopup achievement={lastAchievement} onClose={clearUnlock} />;
}


function AnnouncementBanner() {
  const [ann, setAnn] = useState<any>(null);
  const [dm, setDm] = useState<any>(null);
  const [maintenance, setMaintenance] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    registerAndSync().then(async r => {
      if (r.overrideApplied) {
        await useRewards.getState().load();
      }
      if (r.blocked) {
        alert('🚫 تم إيقاف حسابك: ' + r.reason);
        return;
      }
      if (r.maintenance) setMaintenance(true);
      if (r.forceUpdate) setForceUpdate(true);
      if (r.announcement) setAnn(r.announcement);
      if (r.directMessage) setDm(r.directMessage);
    });
  }, []);

  if (maintenance) {
    return (
      <div className="fixed inset-0 z-[400] bg-gradient-to-br from-rose-50 to-lavender-100 dark:from-[#1a1a24] dark:to-[#2a2535] flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-8xl mb-6 animate-pulse">🛠️</div>
          <h1 className="text-2xl font-extrabold text-rose-500 mb-3">التطبيق تحت الصيانة</h1>
          <p className="text-ink-700 dark:text-rose-200 text-sm">نعتذر عن الإزعاج، نرجع لج بأسرع وقت 💗</p>
        </div>
      </div>
    );
  }

  if (forceUpdate) {
    return (
      <div className="fixed inset-0 z-[400] bg-gradient-to-br from-rose-50 to-lavender-100 dark:from-[#1a1a24] dark:to-[#2a2535] flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-8xl mb-6">📲</div>
          <h1 className="text-2xl font-extrabold text-rose-500 mb-3">تحديث مطلوب</h1>
          <p className="text-ink-700 dark:text-rose-200 text-sm mb-6">فيه نسخة جديدة لازم تنزلينها عشان تستمري</p>
          <button
            onClick={() => window.open('https://github.com/yawmi-alhelo/yawmi-alhelo/releases/latest/download/app-debug.apk', '_blank')}
            className="bg-rose-400 text-white rounded-xl2 px-8 py-3 font-bold"
          >
            تحديث الآن
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {ann && !dismissed && (
        <div className={`fixed top-0 left-0 right-0 z-[250] px-4 py-2 text-center text-sm font-bold shadow-lg text-white ${
          ann.priority === 'urgent' ? 'bg-gradient-to-r from-red-500 to-rose-600'
          : ann.priority === 'important' ? 'bg-gradient-to-r from-orange-400 to-amber-500'
          : 'bg-gradient-to-r from-blue-400 to-cyan-400'
        }`}>
          <button onClick={() => setDismissed(true)} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/80 text-xs">✕</button>
          <p>📢 {ann.title}</p>
          <p className="text-xs opacity-90 mt-0.5">{ann.message}</p>
        </div>
      )}
      {dm && (
        <div className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center p-4" onClick={() => setDm(null)}>
          <div className="bg-white dark:bg-[#252532] rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-6xl mb-3">💌</div>
            <h3 className="text-lg font-extrabold text-ink-900 dark:text-rose-100 mb-2">{dm.title}</h3>
            <p className="text-sm text-ink-500 dark:text-rose-300/80 leading-relaxed mb-4">{dm.message}</p>
            <button onClick={() => setDm(null)} className="w-full py-3 rounded-xl2 bg-gradient-to-r from-rose-400 to-lavender-300 text-white font-bold">تمام</button>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  const load = useSettings(s => s.load);

  useEffect(() => {
    load();
    initNotifications();
    useFocusTimer.getState().loadFromStorage();
    ensureTicker();
  }, [load]);

  return (
    <ErrorBoundary>
    <BrowserRouter>
      <AnnouncementBanner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/new" element={<Tasks />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/focus" element={<Focus />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/group" element={<Group />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/shopping" element={<Shopping />} />
        <Route path="/appointments" element={<Placeholder title="المواعيد" />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/backup" element={<Backup />} />
        <Route path="/sounds" element={<Sounds />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Placeholder title="صفحة غير موجودة" />} />
      </Routes>
      <AchievementNotifier />
    </BrowserRouter>
    </ErrorBoundary>
  );
}
