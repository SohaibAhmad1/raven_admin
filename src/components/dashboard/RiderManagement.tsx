import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
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
  DialogFooter,
} from '../ui/dialog';
import { Search, Eye, Ban, CheckCircle, UserCheck, Star } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function RiderManagement() {
  const [riders, setRiders] = useState<any[]>([]);
  const [filteredRiders, setFilteredRiders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRider, setSelectedRider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiders();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = riders.filter(rider =>
        rider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rider.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRiders(filtered);
    } else {
      setFilteredRiders(riders);
    }
  }, [searchQuery, riders]);

  const fetchRiders = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/riders`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRiders(data.riders || []);
        setFilteredRiders(data.riders || []);
      }
    } catch (err) {
      console.error('Error fetching riders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (riderId: string, status: 'active' | 'suspended' | 'pending') => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/riders/${riderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        fetchRiders();
        setSelectedRider(null);
      }
    } catch (err) {
      console.error('Error updating rider status:', err);
    }
  };

  const viewRiderDetails = async (riderId: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/riders/${riderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedRider(data);
      }
    } catch (err) {
      console.error('Error fetching rider details:', err);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Rider Management</h1>
        <p className="text-gray-600">Approve, verify, and manage rider accounts</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Riders</CardTitle>
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
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Deliveries</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRiders.length > 0 ? (
                  filteredRiders.map((rider) => (
                    <TableRow key={rider.id}>
                      <TableCell className="font-medium">{rider.name}</TableCell>
                      <TableCell>{rider.email}</TableCell>
                      <TableCell>{rider.phone}</TableCell>
                      <TableCell>{rider.vehicle}</TableCell>
                      <TableCell>{rider.totalDeliveries}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{rider.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>${rider.earnings}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rider.status === 'active' ? 'default' :
                            rider.status === 'pending' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {rider.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewRiderDetails(rider.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {rider.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(rider.id, 'active')}
                            >
                              <UserCheck className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          {rider.status === 'active' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(rider.id, 'suspended')}
                            >
                              <Ban className="w-4 h-4 text-red-600" />
                            </Button>
                          ) : rider.status === 'suspended' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(rider.id, 'active')}
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No riders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Rider Details Dialog */}
      <Dialog open={!!selectedRider} onOpenChange={() => setSelectedRider(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Rider Details</DialogTitle>
            <DialogDescription>Performance, complaints, and complete rider information</DialogDescription>
          </DialogHeader>
          {selectedRider && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <div className="font-medium">{selectedRider.name}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <div className="font-medium">{selectedRider.email}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phone</label>
                  <div className="font-medium">{selectedRider.phone}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Vehicle Type</label>
                  <div className="font-medium">{selectedRider.vehicle}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">License Plate</label>
                  <div className="font-medium">{selectedRider.licensePlate}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <div>
                    <Badge
                      variant={
                        selectedRider.status === 'active' ? 'default' :
                        selectedRider.status === 'pending' ? 'secondary' :
                        'destructive'
                      }
                    >
                      {selectedRider.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-semibold text-gray-900">{selectedRider.totalDeliveries}</div>
                    <div className="text-sm text-gray-600">Total Deliveries</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-semibold text-gray-900">{selectedRider.rating}</div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-semibold text-gray-900">${selectedRider.earnings}</div>
                    <div className="text-sm text-gray-600">Total Earnings</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-semibold text-gray-900">{selectedRider.complaints || 0}</div>
                    <div className="text-sm text-gray-600">Complaints</div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="font-medium mb-3">Recent Deliveries</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedRider.recentDeliveries?.map((delivery: any) => (
                    <div key={delivery.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">Delivery #{delivery.id}</div>
                        <div className="text-sm text-gray-600">{delivery.route}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${delivery.amount}</div>
                        <div className="text-sm text-gray-600">{delivery.date}</div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-gray-500 py-4">No deliveries yet</div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRider(null)}>Close</Button>
                {selectedRider.status === 'pending' && (
                  <Button onClick={() => handleUpdateStatus(selectedRider.id, 'active')}>
                    Approve Rider
                  </Button>
                )}
                {selectedRider.status === 'active' && (
                  <Button variant="destructive" onClick={() => handleUpdateStatus(selectedRider.id, 'suspended')}>
                    Suspend Rider
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
