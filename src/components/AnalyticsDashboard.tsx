import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react';

interface AnalyticsData {
  stats: {
    revenue: number;
    orders: number;
    products: number;
    users: number;
  };
  recentOrders: {
    id: number;
    user_id: number;
    user_name: string;
    total: number;
    status: string;
    created_at: string;
  }[];
  salesByCategory: {
    category: string;
    value: number;
  }[];
  salesOverTime: {
    date: string;
    amount: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const data: AnalyticsData = await res.json();
      setAnalyticsData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
        Loading analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
        No analytics data available.
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-10">Analytics Terminal</h3>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard icon={<DollarSign size={24} />} title="Total Revenue" value={`৳${analyticsData.stats.revenue.toFixed(2)}`} />
        <StatCard icon={<ShoppingBag size={24} />} title="Total Orders" value={analyticsData.stats.orders.toString()} />
        <StatCard icon={<Package size={24} />} title="Total Products" value={analyticsData.stats.products.toString()} />
        <StatCard icon={<Users size={24} />} title="Total Users" value={analyticsData.stats.users.toString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Sales Over Time Chart */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700">
          <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Sales Over Last 7 Days</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.salesOverTime}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.1)' }} contentStyle={{ backgroundColor: '#334155', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="amount" fill="#b8860b" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Category Chart */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700">
          <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Sales by Category</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.salesByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.salesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#334155', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} />
              <Legend wrapperStyle={{ color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700">
        <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Recent Orders</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Order ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {analyticsData.recentOrders.map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{order.user_name || 'Guest'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">৳{order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'approved' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-4">
    <div className="p-4 bg-[#b8860b]/10 rounded-full text-[#b8860b]">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);
