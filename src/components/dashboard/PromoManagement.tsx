import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
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
import { Tag, Plus, Edit, Trash2, Copy } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

export function PromoManagement() {
  const [promos, setPromos] = useState<any[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrder: '',
    maxDiscount: '',
    usageLimit: '',
    expiryDate: '',
    description: '',
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/promos`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPromos(data.promos || []);
      }
    } catch (err) {
      console.error('Error fetching promos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromo = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/promos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast.success('Promo code created successfully');
        setShowCreateDialog(false);
        resetForm();
        fetchPromos();
      } else {
        throw new Error('Failed to create promo code');
      }
    } catch (err: any) {
      console.error('Error creating promo:', err);
      toast.error(err.message || 'Failed to create promo code');
    }
  };

  const handleUpdatePromo = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/promos/${editingPromo.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast.success('Promo code updated successfully');
        setEditingPromo(null);
        resetForm();
        fetchPromos();
      } else {
        throw new Error('Failed to update promo code');
      }
    } catch (err: any) {
      console.error('Error updating promo:', err);
      toast.error(err.message || 'Failed to update promo code');
    }
  };

  const handleDeletePromo = async (promoId: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/promos/${promoId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Promo code deleted successfully');
        fetchPromos();
      } else {
        throw new Error('Failed to delete promo code');
      }
    } catch (err: any) {
      console.error('Error deleting promo:', err);
      toast.error(err.message || 'Failed to delete promo code');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      minOrder: '',
      maxDiscount: '',
      usageLimit: '',
      expiryDate: '',
      description: '',
    });
  };

  const openEditDialog = (promo: any) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      type: promo.type,
      value: promo.value,
      minOrder: promo.minOrder || '',
      maxDiscount: promo.maxDiscount || '',
      usageLimit: promo.usageLimit || '',
      expiryDate: promo.expiryDate || '',
      description: promo.description || '',
    });
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Promo code copied to clipboard');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-2">Promo Code Management</h1>
            <p className="text-gray-600">Create and manage discount codes and special offers</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Promo Code
          </Button>
        </div>
      </div>

      {/* Active Promos Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-semibold text-gray-900">{promos.length}</div>
            <div className="text-sm text-gray-600">Total Promo Codes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-semibold text-gray-900">
              {promos.filter(p => p.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active Codes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-semibold text-gray-900">
              {promos.reduce((sum, p) => sum + (p.usageCount || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Uses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-semibold text-gray-900">
              ${promos.reduce((sum, p) => sum + (p.totalSavings || 0), 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Discounts Given</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Promo Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading promo codes...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min. Order</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promos.length > 0 ? (
                  promos.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{promo.code}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyPromoCode(promo.code)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{promo.type}</TableCell>
                      <TableCell>
                        {promo.type === 'percentage' ? `${promo.value}%` : `$${promo.value}`}
                      </TableCell>
                      <TableCell>{promo.minOrder ? `$${promo.minOrder}` : '-'}</TableCell>
                      <TableCell>
                        {promo.usageCount || 0}
                        {promo.usageLimit && ` / ${promo.usageLimit}`}
                      </TableCell>
                      <TableCell>{promo.expiryDate || 'No expiry'}</TableCell>
                      <TableCell>
                        <Badge variant={promo.status === 'active' ? 'default' : 'secondary'}>
                          {promo.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(promo)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePromo(promo.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No promo codes found. Create your first one!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Promo Dialog */}
      <Dialog
        open={showCreateDialog || !!editingPromo}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingPromo(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              {editingPromo ? 'Edit Promo Code' : 'Create New Promo Code'}
            </DialogTitle>
            <DialogDescription>
              {editingPromo ? 'Update promo code details' : 'Set up a new discount or special offer'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Promo Code *</Label>
              <Input
                id="code"
                placeholder="e.g., WELCOME20"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Discount Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">
                Discount Value * {formData.type === 'percentage' ? '(%)' : '($)'}
              </Label>
              <Input
                id="value"
                type="number"
                placeholder={formData.type === 'percentage' ? '20' : '10.00'}
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOrder">Minimum Order ($)</Label>
              <Input
                id="minOrder"
                type="number"
                placeholder="Optional"
                value={formData.minOrder}
                onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
              />
            </div>

            {formData.type === 'percentage' && (
              <div className="space-y-2">
                <Label htmlFor="maxDiscount">Max Discount ($)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  placeholder="Optional"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="usageLimit">Usage Limit</Label>
              <Input
                id="usageLimit"
                type="number"
                placeholder="Unlimited"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Welcome offer for new users"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setEditingPromo(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={editingPromo ? handleUpdatePromo : handleCreatePromo}>
              {editingPromo ? 'Update' : 'Create'} Promo Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
