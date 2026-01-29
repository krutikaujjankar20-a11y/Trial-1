
import React, { useState } from 'react';
import { Card, Button, Input, Select } from '../components/common/UI';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

type TabType = 'website' | 'profile' | 'password' | 'system';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('website');
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addNotification({
        title: 'Settings Saved',
        message: 'Your preferences have been updated successfully.',
        type: 'success'
      });
    }, 1200);
  };

  const tabs = [
    { id: 'website', label: 'Website Config', icon: '🌐' },
    { id: 'profile', label: 'Admin Profile', icon: '👤' },
    { id: 'password', label: 'Security', icon: '🔒' },
    { id: 'system', label: 'System', icon: '⚙️' },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-dark tracking-tight">System Settings</h1>
          <p className="text-gray-500">Configure application global parameters and security</p>
        </div>
        <Button onClick={handleSave} isLoading={loading} className="px-8 shadow-lg shadow-primary/20">
          Save All Changes
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`
              px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2
              ${activeTab === tab.id 
                ? 'bg-white text-dark shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'}
            `}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'website' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card title="Brand Identity" className="lg:col-span-2 border-none shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Site Title" defaultValue="Dost Hospitality Admin" />
              <Input label="Business Phone" defaultValue="+91 98765 43210" />
            </div>
            <Input label="Support Email" defaultValue="support@dostapp.com" />
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Footer Attribution</label>
              <textarea 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 h-24 text-sm"
                defaultValue="© 2024 Dost Hospitality Ecosystem. All Rights Reserved."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Instagram" placeholder="@username" />
              <Input label="Facebook" placeholder="page_url" />
              <Input label="Twitter" placeholder="@handle" />
            </div>
          </Card>
          
          <div className="space-y-6">
            <Card title="Logo & Assets" className="border-none shadow-sm text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl font-black text-primary border-4 border-white shadow-xl">
                D
              </div>
              <Button variant="secondary" className="w-full text-xs">Update Logo</Button>
              <p className="text-[10px] text-gray-400 mt-4 uppercase font-bold tracking-widest">Recommended: 512x512px PNG</p>
            </Card>

            <Card title="Interface Theme" className="border-none shadow-sm">
               <div className="space-y-4">
                  <p className="text-xs text-gray-500 mb-2">Primary Application Color</p>
                  <div className="flex gap-2">
                     {['#87CEEB', '#10B981', '#6366F1', '#F59E0B', '#EF4444'].map(color => (
                       <button 
                         key={color} 
                         className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === '#87CEEB' ? 'border-dark shadow-lg' : 'border-transparent'}`}
                         style={{ backgroundColor: color }}
                       />
                     ))}
                  </div>
               </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <Card className="border-none shadow-sm max-w-2xl mx-auto">
          <div className="flex flex-col items-center mb-10">
             <div className="relative group">
                <div className="w-32 h-32 rounded-[2rem] bg-gray-100 overflow-hidden border-4 border-white shadow-2xl transition-transform group-hover:scale-105">
                  <img src={user?.avatar_url || 'https://i.pravatar.cc/200?u=admin'} className="w-full h-full object-cover" />
                </div>
                <button className="absolute bottom-[-10px] right-[-10px] w-10 h-10 bg-primary text-dark rounded-2xl flex items-center justify-center shadow-lg border-2 border-white hover:bg-sky-400">
                  📷
                </button>
             </div>
             <h2 className="text-2xl font-black mt-6">{user?.full_name}</h2>
             <p className="text-sm font-bold text-primary uppercase tracking-widest mt-1">{user?.role}</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Input label="Full Name" defaultValue={user?.full_name} />
               <Input label="Email (Read-only)" defaultValue={user?.email} disabled />
            </div>
            <Input label="Phone Number" defaultValue="+91 99999 88888" />
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Bio / About Me</label>
              <textarea 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 h-32 text-sm"
                placeholder="Write something about yourself..."
                defaultValue="Lead administrator for the central hospitality region. Focused on operational efficiency and guest satisfaction metrics."
              />
            </div>
            <p className="text-[10px] text-gray-400 text-center uppercase font-bold tracking-widest mt-8">Last profile update: 2 days ago</p>
          </div>
        </Card>
      )}

      {activeTab === 'password' && (
        <Card title="Update Security Credentials" className="border-none shadow-sm max-w-lg mx-auto">
          <div className="space-y-5">
             <Input label="Current Password" type="password" placeholder="••••••••" />
             <div className="h-px bg-gray-100 my-4" />
             <Input label="New Password" type="password" placeholder="Minimum 8 characters" />
             <Input label="Confirm New Password" type="password" />
             
             <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex gap-3 mt-8">
                <span className="text-xl">💡</span>
                <p className="text-xs text-yellow-800 leading-relaxed">
                  Passphrases should contain at least one uppercase letter, one special character, and one number for maximum security.
                </p>
             </div>

             <Button className="w-full py-4 mt-4">Change Secure Password</Button>
          </div>
        </Card>
      )}

      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <Card title="Supabase Cloud Health" className="border-none shadow-sm">
              <div className="space-y-6">
                 <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                    <div className="flex items-center gap-3">
                       <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                       <span className="text-sm font-bold text-green-800 uppercase tracking-widest">Active Connection</span>
                    </div>
                    <span className="text-xs text-green-700 font-bold">Latency: 42ms</span>
                 </div>
                 
                 <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                       <span>DB Storage Used</span>
                       <span>245 MB / 500 MB</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                       <div className="bg-primary h-full" style={{ width: '49%' }} />
                    </div>
                 </div>

                 <Button variant="secondary" className="w-full text-sm">Test Connection API</Button>
              </div>
           </Card>

           <Card title="Data Utility" className="border-none shadow-sm">
              <div className="space-y-4">
                 <Button variant="secondary" className="w-full justify-between h-14 bg-gray-50 border-none group">
                    <span className="flex items-center gap-3"><span className="text-xl">📊</span> Download System JSON</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                 </Button>
                 <Button variant="secondary" className="w-full justify-between h-14 bg-gray-50 border-none group">
                    <span className="flex items-center gap-3"><span className="text-xl">🧹</span> Clear Server Cache</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                 </Button>
                 
                 <div className="pt-6 mt-6 border-t border-gray-100">
                    <h4 className="text-sm font-black text-red-500 uppercase tracking-widest mb-4">Danger Zone</h4>
                    <Button variant="danger" className="w-full bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white">
                       Factory Reset Application Data
                    </Button>
                    <p className="text-[10px] text-gray-400 mt-3 italic text-center">This action cannot be undone. All rooms, users, and bookings will be wiped.</p>
                 </div>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
