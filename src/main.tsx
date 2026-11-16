import React from 'react'
import ReactDOM from 'react-dom/client'
import { ForceSyncModal } from './components/ForceSyncModal';
import App from './App'
import { NotificationBell } from './components/NotificationBell'
import './index.css'


// منع النسخ والتحديد نهائياً (ما عدا حقول الإدخال)
document.addEventListener('copy', (e) => e.preventDefault());
document.addEventListener('cut', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
  e.preventDefault();
});
document.addEventListener('selectstart', (e) => {
  const target = e.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
  e.preventDefault();
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <>
      <NotificationBell />
      <>
      <ForceSyncModal />
      <App />
    </>
    </>
  </React.StrictMode>,
)

