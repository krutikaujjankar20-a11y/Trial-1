-- Dost Admin Panel - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'staff', 'client')),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Blocked')),
  avatar_url TEXT,
  total_bookings INTEGER DEFAULT 0,
  total_spent NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROOMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roomname TEXT NOT NULL,
  roomtype TEXT NOT NULL CHECK (roomtype IN ('Single', 'Double', 'Suite', 'Deluxe')),
  price NUMERIC(10, 2) NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Booked', 'Maintenance')),
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  booking_status TEXT NOT NULL DEFAULT 'Pending' CHECK (booking_status IN ('Pending', 'Approved', 'Cancelled', 'Completed')),
  payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  transaction_id TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('UPI', 'Card', 'Cash', 'Net Banking')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR BETTER PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_roomtype ON rooms(roomtype);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- ============================================
-- SAMPLE DATA (Optional - Remove in production)
-- ============================================

-- Insert sample users
INSERT INTO users (id, full_name, email, phone, role, status, total_bookings, total_spent) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Rahul Sharma', 'rahul@example.com', '+91 9876543210', 'client', 'Active', 12, 45000),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Anjali Gupta', 'anjali@example.com', '+91 9123456789', 'client', 'Active', 5, 18500),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Vikram Singh', 'vikram@example.com', '+91 8888877777', 'client', 'Blocked', 2, 3200),
  ('d4e5f6a7-b8c9-0123-def0-234567890123', 'Priya Patel', 'priya@example.com', '+91 7777766666', 'client', 'Active', 8, 22000),
  ('e5f6a7b8-c9d0-1234-ef01-345678901234', 'Admin User', 'admin@dostapp.com', '+91 9999900000', 'admin', 'Active', 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Insert sample rooms
INSERT INTO rooms (id, roomname, roomtype, price, capacity, status, amenities, images) VALUES
  ('f6a7b8c9-d0e1-2345-f012-456789012345', 'Superior Room 101', 'Single', 1500, 1, 'Available', ARRAY['WiFi', 'AC', 'TV'], ARRAY['https://images.unsplash.com/photo-1631049307264-da0ec9d70304']),
  ('a7b8c9d0-e1f2-3456-0123-567890123456', 'Luxury Suite 202', 'Suite', 4500, 2, 'Booked', ARRAY['WiFi', 'AC', 'TV', 'Mini Bar'], ARRAY['https://images.unsplash.com/photo-1590490360182-c33d57733427']),
  ('b8c9d0e1-f2a3-4567-1234-678901234567', 'Deluxe King 305', 'Deluxe', 3200, 3, 'Available', ARRAY['WiFi', 'AC'], ARRAY['https://images.unsplash.com/photo-1566665797739-1674de7a421a'])
ON CONFLICT (id) DO NOTHING;

-- Insert sample bookings
INSERT INTO bookings (id, user_id, room_id, check_in, check_out, total_price, booking_status, payment_status) VALUES
  ('c9d0e1f2-a3b4-5678-2345-789012345678', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f6a7b8c9-d0e1-2345-f012-456789012345', '2023-11-20', '2023-11-22', 3000, 'Approved', 'Paid'),
  ('d0e1f2a3-b4c5-6789-3456-890123456789', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'a7b8c9d0-e1f2-3456-0123-567890123456', '2023-11-21', '2023-11-25', 18000, 'Pending', 'Pending'),
  ('e1f2a3b4-c5d6-7890-4567-901234567890', 'd4e5f6a7-b8c9-0123-def0-234567890123', 'b8c9d0e1-f2a3-4567-1234-678901234567', '2023-12-01', '2023-12-05', 12800, 'Cancelled', 'Failed')
ON CONFLICT (id) DO NOTHING;

-- Insert sample payments
INSERT INTO payments (id, booking_id, user_id, room_id, amount, transaction_id, payment_status, payment_method) VALUES
  ('f2a3b4c5-d6e7-8901-5678-012345678901', 'c9d0e1f2-a3b4-5678-2345-789012345678', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f6a7b8c9-d0e1-2345-f012-456789012345', 3000, 'TXN882211', 'Paid', 'Card'),
  ('a3b4c5d6-e7f8-9012-6789-123456789012', 'd0e1f2a3-b4c5-6789-3456-890123456789', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'a7b8c9d0-e1f2-3456-0123-567890123456', 18000, 'TXN993344', 'Pending', 'UPI'),
  ('b4c5d6e7-f8a9-0123-7890-234567890123', 'e1f2a3b4-c5d6-7890-4567-901234567890', 'd4e5f6a7-b8c9-0123-def0-234567890123', 'b8c9d0e1-f2a3-4567-1234-678901234567', 12800, 'TXN112233', 'Failed', 'UPI')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VIEW FOR DASHBOARD STATISTICS
-- ============================================
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'Paid') AS total_revenue,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'Paid' AND created_at >= DATE_TRUNC('month', CURRENT_DATE)) AS monthly_revenue,
  (SELECT COUNT(*) FROM bookings WHERE booking_status IN ('Pending', 'Approved')) AS active_bookings,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'Pending') AS pending_payments,
  (SELECT COUNT(*) FROM payments WHERE payment_status = 'Failed') AS failed_payments_count,
  (SELECT COUNT(*) FROM rooms WHERE status = 'Available') AS available_rooms,
  (SELECT COUNT(*) FROM rooms) AS total_rooms,
  (SELECT COUNT(*) FROM users WHERE role = 'client') AS total_users;
