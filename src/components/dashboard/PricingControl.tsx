import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
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
import { DollarSign, Save, RefreshCw } from 'lucide-react';
import { formatApiError, getPricingById, getPricingList, updatePricing } from '../../lib/api';
import type { Pricing } from '../../lib/models';

type PricingFormState = {
  base_fare: string;
  per_km_rate: string;
  vehicle_multiplier: string;
  surge_active: boolean;
  surge_multiplier: string;
  min_fare: string;
  max_fare: string;
};

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A';
  }
  return parsed.toLocaleString();
}

function toFormState(pricing: Pricing): PricingFormState {
  return {
    base_fare: String(pricing.base_fare),
    per_km_rate: String(pricing.per_km_rate),
    vehicle_multiplier: String(pricing.vehicle_multiplier),
    surge_active: pricing.surge_active,
    surge_multiplier: String(pricing.surge_multiplier),
    min_fare: String(pricing.min_fare),
    max_fare: pricing.max_fare === null ? '' : String(pricing.max_fare),
  };
}

function parseNumber(value: string): number {
  return Number(value);
}

function isValidNumber(value: string): boolean {
  if (value.trim() === '') {
    return false;
  }

  return Number.isFinite(Number(value));
}

export function PricingControl() {
  const [pricingList, setPricingList] = useState<Pricing[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<Pricing | null>(null);
  const [formState, setFormState] = useState<PricingFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void fetchPricingList();
  }, []);

  const fetchPricingList = async () => {
    try {
      setLoading(true);
      setError('');
      const list = await getPricingList();
      setPricingList(list);

      if (list.length === 0) {
        setSelectedPricing(null);
        setFormState(null);
      } else {
        const initialId = selectedPricing?.id || list[0].id;
        await fetchPricingDetails(initialId);
      }
    } catch (err: unknown) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchPricingDetails = async (id: string) => {
    try {
      setError('');
      const details = await getPricingById(id);
      setSelectedPricing(details);
      setFormState(toFormState(details));
      setPricingList((prev) => prev.map((item) => (item.id === id ? details : item)));
    } catch (err: unknown) {
      setError(formatApiError(err));
    }
  };

  const hasChanges = useMemo(() => {
    if (!selectedPricing || !formState) {
      return false;
    }

    return (
      selectedPricing.base_fare !== parseNumber(formState.base_fare) ||
      selectedPricing.per_km_rate !== parseNumber(formState.per_km_rate) ||
      selectedPricing.vehicle_multiplier !== parseNumber(formState.vehicle_multiplier) ||
      selectedPricing.surge_active !== formState.surge_active ||
      selectedPricing.surge_multiplier !== parseNumber(formState.surge_multiplier) ||
      selectedPricing.min_fare !== parseNumber(formState.min_fare) ||
      selectedPricing.max_fare !== (formState.max_fare.trim() === '' ? null : parseNumber(formState.max_fare))
    );
  }, [selectedPricing, formState]);

  const handleSavePricing = async () => {
    if (!selectedPricing || !formState) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (
        !isValidNumber(formState.base_fare) ||
        !isValidNumber(formState.per_km_rate) ||
        !isValidNumber(formState.vehicle_multiplier) ||
        !isValidNumber(formState.surge_multiplier) ||
        !isValidNumber(formState.min_fare)
      ) {
        setError('Please provide valid numeric values for all required pricing fields.');
        return;
      }

      if (formState.max_fare.trim() !== '' && !isValidNumber(formState.max_fare)) {
        setError('Max fare must be a valid number or left empty.');
        return;
      }

      const payload: Partial<
        Pick<
          Pricing,
          | 'base_fare'
          | 'per_km_rate'
          | 'vehicle_multiplier'
          | 'surge_active'
          | 'surge_multiplier'
          | 'min_fare'
          | 'max_fare'
        >
      > = {};

      const parsedMaxFare = formState.max_fare.trim() === '' ? null : parseNumber(formState.max_fare);

      if (selectedPricing.base_fare !== parseNumber(formState.base_fare)) {
        payload.base_fare = parseNumber(formState.base_fare);
      }
      if (selectedPricing.per_km_rate !== parseNumber(formState.per_km_rate)) {
        payload.per_km_rate = parseNumber(formState.per_km_rate);
      }
      if (selectedPricing.vehicle_multiplier !== parseNumber(formState.vehicle_multiplier)) {
        payload.vehicle_multiplier = parseNumber(formState.vehicle_multiplier);
      }
      if (selectedPricing.surge_active !== formState.surge_active) {
        payload.surge_active = formState.surge_active;
      }
      if (selectedPricing.surge_multiplier !== parseNumber(formState.surge_multiplier)) {
        payload.surge_multiplier = parseNumber(formState.surge_multiplier);
      }
      if (selectedPricing.min_fare !== parseNumber(formState.min_fare)) {
        payload.min_fare = parseNumber(formState.min_fare);
      }
      if (selectedPricing.max_fare !== parsedMaxFare) {
        payload.max_fare = parsedMaxFare;
      }

      if (Object.keys(payload).length === 0) {
        return;
      }

      const updated = await updatePricing(selectedPricing.id, payload);
      setSelectedPricing(updated);
      setFormState(toFormState(updated));
      setPricingList((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
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
        <h1 className="text-gray-900 mb-2">Pricing Control</h1>
        <p className="text-gray-600">Manage base fares and surge multipliers by pricing entry</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pricing Entries</CardTitle>
                <CardDescription>Select an entry to edit</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchPricingList}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Base Fare</TableHead>
                  <TableHead>Per KM</TableHead>
                  <TableHead>Surge</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingList.length > 0 ? (
                  pricingList.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className={`cursor-pointer ${selectedPricing?.id === entry.id ? 'bg-indigo-50' : ''}`}
                      onClick={() => fetchPricingDetails(entry.id)}
                    >
                      <TableCell>{entry.vehicle_type || 'Default'}</TableCell>
                      <TableCell>{entry.base_fare}</TableCell>
                      <TableCell>{entry.per_km_rate}</TableCell>
                      <TableCell>
                        <Badge variant={entry.surge_active ? 'default' : 'outline'}>
                          {entry.surge_active ? 'Active' : 'Off'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No pricing entries found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Edit Pricing Entry
            </CardTitle>
            <CardDescription>
              {selectedPricing
                ? `Last updated: ${formatDate(selectedPricing.updated_at)}`
                : 'Select a pricing entry to start editing'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedPricing && formState ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                    <Input id="vehicleType" value={selectedPricing.vehicle_type || 'Default'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="baseFare">Base Fare</Label>
                    <Input
                      id="baseFare"
                      type="number"
                      step="0.01"
                      value={formState.base_fare}
                      onChange={(e) => setFormState({ ...formState, base_fare: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perKmRate">Per KM Rate</Label>
                    <Input
                      id="perKmRate"
                      type="number"
                      step="0.01"
                      value={formState.per_km_rate}
                      onChange={(e) => setFormState({ ...formState, per_km_rate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleMultiplier">Vehicle Multiplier</Label>
                    <Input
                      id="vehicleMultiplier"
                      type="number"
                      step="0.01"
                      value={formState.vehicle_multiplier}
                      onChange={(e) => setFormState({ ...formState, vehicle_multiplier: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surgeMultiplier">Surge Multiplier</Label>
                    <Input
                      id="surgeMultiplier"
                      type="number"
                      step="0.01"
                      value={formState.surge_multiplier}
                      onChange={(e) => setFormState({ ...formState, surge_multiplier: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minFare">Min Fare</Label>
                    <Input
                      id="minFare"
                      type="number"
                      step="0.01"
                      value={formState.min_fare}
                      onChange={(e) => setFormState({ ...formState, min_fare: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxFare">Max Fare</Label>
                    <Input
                      id="maxFare"
                      type="number"
                      step="0.01"
                      value={formState.max_fare}
                      onChange={(e) => setFormState({ ...formState, max_fare: e.target.value })}
                      placeholder="Leave empty for no cap"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">Enable Surge</div>
                    <div className="text-sm text-gray-600">Use surge multiplier for this entry</div>
                  </div>
                  <Switch
                    checked={formState.surge_active}
                    onCheckedChange={(checked) => setFormState({ ...formState, surge_active: checked })}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSavePricing} disabled={saving || !hasChanges}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Pricing'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-gray-500">No pricing entry selected.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
