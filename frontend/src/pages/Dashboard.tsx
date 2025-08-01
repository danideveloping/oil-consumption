import React, { useState, useEffect } from 'react';
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
import RecentActivityModal from '../components/RecentActivityModal';
import StatsTableModal from '../components/StatsTableModal';
import { useAuth } from '../contexts/AuthContext';
import { useFilter } from '../contexts/FilterContext';
import { machineryAPI, Machinery, placesAPI, Place, dataAPI, OilData } from '../services/api';

const Dashboard: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMachineryModalOpen, setIsMachineryModalOpen] = useState(false);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [machinery, setMachinery] = useState<Machinery[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [oilData, setOilData] = useState<OilData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statsTableModal, setStatsTableModal] = useState<{
    isOpen: boolean;
    title: string;
    data: any[];
    columns: any[];
    searchPlaceholder: string;
  }>({
    isOpen: false,
    title: '',
    data: [],
    columns: [],
    searchPlaceholder: ''
  });
  const { selectedYear, selectedMonth } = useFilter();

  const handleAddSuccess = () => {
    console.log('Oil entry added successfully');
    // Reload oil data
    const loadOilData = async () => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const oilResponse = await dataAPI.getAll({
          start_date: thirtyDaysAgo.toISOString().split('T')[0],
          limit: 100
        });
        setOilData(oilResponse.data?.data || []);
        
        // Trigger event to notify Year/Month Data page to refresh
        window.dispatchEvent(new CustomEvent('oilEntryAdded'));
        localStorage.setItem('oilEntryAdded', Date.now().toString());
      } catch (error) {
        console.error('Error reloading oil data:', error);
      }
    };
    loadOilData();
  };

  const handleMachinerySuccess = async () => {
    console.log('Machinery added successfully - refreshing dashboard data...');
    console.log('Current machinery count before refresh:', machinery.length);
    
    // Add a small delay to ensure the backend has processed the new machinery
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Reload machinery data
      const machineryResponse = await machineryAPI.getAll();
      console.log('New machinery data:', machineryResponse.data);
      console.log('New machinery count:', machineryResponse.data?.length || 0);
      
      setMachinery(machineryResponse.data || []);
      
      // Reload places data
      const placesResponse = await placesAPI.getAll();
      setPlaces(placesResponse.data || []);
      
      console.log('Dashboard data refreshed successfully');
    } catch (error) {
      console.error('Error reloading dashboard data:', error);
    }
  };

  const handlePlaceSuccess = () => {
    console.log('Place added successfully');
    // Reload places data
    const loadPlaces = async () => {
      try {
        const placesResponse = await placesAPI.getAll();
        setPlaces(placesResponse.data || []);
      } catch (error) {
        console.error('Error reloading places data:', error);
      }
    };
    loadPlaces();
  };

  // Load all dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Load machinery data
        const machineryResponse = await machineryAPI.getAll();
        setMachinery(machineryResponse.data || []);
        
        // Load places data
        const placesResponse = await placesAPI.getAll();
        setPlaces(placesResponse.data || []);
        
        // Load oil data with year/month filtering
        let oilParams: any = { limit: 100 };
        
        if (selectedYear && selectedMonth) {
          // Filter by specific year and month
          const startDate = `${selectedYear}-${selectedMonth}-01`;
          const endDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).toISOString().split('T')[0];
          oilParams.start_date = startDate;
          oilParams.end_date = endDate;
        } else if (selectedYear) {
          // Filter by year only
          const startDate = `${selectedYear}-01-01`;
          const endDate = `${selectedYear}-12-31`;
          oilParams.start_date = startDate;
          oilParams.end_date = endDate;
        } else {
          // Default: last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          oilParams.start_date = thirtyDaysAgo.toISOString().split('T')[0];
        }
        
        const oilResponse = await dataAPI.getAll(oilParams);
        setOilData(oilResponse.data?.data || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setMachinery([]);
        setPlaces([]);
        setOilData([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, [selectedYear, selectedMonth]);

  // Debug: Monitor machinery state changes
  useEffect(() => {
    console.log('Machinery state updated:', machinery.length, 'items');
  }, [machinery]);

  // Calculate real stats from API data
  const calculateStats = () => {
    const totalMachinery = machinery.length;
    const activePlaces = places.length;
    
    // Calculate monthly consumption (last 30 days)
    const monthlyConsumption = oilData
      .filter(entry => entry.type === 'consumption')
      .reduce((sum, entry) => {
        const litres = typeof entry.litres === 'number' ? entry.litres : parseFloat(entry.litres) || 0;
        return sum + litres;
      }, 0);
    
    // Calculate total capacity
    const totalCapacity = machinery.reduce((sum, m) => {
      const capacity = typeof m.capacity === 'number' ? m.capacity : parseFloat(m.capacity as string) || 0;
      return sum + capacity;
    }, 0);
    
    // Calculate efficiency (consumption vs capacity ratio)
    const efficiency = totalCapacity > 0 ? Math.round((monthlyConsumption / totalCapacity) * 100) : 0;
    
    // Get this month's new machinery count
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const newMachineryThisMonth = machinery.filter(m => {
      const createdDate = new Date(m.created_at);
      return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear;
    }).length;
    
    const allStats = [
      {
        name: 'Total Machinery',
        value: totalMachinery.toString(),
        icon: Settings,
        color: 'bg-blue-500',
        change: newMachineryThisMonth > 0 ? `+${newMachineryThisMonth} this month` : 'No new additions'
      },
      {
        name: 'Active Places',
        value: activePlaces.toString(),
        icon: MapPin,
        color: 'bg-green-500',
        change: activePlaces > 0 ? 'All operational' : 'No places configured'
      },
      {
        name: 'Monthly Consumption',
        value: `${(monthlyConsumption || 0).toFixed(0)}L`,
        icon: Fuel,
        color: 'bg-yellow-500',
        change: monthlyConsumption > 0 ? 'Last 30 days' : 'No consumption data',
        adminOnly: true
      },
      {
        name: 'Total Capacity',
        value: `${(totalCapacity || 0).toFixed(0)}L`,
        icon: TrendingUp,
        color: 'bg-purple-500',
        change: totalCapacity > 0 ? `${efficiency}% utilization` : 'No capacity data',
        adminOnly: true
      }
    ];

    return allStats.filter(stat => !stat.adminOnly || isSuperAdmin());
  };

  const stats = calculateStats();

  // Functions to open table modals for each stat
  const openMachineryTable = () => {
    const machineryColumns = [
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'place_name', label: 'Location' },
      { 
        key: 'capacity', 
        label: 'Capacity',
        render: (value: any) => value ? `${value}L` : 'N/A'
      },
      { key: 'description', label: 'Description' },
      { 
        key: 'created_at', 
        label: 'Created',
        render: (value: any) => new Date(value).toLocaleDateString('en-US', {timeZone: 'Europe/Tirane'})
      }
    ];

    setStatsTableModal({
      isOpen: true,
      title: 'All Machinery',
      data: machinery,
      columns: machineryColumns,
      searchPlaceholder: 'Search machinery...'
    });
  };

  const openPlacesTable = () => {
    const placesColumns = [
      { key: 'name', label: 'Name' },
      { key: 'location', label: 'Location' },
      { key: 'description', label: 'Description' },
      { 
        key: 'created_at', 
        label: 'Created',
        render: (value: any) => new Date(value).toLocaleDateString('en-US', {timeZone: 'Europe/Tirane'})
      }
    ];

    setStatsTableModal({
      isOpen: true,
      title: 'All Places',
      data: places,
      columns: placesColumns,
      searchPlaceholder: 'Search places...'
    });
  };

  const openConsumptionTable = () => {
    const consumptionData = oilData.filter(entry => entry.type === 'consumption');
    const consumptionColumns = [
      { key: 'machinery_name', label: 'Machinery' },
      { key: 'place_name', label: 'Location' },
      { 
        key: 'litres', 
        label: 'Amount',
        render: (value: any) => `${value}L`
      },
      { 
        key: 'date', 
        label: 'Date & Time',
        render: (value: any) => {
          const date = new Date(value);
          const dateStr = date.toLocaleDateString('en-US', {timeZone: 'Europe/Tirane'});
          const timeStr = date.getHours() === 0 && date.getMinutes() === 0 ? '' : ` ${date.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', timeZone: 'Europe/Tirane'})}`;
          return dateStr + timeStr;
        }
      },
      { key: 'notes', label: 'Notes' }
    ];

    setStatsTableModal({
      isOpen: true,
      title: 'Monthly Consumption Data',
      data: consumptionData,
      columns: consumptionColumns,
      searchPlaceholder: 'Search consumption data...'
    });
  };

  const openCapacityTable = () => {
    const capacityColumns = [
      { key: 'name', label: 'Machinery' },
      { key: 'type', label: 'Type' },
      { key: 'place_name', label: 'Location' },
      { 
        key: 'capacity', 
        label: 'Capacity',
        render: (value: any) => value ? `${value}L` : 'N/A'
      },
      { key: 'description', label: 'Description' }
    ];

    setStatsTableModal({
      isOpen: true,
      title: 'Machinery Capacity Overview',
      data: machinery,
      columns: capacityColumns,
      searchPlaceholder: 'Search machinery capacity...'
    });
  };

  // Get recent activity from real oil data
  const recentActivity = oilData
    .slice(0, 3) // Show only the 3 most recent entries
    .map(entry => ({
      id: entry.id,
      type: entry.type,
      machinery: entry.machinery_name,
      amount: `${entry.litres}L`,
      date: entry.date,
      place: entry.place_name || 'Unknown Location'
    }));

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome to Oil Tank Management</h1>
          <p className="text-primary-100">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
          const handleClick = () => {
            switch (stat.name) {
              case 'Total Machinery':
                openMachineryTable();
                break;
              case 'Active Places':
                openPlacesTable();
                break;
              case 'Monthly Consumption':
                openConsumptionTable();
                break;
              case 'Total Capacity':
                openCapacityTable();
                break;
              default:
                break;
            }
          };
          
          return (
            <div 
              key={stat.name} 
              className="card cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={handleClick}
            >
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
              <button 
                onClick={() => setIsActivityModalOpen(true)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
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
                    <p className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleDateString('en-US', {timeZone: 'Europe/Tirane'})}
                      {new Date(activity.date).getHours() === 0 && new Date(activity.date).getMinutes() === 0 ? '' : ` ${new Date(activity.date).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', timeZone: 'Europe/Tirane'})}`}
                    </p>
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
                  <span className="text-sm font-medium">
                    {(oilData
                      .filter(entry => entry.type === 'consumption')
                      .reduce((sum, entry) => {
                        const litres = typeof entry.litres === 'number' ? entry.litres : parseFloat(entry.litres) || 0;
                        return sum + litres;
                      }, 0) || 0).toFixed(0)} L
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Machinery</span>
                  <span className="text-sm font-medium">{machinery.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Refills</span>
                  <span className="text-sm font-medium">
                    {oilData.filter(entry => entry.type === 'refill').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Maintenance</span>
                  <span className="text-sm font-medium">
                    {oilData.filter(entry => entry.type === 'maintenance').length}
                  </span>
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
        existingMachinery={machinery}
      />

      {/* Add Place Modal */}
      <AddPlaceModal
        isOpen={isPlaceModalOpen}
        onClose={() => setIsPlaceModalOpen(false)}
        onSuccess={handlePlaceSuccess}
      />

      {/* Recent Activity Modal */}
      <RecentActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
      />

      {/* Stats Table Modal */}
      <StatsTableModal
        isOpen={statsTableModal.isOpen}
        onClose={() => setStatsTableModal(prev => ({ ...prev, isOpen: false }))}
        title={statsTableModal.title}
        data={statsTableModal.data}
        columns={statsTableModal.columns}
        searchPlaceholder={statsTableModal.searchPlaceholder}
      />
    </div>
  );
};

export default Dashboard; 