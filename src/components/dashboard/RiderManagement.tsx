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
import { Search, Eye, Ban, CheckCircle, RefreshCw } from 'lucide-react';
import { formatApiError, getUserById, getUsers, updateUserStatus } from '../../lib/api';
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

export function RiderManagement() {
  const [riders, setRiders] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRider, setSelectedRider] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchRiders();
  }, []);

  const filteredRiders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return riders;
    }

    return riders.filter((rider) => {
      const name = (rider.name || '').toLowerCase();
      const email = rider.email.toLowerCase();
      const phone = (rider.phone || '').toLowerCase();
      return name.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [searchQuery, riders]);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUsers();
      setRiders(data.users.filter((user) => user.role === 'rider'));
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (rider: User) => {
    try {
      setProcessingId(rider.id);
      setError('');
      const updated = await updateUserStatus(rider.id, !rider.is_active);

      setRiders((prev) =>
        prev.map((entry) =>
          entry.id === rider.id
            ? {
                ...entry,
                is_active: updated.is_active,
              }
            : entry,
        ),
      );

      if (selectedRider?.id === rider.id) {
        setSelectedRider((prev) =>
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

  const viewRiderDetails = async (riderId: string) => {
    try {
      setError('');
      const rider = await getUserById(riderId);
      if (rider.role === 'rider') {
        setSelectedRider(rider);
      }
    } catch (err: unknown) {
      setError(formatApiError(err));
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Rider Management</h1>
        <p className="text-gray-600">View and manage rider accounts</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>All Riders ({riders.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchRiders} disabled={loading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search riders..."
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
            <div className="text-center py-8 text-gray-500">Loading riders...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRiders.length > 0 ? (
                  filteredRiders.map((rider) => (
                    <TableRow key={rider.id}>
                      <TableCell className="font-medium">{rider.name || 'N/A'}</TableCell>
                      <TableCell>{rider.email}</TableCell>
                      <TableCell>{rider.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={rider.is_active ? 'default' : 'destructive'}>
                          {rider.is_active ? 'active' : 'inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(rider.created_at || rider.updated_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewRiderDetails(rider.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={processingId === rider.id}
                            onClick={() => handleUpdateStatus(rider)}
                          >
                            {rider.is_active ? (
                              <Ban className="w-4 h-4 text-red-600" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No riders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedRider} onOpenChange={() => setSelectedRider(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rider Details</DialogTitle>
            <DialogDescription>Complete rider information</DialogDescription>
          </DialogHeader>
          {selectedRider && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <div className="font-medium">{selectedRider.name || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <div className="font-medium">{selectedRider.email}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phone</label>
                  <div className="font-medium">{selectedRider.phone || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Address</label>
                  <div className="font-medium">{selectedRider.address || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Role</label>
                  <div className="font-medium capitalize">{selectedRider.role}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email Verified</label>
                  <div className="font-medium">{selectedRider.email_verified ? 'Yes' : 'No'}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <div>
                    <Badge variant={selectedRider.is_active ? 'default' : 'destructive'}>
                      {selectedRider.is_active ? 'active' : 'inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Created</label>
                  <div className="font-medium">{formatDate(selectedRider.created_at)}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

