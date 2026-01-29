import { createClient } from '@supabase/supabase-js';
import { Room, User, Booking, Payment, DashboardStats } from '../types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- SERVICE IMPLEMENTATION ---

export const mockSupabase = {
  auth: {
    signIn: async (email: string, password?: string) => {
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
    }
  },

  rooms: {
    getAll: async (): Promise<Room[]> => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },

    getCount: async (): Promise<number> => {
      const { count } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },

    getAvailableCount: async (): Promise<number> => {
      const { count } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Available');
      return count || 0;
    },

    create: async (room: Omit<Room, 'id'>) => {
      const { data, error } = await supabase
        .from('rooms')
        .insert([room])
        .select()
        .single();
      return { data, error };
    },

    update: async (id: string, updates: Partial<Room>) => {
      const { data, error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);
      return { error };
    },

    uploadImages: async (files: File[], onProgress?: (progress: number) => void): Promise<string[]> => {
      const urls: string[] = [];
      const totalFiles = files.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `room-images/${fileName}`;

        const { error } = await supabase.storage
          .from('images')
          .upload(filePath, file);

        if (error) {
          console.error('Upload error:', error);
          // Use a placeholder if upload fails
          urls.push('https://via.placeholder.com/400');
        } else {
          const { data: publicUrl } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);
          urls.push(publicUrl.publicUrl);
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
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user:users(*),
          room:rooms(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    updateStatus: async (id: string, status: string) => {
      const { error } = await supabase
        .from('bookings')
        .update({ booking_status: status })
        .eq('id', id);
      return { error };
    },

    getRecent: async (limit: number): Promise<(Booking & { user?: User; room?: Room })[]> => {
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
      return data || [];
    }
  },

  users: {
    getAll: async (): Promise<User[]> => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    updateStatus: async (id: string, status: 'Active' | 'Blocked') => {
      const { error } = await supabase
        .from('users')
        .update({ status })
        .eq('id', id);
      return { error };
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      return { error };
    }
  },

  payments: {
    getAll: async (): Promise<(Payment & { user?: User; room?: Room })[]> => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          user:users(*),
          room:rooms(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    refund: async (id: string) => {
      const { error } = await supabase
        .from('payments')
        .update({ payment_status: 'Refunded' })
        .eq('id', id);
      return { error };
    }
  },

  stats: {
    getDashboard: async (): Promise<DashboardStats> => {
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

      // Generate revenue by month (last 6 months)
      const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const revenueByMonth = months.map((month, i) => ({
        month,
        amount: Math.floor(Math.random() * 50000) + 25000 // Placeholder - replace with real aggregation
      }));

      // Generate booking trends (by day of week)
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const bookingTrends = days.map(day => ({
        day,
        count: Math.floor(Math.random() * 30) + 10 // Placeholder - replace with real aggregation
      }));

      return {
        totalRevenue,
        monthlyRevenue,
        activeBookings: activeBookings || 0,
        pendingPayments,
        failedPaymentsCount: failedPaymentsCount || 0,
        availableRooms: availableRooms || 0,
        totalRooms: totalRooms || 0,
        totalUsers: totalUsers || 0,
        revenueByMonth,
        bookingTrends
      };
    }
  }
};
