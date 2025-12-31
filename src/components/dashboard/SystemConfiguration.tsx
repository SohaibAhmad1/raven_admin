import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Settings, Bell, MapPin, Package, Bike, Save } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

export function SystemConfiguration() {
  const [settings, setSettings] = useState({
    appName: 'DeliveryHub',
    supportEmail: 'support@deliveryhub.com',
    supportPhone: '+1 (555) 123-4567',
    notifications: {
      orderCreated: true,
      orderAssigned: true,
      orderDelivered: true,
      paymentReceived: true,
    },
    autoAssign: true,
    maxDeliveryRadius: '25',
    operatingHours: {
      start: '06:00',
      end: '22:00',
    },
  });

  const [vehicleTypes, setVehicleTypes] = useState([
    { id: 1, name: 'Motorcycle', active: true },
    { id: 2, name: 'Car', active: true },
    { id: 3, name: 'Van', active: true },
    { id: 4, name: 'Bicycle', active: false },
  ]);

  const [parcelCategories, setParcelCategories] = useState([
    { id: 1, name: 'Documents', active: true },
    { id: 2, name: 'Food & Beverages', active: true },
    { id: 3, name: 'Electronics', active: true },
    { id: 4, name: 'Clothing', active: true },
    { id: 5, name: 'Fragile Items', active: true },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/settings`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings({ ...settings, ...data.settings });
        }
        if (data.vehicleTypes) {
          setVehicleTypes(data.vehicleTypes);
        }
        if (data.parcelCategories) {
          setParcelCategories(data.parcelCategories);
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/settings`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            settings,
            vehicleTypes,
            parcelCategories,
          }),
        }
      );

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err: any) {
      console.error('Error saving settings:', err);
      toast.error(err.message || 'Failed to save settings');
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
        <p className="text-gray-600">Manage app settings, notifications, and static data</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Settings</TabsTrigger>
          <TabsTrigger value="data">Static Data</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic application configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appName">Application Name</Label>
                  <Input
                    id="appName"
                    value={settings.appName}
                    onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Support Phone</Label>
                  <Input
                    id="supportPhone"
                    type="tel"
                    value={settings.supportPhone}
                    onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxRadius">Max Delivery Radius (km)</Label>
                  <Input
                    id="maxRadius"
                    type="number"
                    value={settings.maxDeliveryRadius}
                    onChange={(e) => setSettings({ ...settings, maxDeliveryRadius: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-4">Operating Hours</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={settings.operatingHours.start}
                      onChange={(e) => setSettings({
                        ...settings,
                        operatingHours: { ...settings.operatingHours, start: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={settings.operatingHours.end}
                      onChange={(e) => setSettings({
                        ...settings,
                        operatingHours: { ...settings.operatingHours, end: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Control when notifications are sent to users and riders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <div className="font-medium">Order Created</div>
                    <div className="text-sm text-gray-600">Notify user when order is created</div>
                  </div>
                  <Switch
                    checked={settings.notifications.orderCreated}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, orderCreated: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <div className="font-medium">Order Assigned</div>
                    <div className="text-sm text-gray-600">Notify rider when order is assigned</div>
                  </div>
                  <Switch
                    checked={settings.notifications.orderAssigned}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, orderAssigned: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <div className="font-medium">Order Delivered</div>
                    <div className="text-sm text-gray-600">Notify user when order is delivered</div>
                  </div>
                  <Switch
                    checked={settings.notifications.orderDelivered}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, orderDelivered: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <div className="font-medium">Payment Received</div>
                    <div className="text-sm text-gray-600">Notify rider when payment is processed</div>
                  </div>
                  <Switch
                    checked={settings.notifications.paymentReceived}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, paymentReceived: checked }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Configuration
              </CardTitle>
              <CardDescription>Configure delivery assignment and routing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">Auto-Assign Deliveries</div>
                    <div className="text-sm text-gray-600">
                      Automatically assign deliveries to nearest available rider
                    </div>
                  </div>
                  <Switch
                    checked={settings.autoAssign}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoAssign: checked })}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded">
                  <h4 className="font-medium text-blue-900 mb-2">Manual Dispatcher</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    When auto-assign is disabled, you can manually assign deliveries from the Delivery Management page.
                  </p>
                  <Button variant="outline" size="sm">
                    Configure Dispatcher Rules
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bike className="w-5 h-5" />
                Vehicle Types
              </CardTitle>
              <CardDescription>Manage available vehicle types for riders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vehicleTypes.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">{vehicle.name}</span>
                    <Switch
                      checked={vehicle.active}
                      onCheckedChange={(checked) => {
                        setVehicleTypes(vehicleTypes.map(v =>
                          v.id === vehicle.id ? { ...v, active: checked } : v
                        ));
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Parcel Categories
              </CardTitle>
              <CardDescription>Manage available parcel categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {parcelCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">{category.name}</span>
                    <Switch
                      checked={category.active}
                      onCheckedChange={(checked) => {
                        setParcelCategories(parcelCategories.map(c =>
                          c.id === category.id ? { ...c, active: checked } : c
                        ));
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSaveSettings} disabled={saving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}
