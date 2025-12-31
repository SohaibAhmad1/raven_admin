import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DollarSign, MapPin, TrendingUp, Save } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

export function PricingControl() {
  const [baseFare, setBaseFare] = useState('5.00');
  const [perKmRate, setPerKmRate] = useState('1.50');
  const [serviceRadius, setServiceRadius] = useState('25');
  const [surgeEnabled, setSurgeEnabled] = useState(false);
  const [surgePeakHours, setSurgePeakHours] = useState('18:00-20:00');
  const [surgeMultiplier, setSurgeMultiplier] = useState('1.5');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPricingSettings();
  }, []);

  const fetchPricingSettings = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/pricing`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.baseFare) setBaseFare(data.baseFare);
        if (data.perKmRate) setPerKmRate(data.perKmRate);
        if (data.serviceRadius) setServiceRadius(data.serviceRadius);
        if (data.surgeEnabled !== undefined) setSurgeEnabled(data.surgeEnabled);
        if (data.surgePeakHours) setSurgePeakHours(data.surgePeakHours);
        if (data.surgeMultiplier) setSurgeMultiplier(data.surgeMultiplier);
      }
    } catch (err) {
      console.error('Error fetching pricing settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePricing = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/pricing`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            baseFare,
            perKmRate,
            serviceRadius,
            surgeEnabled,
            surgePeakHours,
            surgeMultiplier,
          }),
        }
      );

      if (response.ok) {
        toast.success('Pricing settings saved successfully');
      } else {
        throw new Error('Failed to save pricing settings');
      }
    } catch (err: any) {
      console.error('Error saving pricing settings:', err);
      toast.error(err.message || 'Failed to save pricing settings');
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
        <p className="text-gray-600">Manage base fare, rates, and surge pricing</p>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Basic Pricing</TabsTrigger>
          <TabsTrigger value="surge">Surge Pricing</TabsTrigger>
          <TabsTrigger value="zones">Service Zones</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Base Pricing Configuration
              </CardTitle>
              <CardDescription>Set the standard rates for delivery services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="baseFare">Base Fare ($)</Label>
                  <Input
                    id="baseFare"
                    type="number"
                    step="0.50"
                    value={baseFare}
                    onChange={(e) => setBaseFare(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">Minimum charge for any delivery</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="perKmRate">Per Kilometer Rate ($)</Label>
                  <Input
                    id="perKmRate"
                    type="number"
                    step="0.10"
                    value={perKmRate}
                    onChange={(e) => setPerKmRate(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">Additional charge per kilometer</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Price Calculation Example</h4>
                <p className="text-blue-700">
                  For a 10 km delivery: ${baseFare} + (10 × ${perKmRate}) = ${(parseFloat(baseFare) + 10 * parseFloat(perKmRate)).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Type Pricing</CardTitle>
              <CardDescription>Different rates for different vehicle types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <div className="font-medium">Motorcycle</div>
                    <div className="text-sm text-gray-600">Standard delivery</div>
                  </div>
                  <Input type="number" className="w-32" defaultValue="1.00" step="0.10" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <div className="font-medium">Car</div>
                    <div className="text-sm text-gray-600">Larger parcels</div>
                  </div>
                  <Input type="number" className="w-32" defaultValue="1.50" step="0.10" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <div className="font-medium">Van</div>
                    <div className="text-sm text-gray-600">Bulk delivery</div>
                  </div>
                  <Input type="number" className="w-32" defaultValue="2.00" step="0.10" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surge" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Surge Pricing Settings
              </CardTitle>
              <CardDescription>Configure peak-hour and demand-based pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">Enable Surge Pricing</div>
                  <div className="text-sm text-gray-600">Automatically adjust prices during peak hours</div>
                </div>
                <Switch
                  checked={surgeEnabled}
                  onCheckedChange={setSurgeEnabled}
                />
              </div>

              {surgeEnabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="surgePeakHours">Peak Hours</Label>
                      <Input
                        id="surgePeakHours"
                        value={surgePeakHours}
                        onChange={(e) => setSurgePeakHours(e.target.value)}
                        placeholder="e.g., 18:00-20:00"
                      />
                      <p className="text-sm text-gray-500">Define busy hours (24-hour format)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="surgeMultiplier">Surge Multiplier</Label>
                      <Input
                        id="surgeMultiplier"
                        type="number"
                        step="0.1"
                        value={surgeMultiplier}
                        onChange={(e) => setSurgeMultiplier(e.target.value)}
                      />
                      <p className="text-sm text-gray-500">Price multiplier during peak hours</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h4 className="font-medium text-amber-900 mb-2">Surge Pricing Example</h4>
                    <p className="text-amber-700">
                      During peak hours ({surgePeakHours}), a normal ${baseFare} delivery becomes ${(parseFloat(baseFare) * parseFloat(surgeMultiplier)).toFixed(2)}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Service Zones & Radius
              </CardTitle>
              <CardDescription>Define delivery coverage areas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="serviceRadius">Service Radius (km)</Label>
                <Input
                  id="serviceRadius"
                  type="number"
                  value={serviceRadius}
                  onChange={(e) => setServiceRadius(e.target.value)}
                />
                <p className="text-sm text-gray-500">Maximum distance for deliveries from hub</p>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium mb-3">Custom Zone Pricing</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <div>
                      <div className="font-medium">Downtown Area</div>
                      <div className="text-sm text-gray-600">Higher traffic zone</div>
                    </div>
                    <Input type="number" className="w-32" defaultValue="2.00" step="0.10" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <div>
                      <div className="font-medium">Suburban Area</div>
                      <div className="text-sm text-gray-600">Standard zone</div>
                    </div>
                    <Input type="number" className="w-32" defaultValue="1.50" step="0.10" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <div>
                      <div className="font-medium">Rural Area</div>
                      <div className="text-sm text-gray-600">Extended delivery zone</div>
                    </div>
                    <Input type="number" className="w-32" defaultValue="2.50" step="0.10" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSavePricing} disabled={saving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Pricing Settings'}
        </Button>
      </div>
    </div>
  );
}
