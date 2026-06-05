'use client';

import { useState } from 'react';
import { apiDelete, ApiError } from '../../lib/api';
import { getAccessToken } from '../../lib/auth-storage';
import { useAuth } from '../../context/AuthContext';
import { DashboardNav } from '../../components/DashboardNav';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'danger'>('profile');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteAccount = async () => {
    if (!confirm('Are you absolutely sure? This will soft-delete your account and remove your profile from public view.')) {
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      await apiDelete('/auth/account', getAccessToken());
      await logout();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Failed to delete account.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav variant={user?.role === 'ARTISAN' ? 'artisan' : 'customer'} />
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-2 rounded-md font-medium ${activeTab === 'profile' ? 'bg-[#0D2B5E] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-2 rounded-md font-medium ${activeTab === 'security' ? 'bg-[#0D2B5E] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`w-full text-left px-4 py-2 rounded-md font-medium ${activeTab === 'danger' ? 'bg-red-50 text-red-700' : 'text-red-600 hover:bg-red-50'}`}
          >
            Danger Zone
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2 bg-gray-50" defaultValue={user?.profile?.firstName ?? ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2 bg-gray-50" defaultValue={user?.profile?.lastName ?? ''} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2 bg-gray-50" defaultValue={user?.email ?? ''} disabled />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="tel" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border p-2 bg-gray-50" defaultValue={user?.phoneNumber ?? ''} disabled />
                </div>
              </div>
              <div className="flex justify-end">
                <button className="bg-[#0D2B5E] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0D2B5E]/90">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0D2B5E] focus:ring-[#0D2B5E] sm:text-sm border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0D2B5E] focus:ring-[#0D2B5E] sm:text-sm border p-2" />
              </div>
              <div className="flex justify-end">
                <button className="bg-[#0D2B5E] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0D2B5E]/90">
                  Update Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
              <div className="p-4 bg-red-50 rounded-md border border-red-200">
                <h3 className="text-lg font-medium text-red-800">Delete Account</h3>
                <p className="mt-2 text-sm text-red-700">
                  Once you delete your account, your profile will be hidden and you will lose access to SharpWork services.
                </p>
                {deleteError && (
                  <p className="mt-3 text-sm text-red-700">{deleteError}</p>
                )}
                <div className="mt-4">
                  <button
                    onClick={() => logout()}
                    disabled={isDeleting}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 mr-3"
                  >
                    Log Out
                  </button>
                  <button 
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? 'Processing...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
