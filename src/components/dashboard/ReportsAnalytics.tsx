import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Download, BarChart3, TrendingUp, MapPin, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

export function ReportsAnalytics() {
  const [dateRange, setDateRange] = useState('week');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/analytics?range=${dateRange}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (type: string) => {
    toast.success(`${type} report exported successfully`);
  };

  // Sample data for charts
  const deliveryTrendsData = [
    { day: 'Mon', deliveries: 45, earnings: 850 },
    { day: 'Tue', deliveries: 52, earnings: 990 },
    { day: 'Wed', deliveries: 61, earnings: 1150 },
    { day: 'Thu', deliveries: 58, earnings: 1080 },
    { day: 'Fri', deliveries: 72, earnings: 1340 },
    { day: 'Sat', deliveries: 85, earnings: 1620 },
    { day: 'Sun', deliveries: 68, earnings: 1280 },
  ];

  const zoneDistributionData = [
    { name: 'Downtown', value: 35, color: '#3b82f6' },
    { name: 'Suburban', value: 28, color: '#10b981' },
    { name: 'Industrial', value: 22, color: '#f59e0b' },
    { name: 'Residential', value: 15, color: '#8b5cf6' },
  ];

  const peakHoursData = [
    { hour: '6AM', deliveries: 12 },
    { hour: '9AM', deliveries: 35 },
    { hour: '12PM', deliveries: 58 },
    { hour: '3PM', deliveries: 42 },
    { hour: '6PM', deliveries: 72 },
    { hour: '9PM', deliveries: 28 },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">Analyze performance and export detailed reports</p>
          </div>
          <div className="flex gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="zones">Delivery Zones</TabsTrigger>
          <TabsTrigger value="riders">Rider Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Delivery Trends */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Delivery & Earnings Trends</CardTitle>
                  <CardDescription>Daily performance over the selected period</CardDescription>
                </div>
                <Button variant="outline" onClick={() => exportReport('Delivery Trends')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={deliveryTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="deliveries" stroke="#3b82f6" strokeWidth={2} name="Deliveries" />
                  <Line yAxisId="right" type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} name="Earnings ($)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Peak Hours Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Peak Hours Analysis
              </CardTitle>
              <CardDescription>Busiest delivery times throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="deliveries" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Zone Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Zone Distribution
                </CardTitle>
                <CardDescription>Breakdown of deliveries by area</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={zoneDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {zoneDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Zone Performance */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Zone Performance Metrics</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => exportReport('Zone Performance')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {zoneDistributionData.map((zone) => (
                    <div key={zone.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{zone.name}</span>
                        <span className="text-sm text-gray-600">{zone.value}% of total</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${zone.value}%`, backgroundColor: zone.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Routes */}
          <Card>
            <CardHeader>
              <CardTitle>Most Active Routes</CardTitle>
              <CardDescription>Top delivery corridors by volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { route: 'Downtown → Suburban District A', count: 156, avgTime: '22 min' },
                  { route: 'Industrial Zone → Downtown', count: 134, avgTime: '28 min' },
                  { route: 'Residential Area B → Shopping Center', count: 112, avgTime: '18 min' },
                  { route: 'Airport → Downtown', count: 98, avgTime: '35 min' },
                  { route: 'University → Residential Area C', count: 87, avgTime: '15 min' },
                ].map((route, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{route.route}</div>
                      <div className="text-sm text-gray-600">{route.count} deliveries</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Avg. Time</div>
                      <div className="font-medium">{route.avgTime}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="riders" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Rider Productivity Analysis</CardTitle>
                  <CardDescription>Performance comparison across delivery partners</CardDescription>
                </div>
                <Button variant="outline" onClick={() => exportReport('Rider Performance')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'John Smith', deliveries: 142, rating: 4.9, earnings: 2840, efficiency: 95 },
                  { name: 'Sarah Johnson', deliveries: 138, rating: 4.8, earnings: 2760, efficiency: 92 },
                  { name: 'Mike Wilson', deliveries: 125, rating: 4.7, earnings: 2500, efficiency: 88 },
                  { name: 'Emily Davis', deliveries: 118, rating: 4.9, earnings: 2360, efficiency: 90 },
                  { name: 'David Brown', deliveries: 112, rating: 4.6, earnings: 2240, efficiency: 85 },
                ].map((rider, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-4 p-4 border rounded">
                    <div>
                      <div className="text-sm text-gray-600">Rider</div>
                      <div className="font-medium">{rider.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Deliveries</div>
                      <div className="font-medium">{rider.deliveries}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Rating</div>
                      <div className="font-medium">{rider.rating} ★</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Earnings</div>
                      <div className="font-medium">${rider.earnings}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Efficiency</div>
                      <div className="font-medium">{rider.efficiency}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">$24,580</div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">$3,687</div>
                    <div className="text-sm text-gray-600">Platform Commission</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">$20,893</div>
                    <div className="text-sm text-gray-600">Rider Payouts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Financial Summary</CardTitle>
                <Button variant="outline" onClick={() => exportReport('Financial Summary')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                  <div>
                    <div className="text-sm text-gray-600">Total Deliveries</div>
                    <div className="text-xl font-semibold">1,247</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Average Delivery Value</div>
                    <div className="text-xl font-semibold">$19.71</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 border rounded">
                  <div>
                    <div className="text-sm text-gray-600">Commission Rate</div>
                    <div className="text-xl font-semibold">15%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Average Commission</div>
                    <div className="text-xl font-semibold">$2.96</div>
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
