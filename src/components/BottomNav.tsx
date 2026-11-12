import { NavLink } from 'react-router-dom';
import { Home, Calendar, Sparkles, BarChart3, Settings } from 'lucide-react';

const items = [
  { to: '/', label: 'الرئيسية', Icon: Home },
  { to: '/calendar', label: 'التقويم', Icon: Calendar },
  { to: '/assistant', label: 'رفيق', Icon: Sparkles },
  { to: '/stats', label: 'الإحصائيات', Icon: BarChart3 },
  { to: '/settings', label: 'الإعدادات', Icon: Settings },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#252532] border-t border-rose-100 dark:border-[#34343f] z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl2 transition-all ${
                isActive
                  ? 'text-rose-500'
                  : 'text-ink-500 dark:text-rose-300/70 hover:text-rose-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[11px] font-semibold">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
