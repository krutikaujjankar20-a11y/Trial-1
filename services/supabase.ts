
import { Room, User, Booking, Payment } from '../types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- MOCK DATA ---

const mockUsers: User[] = [
  { id: 'u1', full_name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 9876543210', role: 'client', status: 'Active', created_at: '2023-01-15', total_bookings: 12, total_spent: 45000 },
  { id: 'u2', full_name: 'Anjali Gupta', email: 'anjali@example.com', phone: '+91 9123456789', role: 'client', status: 'Active', created_at: '2023-03-20', total_bookings: 5, total_spent: 18500 },
  { id: 'u3', full_name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 8888877777', role: 'client', status: 'Blocked', created_at: '2023-06-10', total_bookings: 2, total_spent: 3200 },
  { id: 'u4', full_name: 'Priya Patel', email: 'priya@example.com', phone: '+91 7777766666', role: 'client', status: 'Active', created_at: '2023-08-05', total_bookings: 8, total_spent: 22000 },
];

const mockRooms: Room[] = [
  { id: 'r1', roomname: 'Superior Room 101', roomtype: 'Single', price: 1500, capacity: 1, status: 'Available', amenities: ['WiFi', 'AC', 'TV'], images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304'] },
  { id: 'r2', roomname: 'Luxury Suite 202', roomtype: 'Suite', price: 4500, capacity: 2, status: 'Booked', amenities: ['WiFi', 'AC', 'TV', 'Mini Bar'], images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427'] },
  { id: 'r3', roomname: 'Deluxe King 305', roomtype: 'Deluxe', price: 3200, capacity: 3, status: 'Available', amenities: ['WiFi', 'AC'], images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a'] },
];

let bookingsList: Booking[] = [
  { id: 'b1', user_id: 'u1', room_id: 'r1', check_in: '2023-11-20', check_out: '2023-11-22', total_price: 3000, booking_status: 'Approved', payment_status: 'Paid', created_at: '2023-11-15' },
  { id: 'b2', user_id: 'u2', room_id: 'r2', check_in: '2023-11-21', check_out: '2023-11-25', total_price: 18000, booking_status: 'Pending', payment_status: 'Pending', created_at: '2023-11-16' },
  { id: 'b3', user_id: 'u4', room_id: 'r3', check_in: '2023-12-01', check_out: '2023-12-05', total_price: 12800, booking_status: 'Cancelled', payment_status: 'Failed', created_at: '2023-11-18' },
];

let paymentsList: Payment[] = [
  { id: 'p1', booking_id: 'b1', user_id: 'u1', room_id: 'r1', amount: 3000, transaction_id: 'TXN882211', payment_status: 'Paid', payment_method: 'Card', created_at: '2023-11-15' },
  { id: 'p2', booking_id: 'b2', user_id: 'u2', room_id: 'r2', amount: 18000, transaction_id: 'TXN993344', payment_status: 'Pending', payment_method: 'UPI', created_at: '2023-11-16' },
  { id: 'p3', booking_id: 'b3', user_id: 'u4', room_id: 'r3', amount: 12800, transaction_id: 'TXN112233', payment_status: 'Failed', payment_method: 'UPI', created_at: '2023-11-18' },
];

// --- SERVICE IMPLEMENTATION ---

export const mockSupabase = {
  auth: {
    signIn: async (email: string, password?: string) => {
      await sleep(1000);
      return { data: { user: { id: 'admin1', email, full_name: 'Admin User', role: 'admin' } }, error: null };
    }
  },

  rooms: {
    getAll: async () => { await sleep(500); return [...mockRooms]; },
    getCount: async () => mockRooms.length,
    getAvailableCount: async () => mockRooms.filter(r => r.status === 'Available').length,
    create: async (room: any) => { await sleep(500); return { data: { ...room, id: 'r'+Math.random() }, error: null }; },
    update: async (id: string, updates: any) => { await sleep(500); return { data: updates, error: null }; },
    delete: async (id: string) => { await sleep(500); return { error: null }; },
    // Fix: Added optional onProgress callback to match usage in Rooms.tsx and prevent argument count mismatch error
    uploadImages: async (files: File[], onProgress?: (progress: number) => void) => {
      if (onProgress) {
        onProgress(30); await sleep(300);
        onProgress(60); await sleep(300);
        onProgress(100); await sleep(200);
      } else {
        await sleep(1000);
      }
      return files.map(() => 'https://via.placeholder.com/400');
    }
  },

  bookings: {
    getAll: async () => {
      await sleep(800);
      return bookingsList.map(b => ({
        ...b,
        user: mockUsers.find(u => u.id === b.user_id),
        room: mockRooms.find(r => r.id === b.room_id)
      }));
    },
    updateStatus: async (id: string, status: string) => {
      await sleep(500);
      bookingsList = bookingsList.map(b => b.id === id ? { ...b, booking_status: status as any } : b);
      return { error: null };
    },
    getRecent: async (limit: number) => {
      const all = await mockSupabase.bookings.getAll();
      return all.slice(0, limit);
    }
  },

  users: {
    getAll: async () => {
      await sleep(800);
      return [...mockUsers];
    },
    updateStatus: async (id: string, status: 'Active' | 'Blocked') => {
      await sleep(500);
      return { error: null };
    },
    delete: async (id: string) => {
      await sleep(500);
      return { error: null };
    }
  },

  payments: {
    getAll: async () => {
      await sleep(800);
      return paymentsList.map(p => ({
        ...p,
        user: mockUsers.find(u => u.id === p.user_id),
        room: mockRooms.find(r => r.id === p.room_id)
      }));
    },
    refund: async (id: string) => {
      await sleep(800);
      paymentsList = paymentsList.map(p => p.id === id ? { ...p, payment_status: 'Refunded' } : p);
      return { error: null };
    }
  },

  stats: {
    getDashboard: async () => {
      await sleep(1000);
      return {
        totalRevenue: 845200,
        monthlyRevenue: 124500,
        activeBookings: 128,
        pendingPayments: 45000,
        failedPaymentsCount: 5,
        availableRooms: 12,
        totalRooms: 45,
        totalUsers: 450,
        revenueByMonth: [
          { month: 'Jul', amount: 45000 }, { month: 'Aug', amount: 32000 },
          { month: 'Sep', amount: 28000 }, { month: 'Oct', amount: 55000 },
          { month: 'Nov', amount: 72000 }, { month: 'Dec', amount: 84000 },
        ],
        bookingTrends: [
          { day: 'Mon', count: 12 }, { day: 'Tue', count: 19 },
          { day: 'Wed', count: 15 }, { day: 'Thu', count: 22 },
          { day: 'Fri', count: 30 }, { day: 'Sat', count: 35 },
          { day: 'Sun', count: 28 },
        ]
      };
    }
  }
};
