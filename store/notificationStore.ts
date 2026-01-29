
import { create } from 'zustand';
import { Notification } from '../types';

interface NotificationState {
  toasts: Notification[];
  history: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  removeToast: (id: string) => void;
  markAsRead: (id: string) => void;
  clearHistory: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  toasts: [],
  history: [],
  addNotification: (n) => {
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toLocaleTimeString();
    const newNotification: Notification = { ...n, id, timestamp, isRead: false };
    
    set((state) => ({
      toasts: [...state.toasts, newNotification],
      history: [newNotification, ...state.history].slice(0, 50)
    }));

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, 4000);
  },
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),
  markAsRead: (id) => set((state) => ({
    history: state.history.map((n) => n.id === id ? { ...n, isRead: true } : n)
  })),
  clearHistory: () => set({ history: [] })
}));
