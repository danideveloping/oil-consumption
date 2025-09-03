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
    console.log('Machinery state updated:', Array.isArray(machinery) ? machinery.length : 0, 'items');
  }, [machinery]);

  // Calculate real stats from API data
  const calculateStats = () => {
    const totalMachinery = Array.isArray(machinery) ? machinery.length : 0;
    const activePlaces = Array.isArray(places) ? places.length : 0;
    
    // Calculate monthly consumption (last 30 days)
    const monthlyConsumption = oilData
      .filter(entry => entry.type === 'consumption')
      .reduce((sum, entry) => {
        const litres = typeof entry.litres === 'number' ? entry.litres : parseFloat(entry.litres) || 0;
        return sum + litres;
      }, 0);
    
    // Calculate total capacity
    const totalCapacity = Array.isArray(machinery) ? machinery.reduce((sum, m) => {
      const capacity = typeof m.capacity === 'number' ? m.capacity : parseFloat(m.capacity || '0') || 0;
      return sum + capacity;
    }, 0) : 0;
    
    // Calculate efficiency (consumption vs capacity ratio)
    const efficiency = totalCapacity > 0 ? Math.round((monthlyConsumption / totalCapacity) * 100) : 0;
    
    // Get this month's new machinery count
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const newMachineryThisMonth = Array.isArray(machinery) ? machinery.filter(m => {
      const createdDate = new Date(m.created_at);
      return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear;
    }).length : 0;
    
    const allStats = [
      {
        name: 'Makineri Totale',
        value: totalMachinery.toString(),
        icon: Settings,
        color: 'bg-blue-500',
        change: newMachineryThisMonth > 0 ? `+${newMachineryThisMonth} këtë muaj` : 'Asnjë shtim i ri'
      },
      {
        name: 'Vende Aktive',
        value: activePlaces.toString(),
        icon: MapPin,
        color: 'bg-green-500',
        change: activePlaces > 0 ? 'Të gjitha operacionale' : 'Asnjë vend i konfiguruar'
      },
      {
        name: 'Konsumi Mujor',
        value: `${(monthlyConsumption || 0).toFixed(0)}L`,
        icon: Fuel,
        color: 'bg-yellow-500',
        change: monthlyConsumption > 0 ? '30 ditët e fundit' : 'Asnjë të dhënë konsumi',
        adminOnly: true
      },
      {
        name: 'Kapaciteti Total',
        value: `${(totalCapacity || 0).toFixed(0)}L`,
        icon: TrendingUp,
        color: 'bg-purple-500',
        change: totalCapacity > 0 ? `${efficiency}% përdorim` : 'Asnjë të dhënë kapaciteti',
        adminOnly: true
      }
    ];

    return allStats.filter(stat => !stat.adminOnly || isSuperAdmin());
  };

  const stats = calculateStats();

  // Functions to open table modals for each stat
  const openMachineryTable = () => {
    const machineryColumns = [
      { key: 'name', label: 'Emri' },
      { key: 'type', label: 'Tipi' },
      { key: 'place_name', label: 'Vendndodhja' },
      { 
        key: 'capacity', 
        label: 'Kapaciteti',
        render: (value: any) => value ? `${value}L` : 'N/A'
      },
      { key: 'description', label: 'Përshkrimi' },
      { 
        key: 'created_at', 
        label: 'Krijuar',
        render: (value: any) => new Date(value).toLocaleDateString('en-US', {timeZone: 'Europe/Tirane'})
      }
    ];

    setStatsTableModal({
      isOpen: true,
      title: 'Të Gjitha Makineritë',
      data: machinery,
      columns: machineryColumns,
      searchPlaceholder: 'Kërko makineri...'
    });
  };

  const openPlacesTable = () => {
    const placesColumns = [
      { key: 'name', label: 'Emri' },
      { key: 'location', label: 'Vendndodhja' },
      { key: 'description', label: 'Përshkrimi' },
      { 
        key: 'created_at', 
        label: 'Krijuar',
        render: (value: any) => new Date(value).toLocaleDateString('en-US', {timeZone: 'Europe/Tirane'})
      }
    ];

    setStatsTableModal({
      isOpen: true,
      title: 'Të Gjitha Vendet',
      data: places,
      columns: placesColumns,
      searchPlaceholder: 'Kërko vende...'
    });
  };

  const openConsumptionTable = () => {
    const consumptionData = oilData.filter(entry => entry.type === 'consumption');
    const consumptionColumns = [
      { key: 'machinery_name', label: 'Makineri' },
      { key: 'place_name', label: 'Vendndodhja' },
      { 
        key: 'litres', 
        label: 'Sasia',
        render: (value: any) => `${value}L`
      },
      { 
        key: 'date', 
        label: 'Data & Ora',
        render: (value: any) => {
          const date = new Date(value);
          const dateStr = date.toLocaleDateString('en-US', {timeZone: 'Europe/Tirane'});
          const timeStr = date.getHours() === 0 && date.getMinutes() === 0 ? '' : ` ${date.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', timeZone: 'Europe/Tirane'})}`;
          return dateStr + timeStr;
        }
      },
      { key: 'notes', label: 'Shënime' }
    ];

    setStatsTableModal({
      isOpen: true,
      title: 'Të Dhënat e Konsumit Mujor',
      data: consumptionData,
      columns: consumptionColumns,
      searchPlaceholder: 'Kërko të dhënat e konsumit...'
    });
  };

  const openCapacityTable = () => {
    const capacityColumns = [
      { key: 'name', label: 'Makineri' },
      { key: 'type', label: 'Tipi' },
      { key: 'place_name', label: 'Vendndodhja' },
      { 
        key: 'capacity', 
        label: 'Kapaciteti',
        render: (value: any) => value ? `${value}L` : 'N/A'
      },
      { key: 'description', label: 'Përshkrimi' }
    ];

    setStatsTableModal({
      isOpen: true,
      title: 'Përmbledhja e Kapacitetit të Makinerisë',
      data: machinery,
      columns: capacityColumns,
      searchPlaceholder: 'Kërko kapacitetin e makinerisë...'
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
      place: entry.place_name || 'Vendndodhje e Panjohur'
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
                  <h1 className="text-2xl font-bold mb-2">Mirë se vini në Menaxhimin e Rezervuarëve të Naftës</h1>
        <p className="text-primary-100">Duke ngarkuar të dhënat e panelit...</p>
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
                        <h1 className="text-2xl font-bold mb-2">Mirë se vini në Menaxhimin e Rezervuarëve të Naftës</h1>
        <p className="text-primary-100">
          {isSuperAdmin() 
            ? 'Monitoro makinerinë tënde, gjurmo konsumin dhe optimizo operacionet nga paneli.'
                          : 'Menaxho makinerinë dhe vendet. Shto hyrje naftë për të gjurmuar përdorimin e pajisjeve.'
          }
        </p>
      </div>



      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const handleClick = () => {
            switch (stat.name) {
              case 'Makineri Totale':
                openMachineryTable();
                break;
              case 'Vende Aktive':
                openPlacesTable();
                break;
              case 'Konsumi Mujor':
                openConsumptionTable();
                break;
              case 'Kapaciteti Total':
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
              <h3 className="text-lg font-semibold text-gray-900">Aktiviteti i Fundit</h3>
              <button 
                onClick={() => setIsActivityModalOpen(true)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Shiko të gjitha
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Veprime të Shpejta</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="w-full btn btn-primary flex items-center justify-center"
              >
                <Fuel className="h-4 w-4 mr-2" />
                Shto Hyrje Naftë
              </button>
              <button 
                onClick={() => setIsMachineryModalOpen(true)}
                className="w-full btn btn-secondary flex items-center justify-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                Shto Makineri
              </button>
              <button 
                onClick={() => setIsPlaceModalOpen(true)}
                className="w-full btn btn-secondary flex items-center justify-center"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Shto Vend
              </button>
            </div>
          </div>

          {/* This Month Summary - SuperAdmin Only */}
          {isSuperAdmin() && (
            <div className="card">
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Ky Muaj</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Konsumi Total</span>
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
                  <span className="text-sm text-gray-600">Makineri Aktive</span>
                  <span className="text-sm font-medium">{machinery.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rimbushje</span>
                  <span className="text-sm font-medium">
                    {oilData.filter(entry => entry.type === 'refill').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mirëmbajtje</span>
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