
import React from 'react';
import { useNotificationStore } from '../../store/notificationStore';

export const NotificationCenter: React.FC = () => {
  const { toasts, removeToast } = useNotificationStore();

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`
            p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-right-full duration-300
            ${toast.type === 'success' ? 'bg-green-50/90 border-green-100 text-green-800' : ''}
            ${toast.type === 'error' ? 'bg-red-50/90 border-red-100 text-red-800' : ''}
            ${toast.type === 'warning' ? 'bg-yellow-50/90 border-yellow-100 text-yellow-800' : ''}
            ${toast.type === 'info' ? 'bg-primary/10 border-primary/20 text-dark' : ''}
          `}
        >
          <div className="text-xl">
            {toast.type === 'success' && '✅'}
            {toast.type === 'error' && '❌'}
            {toast.type === 'warning' && '⚠️'}
            {toast.type === 'info' && 'ℹ️'}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm">{toast.title}</h4>
            <p className="text-xs opacity-80 mt-1">{toast.message}</p>
          </div>
          <button 
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-dark transition-colors"
          >✕</button>
        </div>
      ))}
    </div>
  );
};
