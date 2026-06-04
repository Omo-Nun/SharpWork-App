'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '../../lib/api';
import { getAccessToken } from '../../lib/auth-storage';

interface AdminUser {
  id: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  customerProfile?: { firstName: string; lastName: string } | null;
  artisanProfile?: { firstName: string; lastName: string; isVerified: boolean } | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<AdminUser[]>('/admin/users', getAccessToken())
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading users...</p>;

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Users</h1>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-bold">Name</th>
              <th className="text-left p-4 font-bold">Email</th>
              <th className="text-left p-4 font-bold">Role</th>
              <th className="text-left p-4 font-bold">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">No users found.</td></tr>
            ) : (
              users.map((user) => {
                const name =
                  user.artisanProfile
                    ? `${user.artisanProfile.firstName} ${user.artisanProfile.lastName}`
                    : user.customerProfile
                      ? `${user.customerProfile.firstName} ${user.customerProfile.lastName}`
                      : '—';
                return (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4">{name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-xs font-bold uppercase">{user.role}</span>
                    </td>
                    <td className="p-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
