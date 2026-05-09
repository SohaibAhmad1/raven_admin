import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { OverviewDashboard } from './dashboard/OverviewDashboard';
import { UserManagement } from './dashboard/UserManagement';
import { RiderManagement } from './dashboard/RiderManagement';
import { DeliveryManagement } from './dashboard/DeliveryManagement';
import { PricingControl } from './dashboard/PricingControl';
import { PaymentsCommissions } from './dashboard/PaymentsCommissions';
import { ReportsAnalytics } from './dashboard/ReportsAnalytics';
import { PromoManagement } from './dashboard/PromoManagement';
import { DisputeManagement } from './dashboard/DisputeManagement';
import { SystemConfiguration } from './dashboard/SystemConfiguration';
import type { User } from '../lib/models';

export type AdminView =
  | 'overview'
  | 'users'
  | 'riders'
  | 'deliveries'
  | 'pricing'
  | 'payments'
  | 'reports'
  | 'promos'
  | 'disputes'
  | 'settings';

export function AdminDashboard({ adminUser, onLogout }: { adminUser: User | null; onLogout: () => void }) {
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewDashboard />;
      case 'users':
        return <UserManagement />;
      case 'riders':
        return <RiderManagement />;
      case 'deliveries':
        return <DeliveryManagement />;
      case 'pricing':
        return <PricingControl />;
      case 'payments':
        return <PaymentsCommissions />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'promos':
        return <PromoManagement />;
      case 'disputes':
        return <DisputeManagement />;
      case 'settings':
        return <SystemConfiguration />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        adminUser={adminUser}
        onLogout={onLogout}
      />
      <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {renderView()}
      </main>
    </div>
  );
}
