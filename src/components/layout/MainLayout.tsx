import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../services/supabase';
import {
  Home,
  CreditCard,
  Receipt,
  Upload,
  PieChart,
  BarChart3,
  LogOut,
  DollarSign,
} from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
  user: User;
}

const MainLayout = ({ children, user }: MainLayoutProps) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Accounts', href: '/accounts', icon: CreditCard },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Import CSV', href: '/import', icon: Upload },
    { name: 'Budgets', href: '/budgets', icon: PieChart },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo/Title */}
          <div className="flex items-center gap-2 px-6 py-4 border-b">
            <DollarSign className="w-8 h-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">Money Manager</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="px-4 py-4 border-t">
            <div className="flex items-center justify-between px-4 py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500">Personal Account</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
