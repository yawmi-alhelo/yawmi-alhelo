import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export interface AppNotification { id: string; title: string; message: string; date: string; read: boolean; }
interface NotificationState { notifications: AppNotification[]; markAllAsRead: () => void; clearAll: () => void; addNotification: (n: Omit<AppNotification, 'id' | 'date' | 'read'>) => void; syncFromCloud: (cloudNotifs: any[]) => void; }
export const useNotifications = create<NotificationState>()(persist((set) => ({
  notifications: [],
  markAllAsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  clearAll: () => set({ notifications: [] }),
  addNotification: (n) => set((s) => ({ notifications: [{ ...n, id: Math.random().toString(), read: false, date: new Date().toISOString() }, ...s.notifications] })),
  syncFromCloud: (cloudNotifs) => set((state) => {
    const existingTitles = new Set(state.notifications.map((n) => n.title + n.message));
    const newNotifs = cloudNotifs.filter((c) => !existingTitles.has(c.title + c.message)).map((c) => ({ id: String(c.id), title: c.title, message: c.message, date: c.created_at, read: false }));
    return { notifications: [...newNotifs, ...state.notifications] };
  })
}), { name: 'yh-notifications' }));
