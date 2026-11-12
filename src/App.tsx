import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
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
import Stats from './pages/Stats';
import Notes from './pages/Notes';
import Shopping from './pages/Shopping';
import Backup from './pages/Backup';
import Placeholder from './pages/Placeholder';
import ErrorBoundary from './components/ErrorBoundary';
import { useSettings } from './stores/useSettings';
import { initNotifications } from './lib/notifications';
import { ensureTicker, useFocusTimer } from './stores/useFocusTimer';

function AchievementNotifier() {
  const { lastAchievement, clearUnlock } = useRewards();
  if (!lastAchievement) return null;
  return <AchievementPopup achievement={lastAchievement} onClose={clearUnlock} />;
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
