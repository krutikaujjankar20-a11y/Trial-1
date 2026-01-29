
import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { mockSupabase } from '../services/supabase';
import { Card, Badge, Button } from '../components/common/UI';
import { Link } from 'react-router-dom';
import { ADMIN_BASE_PATH } from '../constants';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [notification, setNotification] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: mockSupabase.stats.getDashboard
  });

  const { data: recentBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['recent-bookings'],
    queryFn: () => mockSupabase.bookings.getRecent(10)
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would be a Supabase Realtime subscription
      // queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      // For demo, just show a notification
      const messages = [
        "New booking received from Rahul Sharma!",
        "Room 101 status changed to Occupied",
        "Payment of ₹3,500 confirmed for BK1005",
        "New user registration: Emily Watson"
      ];
      setNotification(messages[Math.floor(Math.random() * messages.length)]);
      setTimeout(() => setNotification(null), 3000);
    }, 15000);

    return () => clearInterval(interval);
  }, [queryClient]);

  // Fix: Updated status values to match the Booking interface ('Approved' instead of 'Confirmed')
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge color="bg-green-100 text-green-700">Approved</Badge>;
      case 'Pending': return <Badge color="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'Cancelled': return <Badge color="bg-red-100 text-red-700">Cancelled</Badge>;
      default: return <Badge color="bg-gray-100 text-gray-700">{status}</Badge>;
    }
  };

  if (statsLoading || bookingsLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[450px] bg-gray-200 rounded-2xl"></div>
          <div className="h-[450px] bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Rooms', value: stats?.totalRooms, icon: '🏨', trend: 'Total Inventory', color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Bookings', value: stats?.activeBookings, icon: '📅', trend: '+12% this week', color: 'bg-purple-50 text-purple-600' },
    { label: 'Available Rooms', value: stats?.availableRooms, icon: '✨', trend: 'Ready for check-in', color: 'bg-green-50 text-green-600' },
    { label: 'Total Revenue', value: `₹${stats?.totalRevenue.toLocaleString()}`, icon: '💰', trend: '+8.4% growth', color: 'bg-primary/10 text-dark' },
  ];

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Real-time notification toast */}
      {notification && (
        <div className="fixed top-20 right-8 z-50 animate-fade-in">
          <div className="bg-dark text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10">
            <span className="animate-bounce">🔔</span>
            <span className="text-sm font-medium">{notification}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Welcome back, Admin!</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with Dost today.</p>
        </div>
        <div className="hidden sm:flex gap-3">
          <Button variant="ghost" className="border">Download Report</Button>
          <Button>Refresh Data</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="group hover:shadow-md transition-all border-none shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{kpi.label}</p>
                <h3 className="text-3xl font-bold mt-2 text-dark">{kpi.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${kpi.color}`}>
                {kpi.icon}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-xs font-semibold text-gray-400">{kpi.trend}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card title="Revenue Analysis (Last 6 Months)" className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.revenueByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#87CEEB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#87CEEB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(val) => `₹${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#87CEEB" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Booking Volume" className="border-none shadow-sm">
           <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip 
                   cursor={{ fill: '#F9FAFB' }}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#87CEEB" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      <Card className="border-none shadow-sm overflow-hidden p-0">
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <h3 className="text-xl font-bold text-dark">Recent Bookings</h3>
          <Link to={`${ADMIN_BASE_PATH}/bookings`}>
            <Button variant="ghost" className="text-sm font-semibold text-primary">View All Bookings →</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-8 py-4">Guest Name</th>
                <th className="px-8 py-4">Room Details</th>
                <th className="px-8 py-4">Check-in / Out</th>
                <th className="px-8 py-4">Amount</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentBookings?.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      {/* Fix: Accessing user.full_name instead of non-existent guest_name */}
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {(booking.user?.full_name || 'G').charAt(0)}
                      </div>
                      <span className="font-semibold text-dark">{booking.user?.full_name || 'Guest'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {/* Fix: Accessing room.roomname instead of non-existent room_name */}
                    <span className="text-sm text-gray-600">{booking.room?.roomname || 'N/A'}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm font-medium text-dark">{booking.check_in}</div>
                    <div className="text-xs text-gray-400">{booking.check_out}</div>
                  </td>
                  <td className="px-8 py-5 font-bold text-dark">₹{booking.total_price.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    {/* Fix: Passing booking_status instead of status */}
                    {getStatusBadge(booking.booking_status)}
                  </td>
                  <td className="px-8 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 text-gray-400 hover:text-primary transition-all">
                      👁️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
