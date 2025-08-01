import React, { useState } from 'react';
import { 
  Fuel, 
  Settings, 
  MapPin, 
  TrendingUp, 
  Calendar,
  BarChart3
} from 'lucide-react';
import AddOilEntryModal from '../components/AddOilEntryModal';
import AddMachineryModal from '../components/AddMachineryModal';
import AddPlaceModal from '../components/AddPlaceModal';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMachineryModalOpen, setIsMachineryModalOpen] = useState(false);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);

  const handleAddSuccess = () => {
    // Optionally refresh dashboard data here
    console.log('Oil entry added successfully');
  };

  const handleMachinerySuccess = () => {
    // Optionally refresh machinery data here
    console.log('Machinery added successfully');
  };

  const handlePlaceSuccess = () => {
    // Optionally refresh place data here
    console.log('Place added successfully');
  };

  // Mock data - in a real app, this would come from API calls
  const allStats = [
    {
      name: 'Total Machinery',
      value: '12',
      icon: Settings,
      color: 'bg-blue-500',
      change: '+2 this month'
    },
    {
      name: 'Active Places',
      value: '4',
      icon: MapPin,
      color: 'bg-green-500',
      change: 'All operational'
    },
    {
      name: 'Monthly Consumption',
      value: '2,847L',
      icon: Fuel,
      color: 'bg-yellow-500',
      change: '-12% from last month',
      adminOnly: true
    },
    {
      name: 'Efficiency Score',
      value: '94%',
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+5% improvement',
      adminOnly: true
    }
  ];

  // Filter stats based on user role
  const stats = allStats.filter(stat => !stat.adminOnly || isSuperAdmin());

  const recentActivity = [
    {
      id: 1,
      type: 'consumption',
      machinery: 'Excavator #3',
      amount: '45L',
      date: '2024-01-15',
      place: 'Construction Site A'
    },
    {
      id: 2,
      type: 'refill',
      machinery: 'Generator #1',
      amount: '120L',
      date: '2024-01-14',
      place: 'Warehouse B'
    },
    {
      id: 3,
      type: 'maintenance',
      machinery: 'Crane #2',
      amount: '25L',
      date: '2024-01-14',
      place: 'Port Terminal'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'consumption':
        return <Fuel className="h-4 w-4 text-red-500" />;
      case 'refill':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'maintenance':
        return <Settings className="h-4 w-4 text-blue-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'consumption':
        return 'bg-red-100 text-red-800';
      case 'refill':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to Oil Tank Management</h1>
        <p className="text-primary-100">
          {isSuperAdmin() 
            ? 'Monitor your machinery, track consumption, and optimize operations from your dashboard.'
            : 'Manage your machinery and places. Add oil entries to track your equipment usage.'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </button>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.machinery}</p>
                      <p className="text-xs text-gray-500">{activity.place}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                      {activity.type}
                    </span>
                    <p className="text-sm font-medium text-gray-900 mt-1">{activity.amount}</p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="w-full btn btn-primary flex items-center justify-center"
              >
                <Fuel className="h-4 w-4 mr-2" />
                Add Oil Entry
              </button>
              <button 
                onClick={() => setIsMachineryModalOpen(true)}
                className="w-full btn btn-secondary flex items-center justify-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                Add Machinery
              </button>
              <button 
                onClick={() => setIsPlaceModalOpen(true)}
                className="w-full btn btn-secondary flex items-center justify-center"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Add Place
              </button>
            </div>
          </div>

          {/* This Month Summary - SuperAdmin Only */}
          {isSuperAdmin() && (
            <div className="card">
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">This Month</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Consumption</span>
                  <span className="text-sm font-medium">2,847 L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Machinery</span>
                  <span className="text-sm font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Refills</span>
                  <span className="text-sm font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Maintenance</span>
                  <span className="text-sm font-medium">3</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Oil Entry Modal */}
      <AddOilEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Add Machinery Modal */}
      <AddMachineryModal
        isOpen={isMachineryModalOpen}
        onClose={() => setIsMachineryModalOpen(false)}
        onSuccess={handleMachinerySuccess}
      />

      {/* Add Place Modal */}
      <AddPlaceModal
        isOpen={isPlaceModalOpen}
        onClose={() => setIsPlaceModalOpen(false)}
        onSuccess={handlePlaceSuccess}
      />
    </div>
  );
};

export default Dashboard; 