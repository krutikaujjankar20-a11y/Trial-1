
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockSupabase } from '../services/supabase';
import { Card, Badge, Button, Input, Select, Modal } from '../components/common/UI';
import { User } from '../types';

export default function Users() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: mockSupabase.users.getAll
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'Active' | 'Blocked' }) => 
      mockSupabase.users.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSelectedUser(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mockSupabase.users.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSelectedUser(null);
    }
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const matchesSearch = u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (u.phone && u.phone.includes(searchTerm));
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">User Management</h1>
          <p className="text-gray-500">Monitor client activity and account statuses</p>
        </div>
        <Button onClick={() => alert('Invite feature coming soon!')}>+ Invite New Admin</Button>
      </div>

      <Card className="flex flex-col lg:flex-row gap-4 items-center bg-white border-none shadow-sm p-4">
        <div className="w-full lg:flex-1 relative">
          <Input 
            placeholder="Search by name, email, or phone..." 
            className="pl-10 h-11" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
        </div>
        <div className="w-full lg:w-48">
          <Select 
            options={['All', 'Active', 'Blocked']} 
            className="h-11" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Filter by Status"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse"></div>)
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400">No users matched your search.</div>
        ) : (
          filteredUsers.map(u => (
            <Card key={u.id} className="relative group border-none shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                  {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full rounded-2xl object-cover" /> : u.full_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-dark text-lg">{u.full_name}</h3>
                  <p className="text-xs text-gray-500">{u.email}</p>
                  <p className="text-xs text-gray-400 mt-1">{u.phone || 'No phone provided'}</p>
                </div>
                <Badge color={u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {u.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-50">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Bookings</p>
                  <p className="font-bold text-dark">{u.total_bookings}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total Spent</p>
                  <p className="font-bold text-dark">₹{u.total_spent?.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                 <Button variant="ghost" className="flex-1 text-sm border bg-gray-50" onClick={() => setSelectedUser(u)}>View Profile</Button>
                 <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">⋮</button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Profile">
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                 {selectedUser.avatar_url ? <img src={selectedUser.avatar_url} className="w-full h-full rounded-2xl object-cover" /> : selectedUser.full_name.charAt(0)}
               </div>
               <div>
                  <h3 className="text-xl font-bold">{selectedUser.full_name}</h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  <p className="text-xs text-gray-400 mt-1">Joined on {selectedUser.created_at}</p>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
               <div className="bg-gray-50 p-3 rounded-xl text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Bookings</p>
                  <p className="font-bold text-lg">{selectedUser.total_bookings}</p>
               </div>
               <div className="bg-gray-50 p-3 rounded-xl text-center col-span-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Lifetime Value</p>
                  <p className="font-bold text-lg">₹{selectedUser.total_spent?.toLocaleString()}</p>
               </div>
            </div>

            <div className="space-y-3">
               <h4 className="text-sm font-bold border-b pb-2">Account Actions</h4>
               <div className="flex gap-3">
                  {selectedUser.status === 'Active' ? (
                    <Button variant="secondary" className="flex-1 bg-red-50 text-red-600 border-red-100" onClick={() => updateStatusMutation.mutate({ id: selectedUser.id, status: 'Blocked' })} isLoading={updateStatusMutation.isPending}>
                      Block User
                    </Button>
                  ) : (
                    <Button variant="primary" className="flex-1" onClick={() => updateStatusMutation.mutate({ id: selectedUser.id, status: 'Active' })} isLoading={updateStatusMutation.isPending}>
                      Unblock User
                    </Button>
                  )}
                  <Button variant="danger" className="flex-1" onClick={() => { if(confirm('Are you sure?')) deleteMutation.mutate(selectedUser.id); }} isLoading={deleteMutation.isPending}>
                    Delete Account
                  </Button>
               </div>
            </div>

            <Button variant="ghost" className="w-full" onClick={() => setSelectedUser(null)}>Done</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
