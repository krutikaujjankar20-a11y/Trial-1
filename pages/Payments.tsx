
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { mockSupabase } from '../services/supabase';
import { Card, Badge, Button, Input, Select, Modal } from '../components/common/UI';
import { Payment } from '../types';

export default function Payments() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: mockSupabase.payments.getAll
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: mockSupabase.stats.getDashboard
  });

  const refundMutation = useMutation({
    mutationFn: (id: string) => mockSupabase.payments.refund(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setSelectedPayment(null);
    }
  });

  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    return payments.filter(p => {
      const matchesSearch = p.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.transaction_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || p.payment_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid': return <Badge color="bg-green-100 text-green-700">Paid</Badge>;
      case 'Pending': return <Badge color="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'Failed': return <Badge color="bg-red-100 text-red-700">Failed</Badge>;
      case 'Refunded': return <Badge color="bg-gray-100 text-gray-700">Refunded</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const COLORS = ['#87CEEB', '#000000', '#F3F4F6', '#E5E7EB'];
  const pieData = [
    { name: 'UPI', value: 400 },
    { name: 'Card', value: 300 },
    { name: 'Cash', value: 100 },
    { name: 'Net Banking', value: 50 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Payments & Revenue</h1>
          <p className="text-gray-500">Track financial transactions and performance</p>
        </div>
        <Button onClick={() => alert('Download report started...')}>Download Monthly Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <Card className="bg-primary/10 border-none">
            <p className="text-xs text-dark/50 uppercase font-bold">Total Revenue</p>
            <h3 className="text-3xl font-black text-dark mt-1">₹{stats?.totalRevenue.toLocaleString()}</h3>
            <p className="text-[10px] text-green-600 font-bold mt-2">+12.5% from last month</p>
         </Card>
         <Card className="border-none shadow-sm">
            <p className="text-xs text-gray-400 uppercase font-bold">Current Month</p>
            <h3 className="text-3xl font-black text-dark mt-1">₹{stats?.monthlyRevenue.toLocaleString()}</h3>
         </Card>
         <Card className="border-none shadow-sm">
            <p className="text-xs text-gray-400 uppercase font-bold">Pending Settlements</p>
            <h3 className="text-3xl font-black text-dark mt-1">₹{stats?.pendingPayments.toLocaleString()}</h3>
         </Card>
         <Card className="border-none shadow-sm">
            <p className="text-xs text-gray-400 uppercase font-bold">Failed Count</p>
            <h3 className="text-3xl font-black text-red-500 mt-1">{stats?.failedPaymentsCount}</h3>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card title="Revenue Growth" className="lg:col-span-2 border-none shadow-sm h-96">
            <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="amount" stroke="#87CEEB" strokeWidth={3} fill="#87CEEB" fillOpacity={0.1} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </Card>
         <Card title="Payment Methods" className="border-none shadow-sm h-96">
            <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="flex flex-wrap justify-center gap-4 text-xs">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1">
                       <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                       <span className="text-gray-500 font-medium">{d.name}</span>
                    </div>
                  ))}
               </div>
            </div>
         </Card>
      </div>

      <Card className="p-0 border-none shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-gray-50">
           <h3 className="text-xl font-bold">Transaction History</h3>
           <div className="flex gap-4 w-full md:w-auto">
              <Input placeholder="TXN ID or Guest..." className="h-10 w-full md:w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Select options={['All', 'Paid', 'Pending', 'Failed', 'Refunded']} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10" />
           </div>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                 <tr>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Guest</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paymentsLoading ? (
                   [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={7} className="h-16 bg-gray-50/20"></td></tr>)
                ) : filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs">{p.transaction_id}</td>
                    <td className="px-6 py-4">
                       <div className="font-semibold">{p.user?.full_name}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-dark">₹{p.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.payment_method}</td>
                    <td className="px-6 py-4">{getStatusBadge(p.payment_status)}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">{p.created_at}</td>
                    <td className="px-6 py-4 text-right">
                       <Button variant="ghost" className="text-primary text-sm" onClick={() => setSelectedPayment(p)}>Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      </Card>

      <Modal isOpen={!!selectedPayment} onClose={() => setSelectedPayment(null)} title="Transaction Details">
         {selectedPayment && (
            <div className="space-y-6">
               <div className="text-center pb-6 border-b border-gray-100">
                  <p className="text-xs text-gray-400 uppercase font-bold">Total Payment</p>
                  <h2 className="text-4xl font-black text-dark mt-1">₹{selectedPayment.amount.toLocaleString()}</h2>
                  <div className="mt-2">{getStatusBadge(selectedPayment.payment_status)}</div>
               </div>

               <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                     <p className="text-gray-400">TXN ID</p>
                     <p className="font-mono">{selectedPayment.transaction_id}</p>
                  </div>
                  <div>
                     <p className="text-gray-400">Date</p>
                     <p>{selectedPayment.created_at}</p>
                  </div>
                  <div>
                     <p className="text-gray-400">Guest</p>
                     <p className="font-semibold">{selectedPayment.user?.full_name}</p>
                  </div>
                  <div>
                     <p className="text-gray-400">Payment Method</p>
                     <p>{selectedPayment.payment_method}</p>
                  </div>
               </div>

               <div className="pt-6 flex gap-3">
                  {selectedPayment.payment_status === 'Paid' && (
                    <Button variant="secondary" className="flex-1 bg-red-50 text-red-600 border-red-100" onClick={() => refundMutation.mutate(selectedPayment.id)} isLoading={refundMutation.isPending}>
                       Issue Refund
                    </Button>
                  )}
                  <Button className="flex-1">View Receipt</Button>
               </div>
            </div>
         )}
      </Modal>
    </div>
  );
}
