import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Settings, ShieldCheck, Save } from 'lucide-react';
import { changePassword, formatApiError, getMe } from '../../lib/api';
import type { User } from '../../lib/models';

export function SystemConfiguration() {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const user = await getMe();
        setAdminUser(user);
      } catch (err: unknown) {
        setError(formatApiError(err));
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const handleChangePassword = async () => {
    setSuccess('');
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    try {
      setSaving(true);
      const message = await changePassword(currentPassword, newPassword);
      setSuccess(message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">System Configuration</h1>
        <p className="text-gray-600">Manage administrator account and security settings</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-200">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Admin Profile
            </CardTitle>
            <CardDescription>Current signed-in administrator details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <div className="font-medium mt-1">{adminUser?.email || 'N/A'}</div>
            </div>
            <div>
              <Label>Name</Label>
              <div className="font-medium mt-1">{adminUser?.name || 'N/A'}</div>
            </div>
            <div>
              <Label>Role</Label>
              <div className="font-medium mt-1 capitalize">{adminUser?.role || 'N/A'}</div>
            </div>
            <div>
              <Label>Email Verified</Label>
              <div className="font-medium mt-1">{adminUser?.email_verified ? 'Yes' : 'No'}</div>
            </div>
            <div>
              <Label>Account Status</Label>
              <div className="font-medium mt-1">{adminUser?.is_active ? 'Active' : 'Inactive'}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Change Password
            </CardTitle>
            <CardDescription>Update your admin account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleChangePassword} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

