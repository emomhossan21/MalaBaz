import React, { useState, useEffect } from 'react';
import { Shield, Trash2, Plus } from 'lucide-react';

export default function AdminsManager() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    const res = await fetch('/api/admin/admins');
    if (res.ok) {
      setAdmins(await res.json());
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    if (res.ok) {
      fetchAdmins();
      setEmail('');
      setPassword('');
      setName('');
    } else {
      alert('Failed to add admin. Email might already exist.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    const res = await fetch(`/api/admin/admins/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchAdmins();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h4 className="text-3xl font-black dark:text-white">Manage Admins</h4>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 mb-8">
        <h5 className="text-xl font-bold mb-4 dark:text-white">Add New Admin</h5>
        <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            required 
            type="text" 
            placeholder="Full Name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-slate-900 dark:focus:border-white dark:text-white" 
          />
          <input 
            required 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-slate-900 dark:focus:border-white dark:text-white" 
          />
          <input 
            required 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-slate-900 dark:focus:border-white dark:text-white" 
          />
          <button 
            type="submit" 
            className="md:col-span-3 bg-[#b8860b] text-white py-3 rounded-xl font-bold hover:bg-[#9a700a] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Create Admin
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Email</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {admins.map(admin => (
                <tr key={admin.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold dark:text-white flex items-center gap-2">
                    <Shield size={16} className="text-[#b8860b]" />
                    {admin.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{admin.email}</td>
                  <td className="px-6 py-4 text-right">
                    {admin.email !== 'abdullah@malabaz.com' && (
                      <button 
                        onClick={() => handleDelete(admin.id)} 
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Admin"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
