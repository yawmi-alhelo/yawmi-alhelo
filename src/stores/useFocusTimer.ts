import { create } from 'zustand';
import type { FocusType } from '../types';
import { Focus as FocusRepo } from '../lib/repositories';
import { notifyNow } from '../lib/notifications';
import { checkForNewAchievements } from '../lib/achievements';
import { useRewards } from './useRewards';

const STORAGE_KEY = 'yawmi_focus_timer_v2';

interface Persisted {
  type: FocusType;
  status: 'idle' | 'running' | 'paused' | 'done';
  totalSeconds: number;
  remainingSeconds: number;
  endsAt: number | null;    // timestamp نهاية الجلسة (للمرجع فقط)
}

interface FocusState extends Persisted {
  start: (type: FocusType, minutes: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<void>;
  tick: () => void;
  setType: (type: FocusType, minutes: number) => void;
  loadFromStorage: () => void;
}

const initial: Persisted = {
  type: 'focus',
  status: 'idle',
  totalSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  endsAt: null,
};

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function persist(state: Persisted) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function finishSession(s: Persisted) {
  FocusRepo.addFocusSession(s.type, Math.round(s.totalSeconds / 60), true).catch(console.warn);
  // فحص إنجازات التركيز
  setTimeout(async () => {
    try {
      const newAch = await checkForNewAchievements();
      if (newAch.length > 0) {
        useRewards.setState({ lastAchievement: newAch[0] });
        setTimeout(() => useRewards.setState({ lastAchievement: null }), 6500);
      }
    } catch {}
  }, 1000);
  notifyNow(
    s.type === 'focus' ? '🎉 خلصتِ التركيز!' : '🌿 خلصتِ الاستراحة',
    s.type === 'focus' ? 'عاشت إيدج، خذي استراحة تستاهلين' : 'يلا نكمل، إنتي قادرة',
    s.type === 'focus' ? 'success' : 'rest'
  );
}

export const useFocusTimer = create<FocusState>((set, get) => ({
  ...initial,

  loadFromStorage: () => {
    const saved = loadPersisted();
    if (!saved) return;
    if (saved.status === 'running' && saved.endsAt) {
      const remaining = Math.max(0, Math.floor((saved.endsAt - Date.now()) / 1000));
      if (remaining === 0) {
        const done: Persisted = { ...saved, remainingSeconds: 0, status: 'done', endsAt: null };
        set(done);
        persist(done);
        finishSession(saved);
      } else {
        set({ ...saved, remainingSeconds: remaining });
      }
    } else {
      set(saved);
    }
  },

  setType: (type, minutes) => {
    const next: Persisted = {
      type, status: 'idle',
      totalSeconds: minutes * 60,
      remainingSeconds: minutes * 60,
      endsAt: null,
    };
    set(next);
    persist(next);
  },

  start: (type, minutes) => {
    const now = Date.now();
    const total = minutes * 60;
    const next: Persisted = {
      type, status: 'running',
      totalSeconds: total,
      remainingSeconds: total,
      endsAt: now + total * 1000,
    };
    set(next);
    persist(next);
  },

  pause: () => {
    const s = get();
    if (s.status !== 'running') return;
    const remaining = Math.max(0, Math.floor(((s.endsAt || 0) - Date.now()) / 1000));
    const next: Persisted = { ...s, status: 'paused', remainingSeconds: remaining, endsAt: null };
    set(next);
    persist(next);
  },

  resume: () => {
    const s = get();
    if (s.status !== 'paused') return;
    const next: Persisted = {
      ...s, status: 'running',
      endsAt: Date.now() + s.remainingSeconds * 1000,
    };
    set(next);
    persist(next);
  },

  tick: () => {
    const s = get();
    if (s.status !== 'running' || !s.endsAt) return;
    const remaining = Math.max(0, Math.floor((s.endsAt - Date.now()) / 1000));
    if (remaining === 0) {
      const done: Persisted = { ...s, remainingSeconds: 0, status: 'done', endsAt: null };
      set(done);
      persist(done);
      finishSession(s);
      return;
    }
    if (remaining !== s.remainingSeconds) {
      set({ ...s, remainingSeconds: remaining });
    }
  },

  stop: async () => {
    const s = get();
    if (s.status === 'running' || s.status === 'paused') {
      const elapsedSec = s.totalSeconds - s.remainingSeconds;
      if (elapsedSec >= 60) {
        await FocusRepo.addFocusSession(s.type, Math.round(elapsedSec / 60), false).catch(console.warn);
      }
    }
    const next: Persisted = {
      ...initial,
      type: s.type,
      totalSeconds: s.totalSeconds,
      remainingSeconds: s.totalSeconds,
    };
    set(next);
    persist(next);
  },
}));

let tickerStarted = false;
export function ensureTicker() {
  if (tickerStarted) return;
  tickerStarted = true;
  setInterval(() => useFocusTimer.getState().tick(), 1000);
}
