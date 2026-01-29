
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockSupabase } from '../services/supabase';
import { Card, Badge, Button, Input, Select, Modal } from '../components/common/UI';
import { Booking } from '../types';

export default function Bookings() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: mockSupabase.bookings.getAll
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      mockSupabase.bookings.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setSelectedBooking(null);
    }
  });

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter(b => {
      const matchesSearch = b.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            b.room?.roomname.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || b.booking_status === statusFilter;
      const matchesPayment = paymentFilter === 'All' || b.payment_status === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [bookings, searchTerm, statusFilter, paymentFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return <Badge color="bg-green-100 text-green-700">Approved</Badge>;
      case 'Pending': return <Badge color="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'Cancelled': return <Badge color="bg-red-100 text-red-700">Cancelled</Badge>;
      case 'Completed': return <Badge color="bg-blue-100 text-blue-700">Completed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'Paid': return <Badge color="bg-green-100 text-green-700">Paid</Badge>;
      case 'Pending': return <Badge color="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'Failed': return <Badge color="bg-red-100 text-red-700">Failed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleExport = () => {
    const csvRows = [
      ['ID', 'Guest', 'Room', 'Check-in', 'Check-out', 'Amount', 'Status', 'Payment'],
      ...filteredBookings.map(b => [
        b.id, b.user?.full_name, b.room?.roomname, b.check_in, b.check_out, b.total_price, b.booking_status, b.payment_status
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bookings_export.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Bookings</h1>
          <p className="text-gray-500">Manage guest reservations and check-in statuses</p>
        </div>
        <Button variant="secondary" onClick={handleExport} className="border bg-white">
          📤 Export CSV
        </Button>
      </div>

      <Card className="flex flex-col lg:flex-row gap-4 items-center bg-white border-none shadow-sm p-4">
        <div className="w-full lg:flex-1 relative">
          <Input 
            placeholder="Search by guest or room name..." 
            className="pl-10 h-11" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <Select 
            options={['All', 'Pending', 'Approved', 'Cancelled', 'Completed']} 
            className="h-11 min-w-[140px]" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Booking Status"
          />
          <Select 
            options={['All', 'Paid', 'Pending', 'Failed']} 
            className="h-11 min-w-[140px]" 
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            label="Payment Status"
          />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden border-none shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
              <tr>
                <th className="px-6 py-4">Guest Info</th>
                <th className="px-6 py-4">Room Name</th>
                <th className="px-6 py-4">Stay Dates</th>
                <th className="px-6 py-4">Booking Status</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={6} className="h-16 bg-gray-50/20"></td></tr>)
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-gray-400">No bookings found for the selected criteria.</td></tr>
              ) : (
                filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-dark">{b.user?.full_name}</div>
                      <div className="text-xs text-gray-400">{b.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{b.room?.roomname}</div>
                      <Badge color="bg-gray-100 text-gray-500">{b.room?.roomtype}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold">{b.check_in}</div>
                      <div className="text-[10px] text-gray-400">to {b.check_out}</div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(b.booking_status)}</td>
                    <td className="px-6 py-4">{getPaymentBadge(b.payment_status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" className="text-sm text-primary" onClick={() => setSelectedBooking(b)}>
                        Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={!!selectedBooking} 
        onClose={() => setSelectedBooking(null)} 
        title="Booking Details"
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
               <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Booking ID</p>
                  <p className="font-mono text-sm">#{selectedBooking.id}</p>
               </div>
               <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-bold">Created On</p>
                  <p className="text-sm">{selectedBooking.created_at}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div>
                  <h4 className="text-sm font-bold mb-2">Guest Info</h4>
                  <p className="text-sm font-semibold">{selectedBooking.user?.full_name}</p>
                  <p className="text-xs text-gray-500">{selectedBooking.user?.email}</p>
                  <p className="text-xs text-gray-500">{selectedBooking.user?.phone}</p>
               </div>
               <div>
                  <h4 className="text-sm font-bold mb-2">Room Info</h4>
                  <p className="text-sm font-semibold">{selectedBooking.room?.roomname}</p>
                  <p className="text-xs text-gray-500">{selectedBooking.room?.roomtype}</p>
                  <p className="text-sm font-bold text-primary mt-1">₹{selectedBooking.total_price.toLocaleString()}</p>
               </div>
            </div>

            <div className="p-4 border border-dashed rounded-xl space-y-2">
               <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Check-in</span>
                  <span className="font-bold">{selectedBooking.check_in}</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Check-out</span>
                  <span className="font-bold">{selectedBooking.check_out}</span>
               </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t">
               {selectedBooking.booking_status === 'Pending' && (
                 <>
                   <Button className="flex-1" onClick={() => updateStatusMutation.mutate({ id: selectedBooking.id, status: 'Approved' })} isLoading={updateStatusMutation.isPending}>
                      Approve Booking
                   </Button>
                   <Button variant="danger" className="flex-1" onClick={() => updateStatusMutation.mutate({ id: selectedBooking.id, status: 'Cancelled' })} isLoading={updateStatusMutation.isPending}>
                      Cancel
                   </Button>
                 </>
               )}
               {selectedBooking.booking_status === 'Approved' && (
                  <Button variant="danger" className="w-full" onClick={() => updateStatusMutation.mutate({ id: selectedBooking.id, status: 'Cancelled' })} isLoading={updateStatusMutation.isPending}>
                    Cancel Booking
                  </Button>
               )}
               <Button variant="ghost" className="w-full" onClick={() => setSelectedBooking(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
