import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { CreditCard, Download, DollarSign, TrendingUp } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

export function PaymentsCommissions() {
  const [payments, setPayments] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [commissionRate, setCommissionRate] = useState('15');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const fetchPaymentsData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const [paymentsRes, payoutsRes, settingsRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/payments`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/payouts`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/commission-settings`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data.payments || []);
      }

      if (payoutsRes.ok) {
        const data = await payoutsRes.json();
        setPayouts(data.payouts || []);
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.commissionRate) setCommissionRate(data.commissionRate);
      }
    } catch (err) {
      console.error('Error fetching payments data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCommission = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/commission-settings`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ commissionRate }),
        }
      );

      if (response.ok) {
        toast.success('Commission rate updated successfully');
      }
    } catch (err) {
      console.error('Error updating commission rate:', err);
      toast.error('Failed to update commission rate');
    }
  };

  const handleProcessPayout = async (payoutId: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/payouts/${payoutId}/process`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Payout processed successfully');
        fetchPaymentsData();
      }
    } catch (err) {
      console.error('Error processing payout:', err);
      toast.error('Failed to process payout');
    }
  };

  const exportPayoutsReport = () => {
    // Generate CSV export
    const csvContent = [
      ['Rider', 'Amount', 'Status', 'Date'],
      ...payouts.map(p => [p.riderName, p.amount, p.status, p.date])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payouts-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Report exported successfully');
  };

  const totalPayments = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const totalPayouts = payouts.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const pendingPayouts = payouts.filter(p => p.status === 'pending').length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Payments & Commissions</h1>
        <p className="text-gray-600">Manage payments, payouts, and commission rates</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">${totalPayments.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Payments</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">${totalPayouts.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Payouts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">{pendingPayouts}</div>
                <div className="text-sm text-gray-600">Pending Payouts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">{commissionRate}%</div>
                <div className="text-sm text-gray-600">Commission Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payments">User Payments</TabsTrigger>
          <TabsTrigger value="payouts">Rider Payouts</TabsTrigger>
          <TabsTrigger value="commission">Commission Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Payment History</CardTitle>
                  <CardDescription>Track all customer transactions</CardDescription>
                </div>
                <Button variant="outline" onClick={exportPayoutsReport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading payments...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Delivery ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length > 0 ? (
                      payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">#{payment.id}</TableCell>
                          <TableCell>{payment.customerName}</TableCell>
                          <TableCell>#{payment.deliveryId}</TableCell>
                          <TableCell>${payment.amount}</TableCell>
                          <TableCell>{payment.method}</TableCell>
                          <TableCell>
                            <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{payment.date}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No payments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Rider Payout Queue</CardTitle>
                  <CardDescription>Manage and process rider settlements</CardDescription>
                </div>
                <Button variant="outline" onClick={exportPayoutsReport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading payouts...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payout ID</TableHead>
                      <TableHead>Rider</TableHead>
                      <TableHead>Deliveries</TableHead>
                      <TableHead>Gross Amount</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Net Payout</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.length > 0 ? (
                      payouts.map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell className="font-medium">#{payout.id}</TableCell>
                          <TableCell>{payout.riderName}</TableCell>
                          <TableCell>{payout.deliveryCount}</TableCell>
                          <TableCell>${payout.grossAmount}</TableCell>
                          <TableCell>${payout.commission}</TableCell>
                          <TableCell className="font-medium">${payout.amount}</TableCell>
                          <TableCell>
                            <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>
                              {payout.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{payout.date}</TableCell>
                          <TableCell>
                            {payout.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleProcessPayout(payout.id)}
                              >
                                Process
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No payouts found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission">
          <Card>
            <CardHeader>
              <CardTitle>Commission Rate Settings</CardTitle>
              <CardDescription>Configure platform commission and automatic settlements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-w-md space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="commissionRate">Platform Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    step="0.5"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    Percentage taken from each delivery as platform fee
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Commission Calculation</h4>
                  <p className="text-blue-700 text-sm">
                    For a $20 delivery with {commissionRate}% commission:
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    • Platform fee: ${(20 * parseFloat(commissionRate) / 100).toFixed(2)}
                  </p>
                  <p className="text-blue-700 text-sm">
                    • Rider payout: ${(20 - (20 * parseFloat(commissionRate) / 100)).toFixed(2)}
                  </p>
                </div>

                <Button onClick={handleUpdateCommission}>
                  Save Commission Settings
                </Button>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Automatic Settlement Schedule</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <div className="font-medium">Weekly Payouts</div>
                      <div className="text-sm text-gray-600">Process payouts every Monday</div>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <div className="font-medium">Minimum Payout</div>
                      <div className="text-sm text-gray-600">$50 threshold for automatic processing</div>
                    </div>
                    <Input type="number" className="w-32" defaultValue="50" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
