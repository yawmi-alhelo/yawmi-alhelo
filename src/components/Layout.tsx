import type { ReactNode } from 'react';
import BottomNav from './BottomNav';

interface Props {
  children: ReactNode;
  hideNav?: boolean;
}

export default function Layout({ children, hideNav }: Props) {
  return (
    <div className="min-h-screen bg-rose-50 dark:bg-[#1a1a24]">
      <main className="max-w-lg mx-auto px-4 pt-6 pb-32">
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
