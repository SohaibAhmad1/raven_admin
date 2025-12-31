import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
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
import { Search, Eye, MapPin, Package } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function DeliveryManagement() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = deliveries;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(d =>
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredDeliveries(filtered);
  }, [searchQuery, statusFilter, deliveries]);

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/deliveries`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDeliveries(data.deliveries || []);
      }
    } catch (err) {
      console.error('Error fetching deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewDeliveryDetails = async (deliveryId: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/deliveries/${deliveryId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedDelivery(data);
      }
    } catch (err) {
      console.error('Error fetching delivery details:', err);
    }
  };

  const handleReassignRider = async (deliveryId: string, newRiderId: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/deliveries/${deliveryId}/reassign`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ riderId: newRiderId }),
        }
      );

      if (response.ok) {
        fetchDeliveries();
        setSelectedDelivery(null);
      }
    } catch (err) {
      console.error('Error reassigning rider:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'assigned': return 'default';
      case 'picked-up': return 'default';
      case 'in-transit': return 'default';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Delivery Management</h1>
        <p className="text-gray-600">Track all deliveries with live status updates</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded">
                <Package className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold">
                  {deliveries.filter(d => d.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold">
                  {deliveries.filter(d => d.status === 'in-transit').length}
                </div>
                <div className="text-sm text-gray-600">In Transit</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold">
                  {deliveries.filter(d => d.status === 'delivered').length}
                </div>
                <div className="text-sm text-gray-600">Delivered</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded">
                <Package className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold">
                  {deliveries.filter(d => d.status === 'cancelled').length}
                </div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Deliveries</CardTitle>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="picked-up">Picked Up</SelectItem>
                  <SelectItem value="in-transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search deliveries..."
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
            <div className="text-center py-8 text-gray-500">Loading deliveries...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rider</TableHead>
                  <TableHead>Pickup</TableHead>
                  <TableHead>Dropoff</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.length > 0 ? (
                  filteredDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">#{delivery.id}</TableCell>
                      <TableCell>{delivery.customerName}</TableCell>
                      <TableCell>{delivery.riderName || 'Unassigned'}</TableCell>
                      <TableCell className="max-w-xs truncate">{delivery.pickupAddress}</TableCell>
                      <TableCell className="max-w-xs truncate">{delivery.dropoffAddress}</TableCell>
                      <TableCell>${delivery.amount}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(delivery.status)}>
                          {delivery.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{delivery.time}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewDeliveryDetails(delivery.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No deliveries found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delivery Details Dialog */}
      <Dialog open={!!selectedDelivery} onOpenChange={() => setSelectedDelivery(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Delivery Details #{selectedDelivery?.id}</DialogTitle>
            <DialogDescription>Complete parcel information and tracking status</DialogDescription>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Delivery Information</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm text-gray-600">Status</label>
                      <div>
                        <Badge variant={getStatusColor(selectedDelivery.status)}>
                          {selectedDelivery.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Customer</label>
                      <div className="font-medium">{selectedDelivery.customerName}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Rider</label>
                      <div className="font-medium">{selectedDelivery.riderName || 'Not assigned'}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Amount</label>
                      <div className="font-medium">${selectedDelivery.amount}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Parcel Details</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm text-gray-600">Category</label>
                      <div className="font-medium">{selectedDelivery.category}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Weight</label>
                      <div className="font-medium">{selectedDelivery.weight} kg</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Distance</label>
                      <div className="font-medium">{selectedDelivery.distance} km</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Payment Method</label>
                      <div className="font-medium">{selectedDelivery.paymentMethod}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Route</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded">
                      <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Pickup Location</div>
                      <div className="text-sm text-gray-600">{selectedDelivery.pickupAddress}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded">
                      <MapPin className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium">Dropoff Location</div>
                      <div className="text-sm text-gray-600">{selectedDelivery.dropoffAddress}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium mb-2">Live Map Visualization</h3>
                <div className="bg-gray-200 h-64 rounded flex items-center justify-center text-gray-500">
                  Map integration would be displayed here (Google Maps / Mapbox)
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
