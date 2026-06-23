"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, Percent, ShoppingBag, Search, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*, orders(count)')
      .order('created_at', { ascending: false });

    if (profiles) setUsers(profiles);
    setLoading(false);
  };

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (!error) setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleDiscountChange = async (userId: string, percent: number) => {
    const { error } = await supabase.from('profiles').update({ discount_percent: percent }).eq('id', userId);
    if (!error) setUsers(prev => prev.map(u => u.id === userId ? { ...u, discount_percent: percent } : u));
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (!error) setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(query.toLowerCase()) || u.phone?.includes(query)
  );

  if (loading) return <div className="p-20 text-center text-warm-mid">Loading users...</div>;

  return (
    <div className="space-y-10">
      <h1 className="font-serif text-4xl mb-2">User Management</h1>
      <div className="bg-white p-4 rounded-xl border border-warm-mid/10 shadow-sm relative max-w-md">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-warm-mid" size={18} />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-cream/50 border border-warm-mid/10 rounded-lg outline-none"
        />
      </div>

      <div className="bg-white rounded-2xl border border-warm-mid/10 shadow-sm overflow-hidden">
        <table className="w-full text-left font-sans">
          <thead className="bg-cream text-warm-mid text-xs uppercase">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4 text-center">Verified</th>
              <th className="px-6 py-4 text-center">Role</th>
              <th className="px-6 py-4 text-center">Orders</th>
              <th className="px-6 py-4">Discount</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-mid/10">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold">{user.full_name || 'No Name'}</p>
                </td>
                <td className="px-6 py-4 text-sm">{user.phone || 'N/A'}</td>
                <td className="px-6 py-4 text-center">
                  {user.phone_verified ? <CheckCircle2 className="text-green-500 mx-auto" size={18} /> : <XCircle className="text-warm-mid/30 mx-auto" size={18} />}
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleRoleToggle(user.id, user.role)} className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-cream">{user.role}</button>
                </td>
                <td className="px-6 py-4 text-center font-medium">{user.orders?.[0]?.count || 0}</td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    value={user.discount_percent}
                    onChange={(e) => handleDiscountChange(user.id, Number(e.target.value))}
                    className="w-16 px-2 py-1 bg-cream rounded text-xs font-bold"
                  /> %
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDeleteUser(user.id)} className="text-warm-mid hover:text-red-600"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
