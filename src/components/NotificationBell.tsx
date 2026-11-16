import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '../stores/useNotifications';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications = [], markAllAsRead, clearAll } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpen = () => {
    setIsOpen(true);
    markAllAsRead();
  };

  return (
    <>
      <button 
        onClick={handleOpen} 
        className="fixed top-8 left-4 z-[9999] p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all shadow-lg backdrop-blur-md"
      >
        <Bell size={20} className="text-gray-800 dark:text-gray-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold animate-pulse shadow-[0_0_10px_rgba(236,72,153,0.8)]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
          <div className="bg-white dark:bg-[#1a1a24] w-full max-w-sm rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[80vh] shadow-2xl">
            
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Bell size={18} className="text-pink-500" /> الإشعارات
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white bg-gray-200 dark:bg-white/5 p-1 rounded-full">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-10">
                  <Bell size={40} className="mx-auto text-gray-400 dark:text-gray-600 mb-3 opacity-50" />
                  <p className="text-gray-500 text-sm">لا توجد إشعارات حالياً</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-gray-100 dark:border-white/5">
                    <h4 className="font-bold text-sm text-pink-500">{n.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-white/10 text-center bg-gray-50 dark:bg-black/20">
                <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-400 font-bold">
                  مسح كل الإشعارات
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
