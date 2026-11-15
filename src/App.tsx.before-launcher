import { HashRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Habits = lazy(() => import('./pages/Habits'));
const Goals = lazy(() => import('./pages/Goals'));
const Focus = lazy(() => import('./pages/Focus'));
const Settings = lazy(() => import('./pages/Settings'));
const Sounds = lazy(() => import('./pages/Sounds'));
const Assistant = lazy(() => import('./pages/Assistant'));
const Group = lazy(() => import('./pages/Group'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Prayers = lazy(() => import('./pages/Prayers'));
const Cycles = lazy(() => import('./pages/Cycles'));
const Profile = lazy(() => import('./pages/Profile'));
const Stats = lazy(() => import('./pages/Stats'));
const Notes = lazy(() => import('./pages/Notes'));
const Shopping = lazy(() => import('./pages/Shopping'));
const Backup = lazy(() => import('./pages/Backup'));
const Favorites = lazy(() => import('./pages/Favorites'));
const AppointmentsPage = lazy(() => import('./pages/Appointments'));














import AchievementPopup from './components/AchievementPopup';
import { useRewards } from './stores/useRewards';
import { registerAndSync } from './lib/admin/sync';
import { saveBackupToCloud } from './lib/admin/backup';
import { useSettings } from './stores/useSettings';





import Placeholder from './pages/Placeholder';
import ErrorBoundary from './components/ErrorBoundary';
import { initNotifications } from './lib/notifications';
import { ensureTicker, useFocusTimer } from './stores/useFocusTimer';

function AchievementNotifier() {
  const { lastAchievement, clearUnlock } = useRewards();
  if (!lastAchievement) return null;
  return <AchievementPopup achievement={lastAchievement} onClose={clearUnlock} />;
}


interface Announcement {
  priority?: string;
  title?: string;
  message?: string;
}

interface DirectMessage {
  title?: string;
  message?: string;
}

function AnnouncementBanner() {
  const [ann, setAnn] = useState<Announcement | null>(null);
  const [dm, setDm] = useState<DirectMessage | null>(null);
  const [maintenance, setMaintenance] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let syncInterval: number | undefined;

    void registerAndSync().then(async r => {
      if (cancelled) return;

      if (r.overrideApplied) {
        await useRewards.getState().load();
      }

      if (cancelled) return;

      const settings = useSettings.getState().settings;

      if (settings.syncUsername && settings.syncPassword) {
        void saveBackupToCloud(settings.syncUsername, settings.syncPassword);

        syncInterval = window.setInterval(() => {
          const s = useSettings.getState().settings;
          if (s.syncUsername && s.syncPassword) {
            void saveBackupToCloud(s.syncUsername, s.syncPassword);
          }
        }, 5 * 60 * 1000);
      }

      if (r.blocked) {
        alert('🚫 تم إيقاف حسابك: ' + r.reason);
        return;
      }

      if (r.maintenance) setMaintenance(true);
      if (r.forceUpdate) setForceUpdate(true);
      if (r.announcement) setAnn(r.announcement);
      if (r.directMessage) setDm(r.directMessage);
    }).catch(error => {
      console.error('Announcement initialization failed:', error);
    });

    return () => {
      cancelled = true;
      if (syncInterval !== undefined) {
        window.clearInterval(syncInterval);
      }
    };
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
    <HashRouter>
      <AnnouncementBanner />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-rose-500 font-bold">جاري تحميل الصفحة...</div>}>
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
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/backup" element={<Backup />} />
        <Route path="/sounds" element={<Sounds />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/prayers" element={<Prayers />} />
        <Route path="/cycles" element={<Cycles />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Placeholder title="صفحة غير موجودة" />} />
        </Routes>
      </Suspense>
      <AchievementNotifier />
    </HashRouter>
    </ErrorBoundary>
  );
}
