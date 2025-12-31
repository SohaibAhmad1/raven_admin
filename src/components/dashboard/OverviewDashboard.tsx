import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Package, Users, Bike, DollarSign, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { supabase } from '../../utils/supabase/client';

export function OverviewDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch user count from Supabase profiles
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      // Try to fetch other stats from existing edge function
      let otherStats = {};
      try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-d5a6a6f2/dashboard/stats`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          otherStats = await response.json();
        }
      } catch (e) {
        console.warn('Could not fetch other dashboard stats', e);
      }

      setStats({
        ...otherStats,
        totalUsers: count || 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Deliveries',
      value: stats?.totalDeliveries || 0,
      icon: Package,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Active Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Active Riders',
      value: stats?.activeRiders || 0,
      icon: Bike,
      color: 'bg-purple-500',
      change: '+5%',
    },
    {
      title: 'Total Earnings',
      value: `$${stats?.totalEarnings || 0}`,
      icon: DollarSign,
      color: 'bg-amber-500',
      change: '+18%',
    },
  ];

  const kpiCards = [
    {
      title: 'Success Rate',
      value: `${stats?.successRate || 98}%`,
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    {
      title: 'Avg Delivery Time',
      value: `${stats?.avgDeliveryTime || 28} min`,
      icon: Clock,
      color: 'text-blue-600',
    },
    {
      title: 'Growth Rate',
      value: '+15.3%',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Real-time summary of your delivery operations</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                </div>
                <div className="text-2xl font-semibold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* KPI Cards */}
      <div className="mb-8">
        <h2 className="text-gray-900 mb-4">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Icon className={`w-8 h-8 ${kpi.color}`} />
                    <div>
                      <div className="text-2xl font-semibold text-gray-900">{kpi.value}</div>
                      <div className="text-sm text-gray-600">{kpi.title}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentDeliveries?.map((delivery: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <div className="font-medium text-gray-900">#{delivery.id}</div>
                    <div className="text-sm text-gray-600">{delivery.route}</div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-2 py-1 rounded text-xs ${delivery.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      delivery.status === 'in-transit' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                      {delivery.status}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{delivery.time}</div>
                  </div>
                </div>
              )) || (
                  <div className="text-center text-gray-500 py-8">No recent deliveries</div>
                )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.topRiders?.map((rider: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="font-medium text-indigo-600">{rider.name[0]}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{rider.name}</div>
                      <div className="text-sm text-gray-600">{rider.deliveries} deliveries</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${rider.earnings}</div>
                    <div className="text-sm text-gray-600">{rider.rating} ★</div>
                  </div>
                </div>
              )) || (
                  <div className="text-center text-gray-500 py-8">No rider data available</div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
