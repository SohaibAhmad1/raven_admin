import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Search, Eye, Ban, CheckCircle, Trash2, RefreshCw } from 'lucide-react';
import { deleteUser, formatApiError, getUserById, getUsers, updateUserStatus } from '../../lib/api';
import type { User } from '../../lib/models';

function formatDate(value?: string): string {
  if (!value) {
    return 'N/A';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A';
  }

  return parsed.toLocaleDateString();
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return users;
    }

    return users.filter((user) => {
      const name = (user.name || '').toLowerCase();
      const email = user.email.toLowerCase();
      const phone = (user.phone || '').toLowerCase();
      return name.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUsers();
      setUsers(data.users);
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (user: User) => {
    try {
      setProcessingId(user.id);
      setError('');
      const updated = await updateUserStatus(user.id, !user.is_active);

      setUsers((prev) =>
        prev.map((entry) =>
          entry.id === user.id
            ? {
                ...entry,
                is_active: updated.is_active,
              }
            : entry,
        ),
      );

      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) =>
          prev
            ? {
                ...prev,
                is_active: updated.is_active,
              }
            : prev,
        );
      }
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setProcessingId(deleteTarget.id);
      setError('');
      await deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((entry) => entry.id !== deleteTarget.id));
      if (selectedUser?.id === deleteTarget.id) {
        setSelectedUser(null);
      }
      setDeleteTarget(null);
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setProcessingId(null);
    }
  };

  const viewUserDetails = async (userId: string) => {
    try {
      setError('');
      const user = await getUserById(userId);
      setSelectedUser(user);
    } catch (err: unknown) {
      setError(formatApiError(err));
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">View, activate/deactivate, and delete user accounts</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>All Users ({users.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || 'N/A'}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? 'default' : 'destructive'}>
                          {user.is_active ? 'active' : 'inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at || user.updated_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewUserDetails(user.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={processingId === user.id}
                            onClick={() => handleUpdateStatus(user)}
                          >
                            {user.is_active ? (
                              <Ban className="w-4 h-4 text-red-600" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={processingId === user.id}
                            onClick={() => setDeleteTarget(user)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Complete user information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <div className="font-medium">{selectedUser.name || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <div className="font-medium">{selectedUser.email}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phone</label>
                  <div className="font-medium">{selectedUser.phone || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Address</label>
                  <div className="font-medium">{selectedUser.address || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Role</label>
                  <div className="font-medium capitalize">{selectedUser.role}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email Verified</label>
                  <div className="font-medium">{selectedUser.email_verified ? 'Yes' : 'No'}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <div>
                    <Badge variant={selectedUser.is_active ? 'default' : 'destructive'}>
                      {selectedUser.is_active ? 'active' : 'inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Created</label>
                  <div className="font-medium">{formatDate(selectedUser.created_at)}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteTarget?.email}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!processingId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteUser}
              disabled={!!processingId}
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

