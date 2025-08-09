import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Settings, 
  MapPin, 
  Calendar,
  BarChart3,
  User,
  LogOut,
  Fuel
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
// import { useFilter } from '../contexts/FilterContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isSuperAdmin } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Year/Month Data', href: '/year-month-data', icon: Calendar },
    { name: 'Machinery', href: '/machinery', icon: Settings },
    { name: 'Places', href: '/places', icon: MapPin },
    ...(isSuperAdmin() ? [
      { name: 'Data & Reports', href: '/data', icon: BarChart3 }
    ] : []),
  ];



  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
              {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 flex z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </div>
        )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 flex flex-col w-80 sm:w-72 bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 z-40
      `}>
        {/* Logo and close button */}
        <div className="flex items-center justify-between flex-shrink-0 px-6">
          <div className="flex items-center">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Fuel className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-lg font-semibold text-gray-900">
              Oil Tank Manager
            </span>
          </div>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* User info */}
        <div className="mt-6 px-6">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="bg-primary-100 p-2 rounded-full">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${isCurrentPath(item.href)
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon 
                  className={`
                    mr-3 h-5 w-5 
                    ${isCurrentPath(item.href) ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `} 
                />
                {item.name}
              </Link>
            );
          })}
        </nav>



        {/* Logout button */}
        <div className="px-4 pb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
                {navigation.find(item => isCurrentPath(item.href))?.name || 'Dashboard'}
              </h1>
            </div>
            
            <div className="ml-2 sm:ml-4 flex items-center">
              <div className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Welcome back, <span className="font-medium">{user?.username}</span>
              </div>
              <div className="text-xs text-gray-600 sm:hidden">
                <span className="font-medium">{user?.username}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 