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
  useEffect(() => {
    registerAndSync().then(r => {
      if (r.blocked) {
        alert('🚫 تم إيقاف حسابك من الإدارة: ' + r.reason);
        return;
      }
      if (r.announcement) setAnn(r.announcement);
    });
  }, []);
  if (!ann) return null;
  const colors: any = { info: 'from-blue-400 to-cyan-400', success: 'from-green-400 to-emerald-400', warning: 'from-orange-400 to-red-400' };
  return (
    <div className={`fixed top-0 left-0 right-0 z-[250] bg-gradient-to-r ${colors[ann.type] || colors.info} text-white px-4 py-2 text-center text-sm font-bold shadow-lg`}>
      <p>📢 {ann.title}</p>
      <p className="text-xs opacity-90 mt-0.5">{ann.message}</p>
    </div>
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
