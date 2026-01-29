
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '../../constants';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC<{ isOpen: boolean; toggle: () => void }> = ({ isOpen, toggle }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggle}
      />

      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-dark text-xl shadow-lg shadow-primary/20">D</div>
            <h1 className="text-xl font-black tracking-tight uppercase">Dost</h1>
          </div>

          {/* User Profile Section */}
          <div className="mb-8 p-4 bg-gray-50 rounded-2xl flex items-center gap-3 border border-gray-100">
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden bg-white">
              <img src={user?.avatar_url || 'https://i.pravatar.cc/100?u=admin'} alt="Profile" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate text-dark">{user?.full_name || 'Admin User'}</p>
              <p className="text-[10px] uppercase font-bold text-primary tracking-wider">{user?.role || 'Manager'}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-primary text-dark font-bold shadow-md shadow-primary/20' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-dark'
                  }
                `}
                onClick={() => { if (window.innerWidth < 1024) toggle(); }}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer Actions */}
          <div className="mt-auto pt-6 border-t border-gray-100">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
            >
              <span>🚪</span>
              Logout
            </button>
            <p className="text-[10px] text-gray-300 text-center mt-4 font-bold tracking-widest uppercase">Version 2.4.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};
