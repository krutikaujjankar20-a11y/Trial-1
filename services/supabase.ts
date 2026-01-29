import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Room, User, Booking, Payment, DashboardStats } from '../types';

// Initialize Supabase client with proper error handling
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

// Create a safe Supabase client that handles missing credentials
let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Create a placeholder client that will be replaced when credentials are available
  // This prevents the app from crashing on initialization
  console.warn('[v0] Supabase credentials not found. Using placeholder client.');
  supabase = createClient(
    'https://placeholder.supabase.co',
    'placeholder-key'
  );
}

export { supabase };

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// --- FALLBACK MOCK DATA (matches snake_case types) ---
const MOCK_USERS: User[] = [
  { id: '1', full_name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 9876543210', role: 'client', status: 'Active', total_bookings: 12, total_spent: 45000, avatar_url: '', created_at: '2023-01-01' },
  { id: '2', full_name: 'Anjali Gupta', email: 'anjali@example.com', phone: '+91 9123456789', role: 'client', status: 'Active', total_bookings: 5, total_spent: 18500, avatar_url: '', created_at: '2023-02-01' },
  { id: '3', full_name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 8888877777', role: 'client', status: 'Blocked', total_bookings: 2, total_spent: 3200, avatar_url: '', created_at: '2023-03-01' },
  { id: '4', full_name: 'Priya Patel', email: 'priya@example.com', phone: '+91 7777766666', role: 'client', status: 'Active', total_bookings: 8, total_spent: 22000, avatar_url: '', created_at: '2023-04-01' },
];

const MOCK_ROOMS: Room[] = [
  { id: '1', roomname: 'Superior Room 101', roomtype: 'Single', price: 1500, capacity: 1, status: 'Available', amenities: ['WiFi', 'AC', 'TV'], images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400'] },
  { id: '2', roomname: 'Luxury Suite 202', roomtype: 'Suite', price: 4500, capacity: 2, status: 'Booked', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar'], images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400'] },
  { id: '3', roomname: 'Deluxe King 305', roomtype: 'Deluxe', price: 3200, capacity: 3, status: 'Available', amenities: ['WiFi', 'AC'], images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400'] },
];

const MOCK_BOOKINGS: (Booking & { user?: User; room?: Room })[] = [
  { id: '1', user_id: '1', room_id: '1', check_in: '2023-11-20', check_out: '2023-11-22', total_price: 3000, booking_status: 'Approved', payment_status: 'Paid', created_at: '2023-11-15', user: MOCK_USERS[0], room: MOCK_ROOMS[0] },
  { id: '2', user_id: '2', room_id: '2', check_in: '2023-11-21', check_out: '2023-11-25', total_price: 18000, booking_status: 'Pending', payment_status: 'Pending', created_at: '2023-11-18', user: MOCK_USERS[1], room: MOCK_ROOMS[1] },
  { id: '3', user_id: '4', room_id: '3', check_in: '2023-12-01', check_out: '2023-12-05', total_price: 12800, booking_status: 'Cancelled', payment_status: 'Failed', created_at: '2023-11-20', user: MOCK_USERS[3], room: MOCK_ROOMS[2] },
];

const MOCK_PAYMENTS: (Payment & { user?: User; room?: Room })[] = [
  { id: '1', booking_id: '1', user_id: '1', room_id: '1', amount: 3000, transaction_id: 'TXN882211', payment_status: 'Paid', payment_method: 'Card', created_at: '2023-11-15', user: MOCK_USERS[0], room: MOCK_ROOMS[0] },
  { id: '2', booking_id: '2', user_id: '2', room_id: '2', amount: 18000, transaction_id: 'TXN993344', payment_status: 'Pending', payment_method: 'UPI', created_at: '2023-11-18', user: MOCK_USERS[1], room: MOCK_ROOMS[1] },
  { id: '3', booking_id: '3', user_id: '4', room_id: '3', amount: 12800, transaction_id: 'TXN112233', payment_status: 'Failed', payment_method: 'UPI', created_at: '2023-11-20', user: MOCK_USERS[3], room: MOCK_ROOMS[2] },
];

// --- SERVICE IMPLEMENTATION ---

export const mockSupabase = {
  auth: {
    signIn: async (email: string, password?: string) => {
      // If Supabase is not configured, allow demo login
      if (!isSupabaseConfigured()) {
        if (email === 'admin@dostapp.com') {
          return {
            data: {
              user: {
                id: 'demo-admin',
                email: 'admin@dostapp.com',
                full_name: 'Demo Admin',
                role: 'admin',
                avatar_url: ''
              }
            },
            error: null
          };
        }
        return { data: null, error: { message: 'Invalid credentials. Use admin@dostapp.com for demo.' } };
      }

      try {
        // Check if user exists with admin role
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .eq('role', 'admin')
          .single();

        if (error || !user) {
          return { data: null, error: { message: 'Invalid credentials or not an admin user' } };
        }

        return { 
          data: { 
            user: { 
              id: user.id, 
              email: user.email, 
              full_name: user.full_name, 
              role: user.role,
              avatar_url: user.avatar_url
            } 
          }, 
          error: null 
        };
      } catch (err) {
        // Fallback to demo login on error
        if (email === 'admin@dostapp.com') {
          return {
            data: {
              user: {
                id: 'demo-admin',
                email: 'admin@dostapp.com',
                full_name: 'Demo Admin',
                role: 'admin',
                avatar_url: ''
              }
            },
            error: null
          };
        }
        return { data: null, error: { message: 'Connection error. Use admin@dostapp.com for demo.' } };
      }
    }
  },

  rooms: {
    getAll: async (): Promise<Room[]> => {
      if (!isSupabaseConfigured()) return MOCK_ROOMS;
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        // Data already matches our snake_case interface
        return (data || []).map(r => ({
          ...r,
          price: Number(r.price),
          amenities: r.amenities || [],
          images: r.images || []
        })) as Room[];
      } catch (err) {
        console.error('[v0] Error fetching rooms:', err);
        return MOCK_ROOMS;
      }
    },

    getCount: async (): Promise<number> => {
      if (!isSupabaseConfigured()) return MOCK_ROOMS.length;
      try {
        const { count } = await supabase
          .from('rooms')
          .select('*', { count: 'exact', head: true });
        return count || 0;
      } catch (err) {
        return MOCK_ROOMS.length;
      }
    },

    getAvailableCount: async (): Promise<number> => {
      if (!isSupabaseConfigured()) return MOCK_ROOMS.filter(r => r.status === 'Available').length;
      try {
        const { count } = await supabase
          .from('rooms')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Available');
        return count || 0;
      } catch (err) {
        return MOCK_ROOMS.filter(r => r.status === 'Available').length;
      }
    },

    create: async (room: Omit<Room, 'id'>) => {
      if (!isSupabaseConfigured()) return { data: null, error: { message: 'Demo mode - cannot create rooms' } };
      try {
        const { data, error } = await supabase
          .from('rooms')
          .insert([room])
          .select()
          .single();
        return { data, error };
      } catch (err: any) {
        return { data: null, error: { message: err.message || 'Failed to create room' } };
      }
    },

    update: async (id: string, updates: Partial<Room>) => {
      if (!isSupabaseConfigured()) return { data: null, error: { message: 'Demo mode - cannot update rooms' } };
      try {
        const { data, error } = await supabase
          .from('rooms')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        return { data, error };
      } catch (err: any) {
        return { data: null, error: { message: err.message || 'Failed to update room' } };
      }
    },

    delete: async (id: string) => {
      if (!isSupabaseConfigured()) return { error: { message: 'Demo mode - cannot delete rooms' } };
      try {
        const { error } = await supabase
          .from('rooms')
          .delete()
          .eq('id', id);
        return { error };
      } catch (err: any) {
        return { error: { message: err.message || 'Failed to delete room' } };
      }
    },

    uploadImages: async (files: File[], onProgress?: (progress: number) => void): Promise<string[]> => {
      if (!isSupabaseConfigured()) {
        // Return placeholder images for demo mode
        if (onProgress) onProgress(100);
        return files.map(() => 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400');
      }
      
      const urls: string[] = [];
      const totalFiles = files.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `room-images/${fileName}`;

        try {
          const { error } = await supabase.storage
            .from('images')
            .upload(filePath, file);

          if (error) {
            console.error('Upload error:', error);
            urls.push('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400');
          } else {
            const { data: publicUrl } = supabase.storage
              .from('images')
              .getPublicUrl(filePath);
            urls.push(publicUrl.publicUrl);
          }
        } catch (err) {
          urls.push('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400');
        }

        if (onProgress) {
          onProgress(Math.round(((i + 1) / totalFiles) * 100));
        }
      }
      
      return urls;
    }
  },

  bookings: {
    getAll: async (): Promise<(Booking & { user?: User; room?: Room })[]> => {
      if (!isSupabaseConfigured()) return MOCK_BOOKINGS;
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            user:users(*),
            room:rooms(*)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(b => ({
          ...b,
          total_price: Number(b.total_price),
          user: b.user ? { ...b.user, total_spent: Number(b.user.total_spent || 0) } : undefined,
          room: b.room ? { ...b.room, price: Number(b.room.price), amenities: b.room.amenities || [], images: b.room.images || [] } : undefined
        })) as (Booking & { user?: User; room?: Room })[];
      } catch (err) {
        console.error('[v0] Error fetching bookings:', err);
        return MOCK_BOOKINGS;
      }
    },

    updateStatus: async (id: string, status: string) => {
      if (!isSupabaseConfigured()) return { error: { message: 'Demo mode - cannot update bookings' } };
      try {
        const { error } = await supabase
          .from('bookings')
          .update({ booking_status: status })
          .eq('id', id);
        return { error };
      } catch (err: any) {
        return { error: { message: err.message || 'Failed to update booking' } };
      }
    },

    getRecent: async (limit: number): Promise<(Booking & { user?: User; room?: Room })[]> => {
      if (!isSupabaseConfigured()) return MOCK_BOOKINGS.slice(0, limit);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            user:users(*),
            room:rooms(*)
          `)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return (data || []).map(b => ({
          ...b,
          total_price: Number(b.total_price),
          user: b.user ? { ...b.user, total_spent: Number(b.user.total_spent || 0) } : undefined,
          room: b.room ? { ...b.room, price: Number(b.room.price), amenities: b.room.amenities || [], images: b.room.images || [] } : undefined
        })) as (Booking & { user?: User; room?: Room })[];
      } catch (err) {
        console.error('[v0] Error fetching recent bookings:', err);
        return MOCK_BOOKINGS.slice(0, limit);
      }
    }
  },

  users: {
    getAll: async (): Promise<User[]> => {
      if (!isSupabaseConfigured()) return MOCK_USERS;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'client')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(u => ({
          ...u,
          total_spent: Number(u.total_spent || 0)
        })) as User[];
      } catch (err) {
        console.error('[v0] Error fetching users:', err);
        return MOCK_USERS;
      }
    },

    updateStatus: async (id: string, status: 'Active' | 'Blocked') => {
      if (!isSupabaseConfigured()) return { error: { message: 'Demo mode - cannot update users' } };
      try {
        const { error } = await supabase
          .from('users')
          .update({ status })
          .eq('id', id);
        return { error };
      } catch (err: any) {
        return { error: { message: err.message || 'Failed to update user' } };
      }
    },

    delete: async (id: string) => {
      if (!isSupabaseConfigured()) return { error: { message: 'Demo mode - cannot delete users' } };
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', id);
        return { error };
      } catch (err: any) {
        return { error: { message: err.message || 'Failed to delete user' } };
      }
    }
  },

  payments: {
    getAll: async (): Promise<(Payment & { user?: User; room?: Room })[]> => {
      if (!isSupabaseConfigured()) return MOCK_PAYMENTS;
      try {
        const { data, error } = await supabase
          .from('payments')
          .select(`
            *,
            user:users(*),
            room:rooms(*)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(p => ({
          ...p,
          amount: Number(p.amount),
          user: p.user ? { ...p.user, total_spent: Number(p.user.total_spent || 0) } : undefined,
          room: p.room ? { ...p.room, price: Number(p.room.price), amenities: p.room.amenities || [], images: p.room.images || [] } : undefined
        })) as (Payment & { user?: User; room?: Room })[];
      } catch (err) {
        console.error('[v0] Error fetching payments:', err);
        return MOCK_PAYMENTS;
      }
    },

    refund: async (id: string) => {
      if (!isSupabaseConfigured()) return { error: { message: 'Demo mode - cannot refund payments' } };
      try {
        const { error } = await supabase
          .from('payments')
          .update({ payment_status: 'Refunded' })
          .eq('id', id);
        return { error };
      } catch (err: any) {
        return { error: { message: err.message || 'Failed to refund payment' } };
      }
    }
  },

  stats: {
    getDashboard: async (): Promise<DashboardStats> => {
      // Default/fallback stats
      const defaultStats: DashboardStats = {
        totalRevenue: 3000,
        monthlyRevenue: 3000,
        activeBookings: 2,
        pendingPayments: 18000,
        failedPaymentsCount: 1,
        availableRooms: 2,
        totalRooms: 3,
        totalUsers: 4,
        revenueByMonth: [
          { month: 'Jul', amount: 35000 },
          { month: 'Aug', amount: 42000 },
          { month: 'Sep', amount: 38000 },
          { month: 'Oct', amount: 55000 },
          { month: 'Nov', amount: 48000 },
          { month: 'Dec', amount: 62000 }
        ],
        bookingTrends: [
          { day: 'Mon', count: 15 },
          { day: 'Tue', count: 22 },
          { day: 'Wed', count: 18 },
          { day: 'Thu', count: 25 },
          { day: 'Fri', count: 30 },
          { day: 'Sat', count: 35 },
          { day: 'Sun', count: 28 }
        ]
      };

      if (!isSupabaseConfigured()) return defaultStats;

      try {
        // Get total revenue
        const { data: paidPayments } = await supabase
          .from('payments')
          .select('amount')
          .eq('payment_status', 'Paid');
        const totalRevenue = paidPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        // Get monthly revenue (current month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { data: monthlyPayments } = await supabase
          .from('payments')
          .select('amount')
          .eq('payment_status', 'Paid')
          .gte('created_at', startOfMonth.toISOString());
        const monthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        // Get active bookings count
        const { count: activeBookings } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .in('booking_status', ['Pending', 'Approved']);

        // Get pending payments total
        const { data: pendingPaymentsData } = await supabase
          .from('payments')
          .select('amount')
          .eq('payment_status', 'Pending');
        const pendingPayments = pendingPaymentsData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        // Get failed payments count
        const { count: failedPaymentsCount } = await supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('payment_status', 'Failed');

        // Get room counts
        const { count: totalRooms } = await supabase
          .from('rooms')
          .select('*', { count: 'exact', head: true });

        const { count: availableRooms } = await supabase
          .from('rooms')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Available');

        // Get total users count
        const { count: totalUsers } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'client');

        return {
          totalRevenue,
          monthlyRevenue,
          activeBookings: activeBookings || 0,
          pendingPayments,
          failedPaymentsCount: failedPaymentsCount || 0,
          availableRooms: availableRooms || 0,
          totalRooms: totalRooms || 0,
          totalUsers: totalUsers || 0,
          revenueByMonth: defaultStats.revenueByMonth,
          bookingTrends: defaultStats.bookingTrends
        };
      } catch (err) {
        console.error('[v0] Error fetching dashboard stats:', err);
        return defaultStats;
      }
    }
  }
};
