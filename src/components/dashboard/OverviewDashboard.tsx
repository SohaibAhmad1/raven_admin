import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, DollarSign, CheckCircle2, Clock } from 'lucide-react';
import { formatApiError, getPricingList, getUsers } from '../../lib/api';

type DashboardStats = {
  totalUsers: number;
  activeUsers: number;
  pricingEntries: number;
  activeSurgeEntries: number;
};

export function OverviewDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    pricingEntries: 0,
    activeSurgeEntries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');

        const [usersData, pricingData] = await Promise.all([getUsers(), getPricingList()]);
        const activeUsers = usersData.users.filter((user) => user.is_active).length;
        const activeSurgeEntries = pricingData.filter((entry) => entry.surge_active).length;

        setStats({
          totalUsers: usersData.count,
          activeUsers,
          pricingEntries: pricingData.length,
          activeSurgeEntries,
        });
      } catch (err: unknown) {
        setError(formatApiError(err));
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
    const interval = setInterval(() => {
      void fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      subtitle: `${stats.activeUsers} active`,
    },
    {
      title: 'Pricing Entries',
      value: stats.pricingEntries,
      icon: DollarSign,
      color: 'bg-amber-500',
      subtitle: 'Configured pricing rows',
    },
    {
      title: 'Active Surge Entries',
      value: stats.activeSurgeEntries,
      icon: CheckCircle2,
      color: 'bg-green-500',
      subtitle: 'Surge currently enabled',
    },
    {
      title: 'Refresh Interval',
      value: '30s',
      icon: Clock,
      color: 'bg-indigo-500',
      subtitle: 'Auto-updating dashboard',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Snapshot from admin users and pricing endpoints</p>
        {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
      </div>

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
                </div>
                <div className="text-2xl font-semibold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
                <div className="text-xs text-gray-500 mt-2">{stat.subtitle}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backend Integration Status</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 space-y-2">
          <p>Auth integration: login, me, and change-password are connected.</p>
          <p>User management: list, detail, status update, and delete are connected.</p>
          <p>Pricing management: list, detail, and update are connected.</p>
        </CardContent>
      </Card>
    </div>
  );
}

