import type { ReactNode } from 'react';
import BottomNav from './BottomNav';

interface Props {
  children: ReactNode;
  hideNav?: boolean;
}

export default function Layout({ children, hideNav }: Props) {
  return (
    <div className="h-screen w-full bg-rose-50 dark:bg-[#1a1a24] flex flex-col">
      <div className="main-scroll-container flex-1 pb-32">
        <main className="max-w-lg mx-auto px-4 pt-6">{children}</main>
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
}
