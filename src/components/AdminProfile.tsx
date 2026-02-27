import React, { useState, useEffect } from 'react';
import { User, Lock, Upload, CheckCircle, XCircle, Truck, Package } from 'lucide-react';

export default function AdminProfile({ adminUser, setAdminUser }: any) {
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState(adminUser.profile_photo || '');
  const [stats, setStats] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchHistory();
  }, [adminUser]);

  const fetchStats = async () => {
    const res = await fetch(`/api/admin/profile/${adminUser.id}/stats`);
    if (res.ok) {
      setStats(await res.json());
    }
  };

  const fetchHistory = async () => {
    const res = await fetch(`/api/admin/profile/${adminUser.id}/history`);
    if (res.ok) {
      setHistory(await res.json());
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/profile/${adminUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password || undefined, profile_photo: photo })
    });
    if (res.ok) {
      const data = await res.json();
      setAdminUser(data.admin);
      setPassword('');
      alert('Profile updated successfully!');
    } else {
      alert('Failed to update profile.');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64String, fileName: file.name })
        });
        if (res.ok) {
          const data = await res.json();
          setPhoto(data.url);
        }
      } catch (err) {
        console.error('Upload failed', err);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const getStatCount = (status: string) => {
    const stat = stats.find(s => s.status === status);
    return stat ? stat.count : 0;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h4 className="text-3xl font-black dark:text-white mb-8">Admin Profile</h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              {photo ? (
                <img src={photo} alt="Profile" className="w-full h-full object-cover rounded-full border-4 border-slate-100 dark:border-slate-800" />
              ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <User size={48} className="text-slate-400" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-[#b8860b] text-white p-2 rounded-full cursor-pointer hover:bg-[#9a700a] transition-colors shadow-lg">
                <Upload size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            </div>
            <h3 className="text-xl font-bold dark:text-white">{adminUser.name}</h3>
            <p className="text-slate-500 text-sm">{adminUser.email}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
            <h5 className="font-bold mb-4 dark:text-white flex items-center gap-2">
              <Lock size={18} /> Change Password
            </h5>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <input 
                type="password" 
                placeholder="New Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-slate-900 dark:focus:border-white dark:text-white"
              />
              <button 
                type="submit"
                disabled={!password && photo === adminUser.profile_photo}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <h5 className="text-xl font-bold dark:text-white mb-4">Your Activity Stats</h5>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <Truck size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Delivered Orders</p>
                <p className="text-2xl font-black dark:text-white">{getStatCount('delivered')}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Approved Orders</p>
                <p className="text-2xl font-black dark:text-white">{getStatCount('approved')}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                <XCircle size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Cancelled Orders</p>
                <p className="text-2xl font-black dark:text-white">{getStatCount('cancelled')}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                <Package size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Completed Orders</p>
                <p className="text-2xl font-black dark:text-white">{getStatCount('completed')}</p>
              </div>
            </div>
          </div>

          <h5 className="text-xl font-bold dark:text-white mt-8 mb-4">Order History</h5>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Order ID</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Customer</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Updated By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No history found.
                      </td>
                    </tr>
                  )}
                  {history.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold dark:text-white">#{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="dark:text-white font-medium">{order.user_name || 'Guest'}</div>
                        <div className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'approved' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                        {order.updated_by || 'System'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
