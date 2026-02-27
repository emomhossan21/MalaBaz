import React, { useState, useEffect } from 'react';
import { Download, Mail } from 'lucide-react';

export default function SubscribersManager() {
  const [subscribers, setSubscribers] = useState<any[]>([]);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    const res = await fetch('/api/admin/subscribers');
    if (res.ok) setSubscribers(await res.json());
  };

  const downloadCSV = () => {
    const headers = ['ID', 'Email', 'Subscribed At'];
    const csvContent = [
      headers.join(','),
      ...subscribers.map(s => `${s.id},${s.email},${new Date(s.created_at).toLocaleString()}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'malabaz_subscribers.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black dark:text-white mb-2">Newsletter Subscribers</h2>
          <p className="text-slate-500">Manage your email list ({subscribers.length} total)</p>
        </div>
        <button 
          onClick={downloadCSV}
          disabled={subscribers.length === 0}
          className="bg-[#b8860b] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#9a700a] transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Download size={20} /> Download CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Email</th>
              <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Subscribed Date</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map(sub => (
              <tr key={sub.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-4 font-medium dark:text-white flex items-center gap-3">
                  <Mail size={16} className="text-slate-400" /> {sub.email}
                </td>
                <td className="p-4 text-slate-500">{new Date(sub.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={2} className="p-8 text-center text-slate-500">No subscribers yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
