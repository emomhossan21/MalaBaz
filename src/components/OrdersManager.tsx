import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, Clock, Truck, Printer } from 'lucide-react';
import ShippingLabelModal from './ShippingLabelModal';

export default function OrdersManager({ adminUser }: { adminUser: { id: number, name: string, email: string } | null }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [printingOrder, setPrintingOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminName: adminUser?.name })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status, updated_by: adminUser?.name } : o));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 dark:text-white">Loading orders...</div>;
  }

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'cod') return order.payment_method === 'cod';
    if (activeTab === 'bkash') return order.payment_method === 'bkash';
    if (activeTab === 'nagad') return order.payment_method === 'nagad';
    if (activeTab === 'rocket') return order.payment_method === 'rocket';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h4 className="text-3xl font-black dark:text-white">Order Management</h4>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'cod', 'bkash', 'nagad', 'rocket'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {tab === 'all' ? 'All Orders' : tab === 'cod' ? 'Cash on Delivery' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Customer</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Total</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Package size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No orders found.</p>
                  </td>
                </tr>
              )}
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold dark:text-white">#{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="dark:text-white font-medium">{order.user_name || 'Guest'}</div>
                    <div className="text-xs text-slate-500">{order.shipping_address}, {order.city} - {order.zip_code}</div>
                    {order.payment_method && (
                      <div className="text-xs mt-1">
                        <span className="font-bold uppercase text-slate-700 dark:text-slate-300">{order.payment_method}</span>
                        {order.payment_method !== 'cod' && (
                          <div className="text-slate-500 mt-0.5">
                            {order.payment_phone && <span>Phone: {order.payment_phone}</span>}
                            {order.transaction_id && <span className="ml-2">TrxID: {order.transaction_id}</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-bold dark:text-white">৳{order.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1 ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'approved' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {order.status === 'pending' && <Clock size={12} />}
                      {order.status === 'approved' && <CheckCircle size={12} />}
                      {order.status === 'delivered' && <Truck size={12} />}
                      {order.status === 'cancelled' && <XCircle size={12} />}
                      {order.status || 'pending'}
                    </span>
                    {order.updated_by && (
                      <div className="text-[10px] text-slate-500 mt-1">
                        Updated by: <span className="font-semibold">{order.updated_by}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {order.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'approved')}
                            className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                            title="Approve Order"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Cancel Order"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      {order.status === 'approved' && (
                        <>
                          <button 
                            onClick={() => setPrintingOrder(order)}
                            className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Print Label"
                          >
                            <Printer size={18} />
                          </button>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Mark as Delivered"
                          >
                            <Truck size={18} />
                          </button>
                        </>
                      )}
                      {order.status === 'delivered' && (
                        <button 
                          onClick={() => setPrintingOrder(order)}
                          className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                          title="Print Label"
                        >
                          <Printer size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {printingOrder && (
        <ShippingLabelModal order={printingOrder} onClose={() => setPrintingOrder(null)} />
      )}
    </div>
  );
}
