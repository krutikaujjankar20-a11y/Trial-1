
import React from 'react';

export const ADMIN_BASE_PATH = '/1234/admin';

export const NAV_ITEMS = [
  { label: 'Dashboard', path: `${ADMIN_BASE_PATH}/dashboard`, icon: '📊' },
  { label: 'Rooms', path: `${ADMIN_BASE_PATH}/rooms`, icon: '🏨' },
  { label: 'Bookings', path: `${ADMIN_BASE_PATH}/bookings`, icon: '📅' },
  { label: 'Users', path: `${ADMIN_BASE_PATH}/users`, icon: '👥' },
  { label: 'Payments', path: `${ADMIN_BASE_PATH}/payments`, icon: '💰' },
  { label: 'Settings', path: `${ADMIN_BASE_PATH}/settings`, icon: '⚙️' },
];

export const ROOM_TYPES = ['Single', 'Double', 'Suite', 'Deluxe'];
export const ROOM_STATUSES = ['Available', 'Booked', 'Maintenance'];
export const AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: '📶' },
  { id: 'ac', label: 'AC', icon: '❄️' },
  { id: 'tv', label: 'TV', icon: '📺' },
  { id: 'minibar', label: 'Mini Bar', icon: '🍷' },
  { id: 'roomservice', label: 'Room Service', icon: '🍽️' },
  { id: 'parking', label: 'Parking', icon: '🚗' },
  { id: 'pool', label: 'Pool', icon: '🏊' },
];
