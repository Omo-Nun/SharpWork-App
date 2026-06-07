'use client';

import { useState } from 'react';
import { apiDelete, apiPatch, ApiError } from '../../lib/api';
import { getAccessToken } from '../../lib/auth-storage';
import { useAuth } from '../../context/AuthContext';
import { DashboardNav } from '../../components/DashboardNav';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'danger'>('profile');
  
  const [profileForm, setProfileForm] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleProfileSave = async () => {
    setProfileMessage({ type: '', text: '' });
    setProfileSaving(true);
    try {
      await apiPatch('/auth/profile', profileForm, getAccessToken());
      setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: err instanceof ApiError ? err.message : 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    setPasswordMessage({ type: '', text: '' });
    if (!passwords.current || !passwords.new) {
      setPasswordMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwords.new.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    setPasswordSaving(true);
    try {
      await apiPatch('/auth/password', { currentPassword: passwords.current, newPassword: passwords.new }, getAccessToken());
      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err instanceof ApiError ? err.message : 'Failed to update password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

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
              {profileMessage.text && (
                <div className={`p-3 rounded-md text-sm ${profileMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {profileMessage.text}
                </div>
              )}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0D2B5E] focus:ring-[#0D2B5E] sm:text-sm border p-2 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0D2B5E] focus:ring-[#0D2B5E] sm:text-sm border p-2 bg-white" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0D2B5E] focus:ring-[#0D2B5E] sm:text-sm border p-2 bg-white" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="tel" value={profileForm.phoneNumber} onChange={e => setProfileForm({...profileForm, phoneNumber: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0D2B5E] focus:ring-[#0D2B5E] sm:text-sm border p-2 bg-white" />
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handleProfileSave} disabled={profileSaving} className="bg-[#0D2B5E] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0D2B5E]/90 disabled:opacity-50 transition-opacity">
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
              {passwordMessage.text && (
                <div className={`p-3 rounded-md text-sm ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {passwordMessage.text}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0D2B5E] focus:ring-[#0D2B5E] sm:text-sm border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0D2B5E] focus:ring-[#0D2B5E] sm:text-sm border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0D2B5E] focus:ring-[#0D2B5E] sm:text-sm border p-2" />
              </div>
              <div className="flex justify-end">
                <button onClick={handlePasswordSave} disabled={passwordSaving} className="bg-[#0D2B5E] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0D2B5E]/90 disabled:opacity-50 transition-opacity">
                  {passwordSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Danger Zone
              </h2>
              <div className="p-5 bg-red-50 rounded-lg border border-red-200">
                <h3 className="text-lg font-bold text-red-800">Delete Account</h3>
                <p className="mt-2 text-sm text-red-700 mb-4">
                  Once you delete your account, your profile will be hidden and you will lose access to SharpWork services. This action cannot be easily reversed.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-red-800 mb-1">Type "DELETE" to confirm</label>
                  <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} className="block w-full max-w-xs rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm border p-2" placeholder="DELETE" />
                </div>
                {deleteError && (
                  <p className="mt-3 text-sm text-red-700 font-medium mb-4">{deleteError}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => logout()}
                    disabled={isDeleting}
                    className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-bold border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Log Out Instead
                  </button>
                  <button 
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirm !== 'DELETE'}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-opacity shadow-sm"
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
