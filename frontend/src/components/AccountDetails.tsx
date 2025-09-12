import React, { useState } from 'react';
import { User, Lock, Save, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/api';
import { Button } from './ui/Button';

export const AccountDetails: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Username form state
  const [username, setUsername] = useState(user?.username || '');
  const [isUsernameLoading, setIsUsernameLoading] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || username === user?.username) return;

    setIsUsernameLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authApi.updateUsername(username.trim());
      setSuccess('Username updated successfully!');
      updateUser(response.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update username');
    } finally {
      setIsUsernameLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setIsPasswordLoading(true);
    setPasswordError(null);
    setSuccess(null);

    try {
      await authApi.updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Account Settings</h1>
          <p className="text-secondary-600">Manage your account details and security settings</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Account Information */}
          <div className="bg-white rounded-2xl shadow-soft border border-secondary-200/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-primary-100 p-2 rounded-xl">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-secondary-900">Account Information</h2>
            </div>

            <div className="space-y-4">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl text-secondary-500 cursor-not-allowed"
                />
                <p className="text-xs text-secondary-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Username Form */}
              <form onSubmit={handleUsernameUpdate}>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Username
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your username"
                    required
                    minLength={3}
                    maxLength={30}
                  />
                  <Button
                    type="submit"
                    disabled={isUsernameLoading || !username.trim() || username === user?.username}
                    className="px-6"
                  >
                    {isUsernameLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-2xl shadow-soft border border-secondary-200/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-orange-100 p-2 rounded-xl">
                <Lock className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-secondary-900">Security Settings</h2>
            </div>

            {/* Password Update Form */}
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {passwordError}
                </div>
              )}

              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-secondary-500 mt-1">Minimum 6 characters</p>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Confirm your new password"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isPasswordLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  className="px-8"
                >
                  {isPasswordLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};