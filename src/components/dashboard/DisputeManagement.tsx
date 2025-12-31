import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle, Eye, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

export function DisputeManagement() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [resolution, setResolution] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/disputes`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDisputes(data.disputes || []);
      }
    } catch (err) {
      console.error('Error fetching disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async (action: 'approve' | 'reject') => {
    if (!selectedDispute) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/disputes/${selectedDispute.id}/resolve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            action,
            resolution,
            refundAmount: refundAmount ? parseFloat(refundAmount) : 0,
          }),
        }
      );

      if (response.ok) {
        toast.success(`Dispute ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        setSelectedDispute(null);
        setResolution('');
        setRefundAmount('');
        fetchDisputes();
      } else {
        throw new Error('Failed to resolve dispute');
      }
    } catch (err: any) {
      console.error('Error resolving dispute:', err);
      toast.error(err.message || 'Failed to resolve dispute');
    }
  };

  const viewDisputeDetails = (dispute: any) => {
    setSelectedDispute(dispute);
    setResolution('');
    setRefundAmount('');
  };

  const filteredDisputes = statusFilter === 'all'
    ? disputes
    : disputes.filter(d => d.status === statusFilter);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Dispute & Claim Management</h1>
        <p className="text-gray-600">Handle user and rider disputes for deliveries</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {disputes.filter(d => d.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending Disputes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {disputes.filter(d => d.status === 'resolved').length}
                </div>
                <div className="text-sm text-gray-600">Resolved</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {disputes.filter(d => d.status === 'rejected').length}
                </div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  ${disputes.reduce((sum, d) => sum + (d.refundAmount || 0), 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Refunded</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Disputes</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading disputes...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Filed By</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisputes.length > 0 ? (
                  filteredDisputes.map((dispute) => (
                    <TableRow key={dispute.id}>
                      <TableCell className="font-medium">#{dispute.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{dispute.type}</Badge>
                      </TableCell>
                      <TableCell>#{dispute.deliveryId}</TableCell>
                      <TableCell>{dispute.filedBy}</TableCell>
                      <TableCell className="max-w-xs truncate">{dispute.reason}</TableCell>
                      <TableCell>${dispute.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            dispute.status === 'resolved' ? 'default' :
                            dispute.status === 'rejected' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {dispute.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{dispute.date}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewDisputeDetails(dispute)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No disputes found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dispute Details Dialog */}
      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dispute Details #{selectedDispute?.id}</DialogTitle>
            <DialogDescription>Review and resolve the dispute claim</DialogDescription>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Type</Label>
                  <div className="font-medium">{selectedDispute.type}</div>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <div>
                    <Badge
                      variant={
                        selectedDispute.status === 'resolved' ? 'default' :
                        selectedDispute.status === 'rejected' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {selectedDispute.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600">Delivery ID</Label>
                  <div className="font-medium">#{selectedDispute.deliveryId}</div>
                </div>
                <div>
                  <Label className="text-gray-600">Filed By</Label>
                  <div className="font-medium">{selectedDispute.filedBy}</div>
                </div>
                <div>
                  <Label className="text-gray-600">Amount</Label>
                  <div className="font-medium">${selectedDispute.amount}</div>
                </div>
                <div>
                  <Label className="text-gray-600">Date Filed</Label>
                  <div className="font-medium">{selectedDispute.date}</div>
                </div>
              </div>

              <div>
                <Label className="text-gray-600">Reason</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded">{selectedDispute.reason}</div>
              </div>

              <div>
                <Label className="text-gray-600">Description</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded">{selectedDispute.description}</div>
              </div>

              {selectedDispute.evidence && (
                <div>
                  <Label className="text-gray-600">Evidence</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                    {selectedDispute.evidence}
                  </div>
                </div>
              )}

              {selectedDispute.status === 'pending' && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Resolution</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="resolution">Resolution Notes</Label>
                        <Textarea
                          id="resolution"
                          placeholder="Enter your resolution notes..."
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="refundAmount">Refund Amount ($)</Label>
                        <Input
                          id="refundAmount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDispute(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleResolveDispute('reject')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Claim
                    </Button>
                    <Button onClick={() => handleResolveDispute('approve')}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Refund
                    </Button>
                  </DialogFooter>
                </>
              )}

              {selectedDispute.status !== 'pending' && (
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-medium mb-2">Resolution Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Status:</span>{' '}
                      <span className="font-medium">{selectedDispute.status}</span>
                    </div>
                    {selectedDispute.resolutionNotes && (
                      <div>
                        <span className="text-gray-600">Notes:</span>{' '}
                        <span>{selectedDispute.resolutionNotes}</span>
                      </div>
                    )}
                    {selectedDispute.refundAmount > 0 && (
                      <div>
                        <span className="text-gray-600">Refunded:</span>{' '}
                        <span className="font-medium">${selectedDispute.refundAmount}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
