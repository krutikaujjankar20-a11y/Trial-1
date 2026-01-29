
import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { ADMIN_BASE_PATH } from '../../constants';

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();
  const { history, markAsRead } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const pathParts = location.pathname.split('/').filter(p => p && p !== '1234' && p !== 'admin');
  const currentPage = pathParts[0] ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1) : 'Dashboard';

  const unreadCount = history.filter(n => !n.isRead).length;

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40 transition-all">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
        >
          <span className="text-2xl">☰</span>
        </button>

        <div className="hidden md:block">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Link to={`${ADMIN_BASE_PATH}/dashboard`} className="hover:text-primary transition-colors">Admin</Link>
            <span>/</span>
            <span className="text-dark">{currentPage}</span>
          </div>
          <h2 className="text-xl font-black text-dark tracking-tight">{currentPage}</h2>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8 hidden lg:block">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Global search rooms, bookings..." 
            className="w-full bg-gray-50 border-none px-12 py-3 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all group-hover:bg-gray-100"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-30">🔍</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowUserDropdown(false); }}
            className={`p-2.5 hover:bg-gray-100 rounded-2xl relative transition-all ${showNotifications ? 'bg-gray-100' : ''}`}
          >
            <span className="text-xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[10px] flex items-center justify-center text-white font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                <h4 className="font-bold text-sm">Notifications</h4>
                <button className="text-[10px] uppercase font-bold text-primary hover:underline">Mark all read</button>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                {history.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">No new notifications</div>
                ) : (
                  history.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-primary/5' : ''}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg">
                          {n.type === 'success' ? '✅' : 'ℹ️'}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-dark">{n.title}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-[9px] text-gray-300 mt-2 font-bold">{n.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* User Dropdown */}
        <div className="relative">
          <button 
            onClick={() => { setShowUserDropdown(!showUserDropdown); setShowNotifications(false); }}
            className={`flex items-center gap-2 p-1.5 md:p-2 hover:bg-gray-100 rounded-2xl transition-all border border-transparent ${showUserDropdown ? 'bg-gray-100 border-gray-200' : ''}`}
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-xl overflow-hidden border-2 border-primary/20 shrink-0">
              <img src={user?.avatar_url || 'https://i.pravatar.cc/100?u=admin'} alt="avatar" />
            </div>
            <div className="text-left hidden sm:block min-w-[100px]">
              <p className="text-sm font-bold truncate leading-none mb-0.5">{user?.full_name?.split(' ')[0] || 'Admin'}</p>
              <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">{user?.role || 'Admin'}</p>
            </div>
            <span className={`text-[10px] text-gray-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-4 w-56 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 bg-gray-50/50 border-b">
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Account</p>
              </div>
              <div className="p-2 space-y-1">
                <Link 
                  to={`${ADMIN_BASE_PATH}/settings`} 
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-dark rounded-2xl transition-all"
                >
                  <span>👤</span> My Profile
                </Link>
                <Link 
                  to={`${ADMIN_BASE_PATH}/settings`} 
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-dark rounded-2xl transition-all"
                >
                  <span>⚙️</span> Settings
                </Link>
                <div className="h-px bg-gray-50 my-2 mx-4" />
                <button 
                  onClick={() => { logout(); navigate('/login'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold"
                >
                  <span>🚪</span> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
