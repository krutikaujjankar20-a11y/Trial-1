
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'staff' | 'client';
  status: 'Active' | 'Blocked';
  avatar_url?: string;
  created_at: string;
  total_bookings?: number;
  total_spent?: number;
}

export interface Room {
  id: string;
  roomname: string;
  roomtype: 'Single' | 'Double' | 'Suite' | 'Deluxe';
  price: number;
  capacity: number;
  status: 'Available' | 'Booked' | 'Maintenance';
  amenities: string[];
  images: string[];
  created_at?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  booking_status: 'Pending' | 'Approved' | 'Cancelled' | 'Completed';
  payment_status: 'Pending' | 'Paid' | 'Failed';
  created_at: string;
  // Joined data
  user?: User;
  room?: Room;
}

export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  room_id: string;
  amount: number;
  transaction_id: string;
  payment_status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  payment_method: 'UPI' | 'Card' | 'Cash' | 'Net Banking';
  created_at: string;
  // Joined data
  user?: User;
  room?: Room;
}

export interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  activeBookings: number;
  pendingPayments: number;
  failedPaymentsCount: number;
  availableRooms: number;
  totalRooms: number;
  totalUsers: number;
  revenueByMonth: { month: string; amount: number }[];
  bookingTrends: { day: string; count: number }[];
}

export interface AppConfig {
  siteTitle: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl: string;
  faviconUrl: string;
  themeColor: string;
  footerText: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: string;
  isRead: boolean;
}
