import React from 'react';
import { Button } from './ui/button';
import { AdminView } from './AdminDashboard';
import {
  LayoutDashboard,
  Users,
  Bike,
  Package,
  DollarSign,
  CreditCard,
  BarChart3,
  Tag,
  AlertCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Truck,
} from 'lucide-react';

interface SidebarProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  adminUser: any;
  onLogout: () => void;
}

const menuItems = [
  { id: 'overview' as AdminView, label: 'Overview', icon: LayoutDashboard },
  { id: 'users' as AdminView, label: 'Users', icon: Users },
  { id: 'riders' as AdminView, label: 'Riders', icon: Bike },
  { id: 'deliveries' as AdminView, label: 'Deliveries', icon: Package },
  { id: 'pricing' as AdminView, label: 'Pricing', icon: DollarSign },
  { id: 'payments' as AdminView, label: 'Payments', icon: CreditCard },
  { id: 'reports' as AdminView, label: 'Reports', icon: BarChart3 },
  { id: 'promos' as AdminView, label: 'Promos', icon: Tag },
  { id: 'disputes' as AdminView, label: 'Disputes', icon: AlertCircle },
  { id: 'settings' as AdminView, label: 'Settings', icon: Settings },
];

export function Sidebar({
  currentView,
  onViewChange,
  collapsed,
  onToggleCollapse,
  adminUser,
  onLogout,
}: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">DeliveryHub</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className={collapsed ? 'w-full' : ''}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={`w-full justify-start ${collapsed ? 'px-2' : 'px-3'} ${
                    isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                  }`}
                  onClick={() => onViewChange(item.id)}
                  title={collapsed ? item.label : ''}
                >
                  <Icon className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-gray-200">
          {!collapsed && adminUser && (
            <div className="px-3 py-2 mb-2 text-sm">
              <div className="font-medium text-gray-900 truncate">{adminUser.email}</div>
              <div className="text-gray-500">Administrator</div>
            </div>
          )}
          <Button
            variant="ghost"
            className={`w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 ${
              collapsed ? 'px-2' : 'px-3'
            }`}
            onClick={onLogout}
            title={collapsed ? 'Logout' : ''}
          >
            <LogOut className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
