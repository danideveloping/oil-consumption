import React, { useState, useEffect } from 'react';
import { Plus, Calendar, BarChart3, Fuel, Filter, Download, ChevronDown } from 'lucide-react';
import AddOilEntryModal from '../components/AddOilEntryModal';
import LoadingSpinner from '../components/LoadingSpinner';
import PastMonthsData from '../components/PastMonthsData';
import { dataAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const DataPage: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [realDailyData, setRealDailyData] = useState<any[]>([]);
  const [realMonthlyData, setRealMonthlyData] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);

  // Close month selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.month-selector')) {
        setIsMonthSelectorOpen(false);
      }
    };

    if (isMonthSelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMonthSelectorOpen]);

  // Mock daily data
  const dailyData = [
    {
      id: 1,
      date: '2024-01-15',
      machinery_name: 'Excavator #3',
      machinery_type: 'Heavy Equipment',
      place_name: 'Construction Site A',
      litres: 45,
      type: 'consumption'
    },
    {
      id: 2,
      date: '2024-01-15',
      machinery_name: 'Generator #1',
      machinery_type: 'Power Generation',
      place_name: 'Warehouse B',
      litres: 25,
      type: 'consumption'
    },
    {
      id: 3,
      date: '2024-01-14',
      machinery_name: 'Crane #2',
      machinery_type: 'Lifting Equipment',
      place_name: 'Port Terminal',
      litres: 120,
      type: 'refill'
    },
    {
      id: 4,
      date: '2024-01-14',
      machinery_name: 'Excavator #3',
      machinery_type: 'Heavy Equipment',
      place_name: 'Construction Site A',
      litres: 15,
      type: 'maintenance'
    }
  ];

  // Mock monthly data
  const monthlyData = [
    {
      month: '2024-01',
      machinery_name: 'Excavator #3',
      machinery_type: 'Heavy Equipment',
      place_name: 'Construction Site A',
      total_litres: 1250,
      avg_daily_litres: 40.3,
      record_count: 31
    },
    {
      month: '2024-01',
      machinery_name: 'Generator #1',
      machinery_type: 'Power Generation',
      place_name: 'Warehouse B',
      total_litres: 780,
      avg_daily_litres: 25.2,
      record_count: 31
    },
    {
      month: '2024-01',
      machinery_name: 'Crane #2',
      machinery_type: 'Lifting Equipment',
      place_name: 'Port Terminal',
      total_litres: 1680,
      avg_daily_litres: 54.2,
      record_count: 31
    }
  ];

  const getTypeColor = (type: string) => {
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

  // Load data on component mount and when tab changes
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      if (activeTab === 'daily') {
        const response = await dataAPI.getAll();
        setRealDailyData(response.data.data || []);
      } else {
        const response = await dataAPI.getMonthly();
        setRealMonthlyData(response.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuccess = () => {
    loadData(); // Refresh data after adding new entry
  };

  // Use real data or fall back to mock data
  const currentDailyData = realDailyData.length > 0 ? realDailyData : dailyData;
  const currentMonthlyData = realMonthlyData.length > 0 ? realMonthlyData : monthlyData;

  const totalConsumption = currentDailyData
    .filter(d => d.type === 'consumption')
    .reduce((sum, d) => sum + d.litres, 0);

  const totalRefills = currentDailyData
    .filter(d => d.type === 'refill')
    .reduce((sum, d) => sum + d.litres, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {isSuperAdmin() ? 'Data & Reports' : 'Current Month Data'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {isSuperAdmin() 
              ? 'View daily and monthly oil consumption data and reports'
              : 'View current month oil consumption data'
            }
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button className="btn btn-secondary flex items-center justify-center w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary flex items-center justify-center w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </button>
        </div>
      </div>

      {/* Month Selector for SuperAdmin */}
      {isSuperAdmin() && (
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Select Month</h2>
              <p className="text-sm text-gray-600">Choose a month to view historical data</p>
            </div>
            
            <div className="relative month-selector">
              <button
                onClick={() => setIsMonthSelectorOpen(!isMonthSelectorOpen)}
                className="btn btn-secondary flex items-center justify-center w-full sm:w-auto"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {selectedMonth || 'Select Month'}
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
              
              {isMonthSelectorOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-4">
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">CURRENT PERIOD:</h3>
                      <div className="flex items-center p-2 bg-gray-50 border rounded">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">August 2025</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">AVAILABLE YEARS:</h3>
                      <div className="space-y-1">
                        {['2024', '2025', '2026'].map((year) => (
                          <button
                            key={year}
                            onClick={() => setSelectedMonth(`${year}-08`)}
                            className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">QUICK ACCESS:</h3>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {['June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                          <button
                            key={month}
                            onClick={() => {
                              const monthNum = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(month) + 1;
                              setSelectedMonth(`2025-${monthNum.toString().padStart(2, '0')}`);
                              setIsMonthSelectorOpen(false);
                            }}
                            className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                          >
                            {month}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Current Month or Past Month Data */}
      {selectedMonth ? (
        // Show past month data (read-only)
        <PastMonthsData selectedMonth={selectedMonth} />
      ) : (
        // Show current month data (with edit capabilities)
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg">
                  <Fuel className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Consumption</p>
                  <p className="text-2xl font-bold text-gray-900">{totalConsumption}L</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Fuel className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Refills</p>
                  <p className="text-2xl font-bold text-gray-900">{totalRefills}L</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Entries</p>
                  <p className="text-2xl font-bold text-gray-900">{currentDailyData.length}</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Days</p>
                  <p className="text-2xl font-bold text-gray-900">15</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter and Tabs */}
          <div className="card">
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-6">
              {isSuperAdmin() ? (
                <div className="flex space-x-1 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab('daily')}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                      activeTab === 'daily'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Daily Data
                  </button>
                  <button
                    onClick={() => setActiveTab('monthly')}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                      activeTab === 'monthly'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly Summary
                  </button>
                </div>
              ) : (
                <div className="flex space-x-1 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium bg-primary-100 text-primary-700 text-sm sm:text-base">
                    Current Month Data
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button className="btn btn-secondary flex items-center justify-center w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
                <input
                  type="date"
                  className="input w-full sm:w-auto"
                  defaultValue="2024-01-15"
                />
              </div>
            </div>

            {/* Daily Data Table */}
            {activeTab === 'daily' && (
              <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                    <span className="ml-2 text-gray-600">Loading data...</span>
                  </div>
                ) : (
                  <div className="min-w-full">
                    <table className="table min-w-full">
                    <thead>
                      <tr>
                        <th className="text-xs sm:text-sm">Date</th>
                        <th className="text-xs sm:text-sm">Machinery</th>
                        <th className="text-xs sm:text-sm hidden sm:table-cell">Type</th>
                        <th className="text-xs sm:text-sm">Place</th>
                        <th className="text-xs sm:text-sm">Litres</th>
                        <th className="text-xs sm:text-sm">Entry Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentDailyData.map((item) => (
                        <tr key={item.id}>
                          <td className="font-medium text-xs sm:text-sm">{item.date}</td>
                          <td>
                            <div>
                              <p className="font-medium text-xs sm:text-sm">{item.machinery_name}</p>
                              <p className="text-xs text-gray-500">{item.machinery_type}</p>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell">
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                              {item.machinery_type}
                            </span>
                          </td>
                          <td className="text-xs sm:text-sm">{item.place_name}</td>
                          <td>
                            <span className="font-semibold text-sm sm:text-lg">{item.litres}L</span>
                          </td>
                          <td>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                              {item.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            )}

            {/* Monthly Data Table */}
            {activeTab === 'monthly' && isSuperAdmin() && (
              <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                    <span className="ml-2 text-gray-600">Loading data...</span>
                  </div>
                ) : (
                  <div className="min-w-full">
                    <table className="table min-w-full">
                    <thead>
                      <tr>
                        <th className="text-xs sm:text-sm">Month</th>
                        <th className="text-xs sm:text-sm">Machinery</th>
                        <th className="text-xs sm:text-sm hidden md:table-cell">Place</th>
                        <th className="text-xs sm:text-sm">Total Litres</th>
                        <th className="text-xs sm:text-sm hidden sm:table-cell">Daily Average</th>
                        <th className="text-xs sm:text-sm hidden lg:table-cell">Records</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentMonthlyData.map((item, index) => (
                        <tr key={index}>
                          <td className="font-medium text-xs sm:text-sm">{item.month}</td>
                          <td>
                            <div>
                              <p className="font-medium text-xs sm:text-sm">{item.machinery_name}</p>
                              <p className="text-xs text-gray-500">{item.machinery_type}</p>
                            </div>
                          </td>
                          <td className="hidden md:table-cell text-xs sm:text-sm">{item.place_name}</td>
                          <td>
                            <span className="font-semibold text-sm sm:text-lg text-primary-600">
                              {item.total_litres}L
                            </span>
                          </td>
                          <td className="hidden sm:table-cell">
                            <span className="text-gray-600 text-xs sm:text-sm">{item.avg_daily_litres}L/day</span>
                          </td>
                          <td className="hidden lg:table-cell">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {item.record_count} entries
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            )}
          </div>

          {/* Summary Cards */}
          {activeTab === 'monthly' && isSuperAdmin() && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Totals</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Consumption</span>
                    <span className="font-semibold">3,710L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Daily</span>
                    <span className="font-semibold">119.7L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Peak Day</span>
                    <span className="font-semibold">185L</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Consumers</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Crane #2</span>
                    <span className="font-semibold">1,680L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Excavator #3</span>
                    <span className="font-semibold">1,250L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Generator #1</span>
                    <span className="font-semibold">780L</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">By Location</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Port Terminal</span>
                    <span className="font-semibold">1,680L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Construction Site A</span>
                    <span className="font-semibold">1,250L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Warehouse B</span>
                    <span className="font-semibold">780L</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Oil Entry Modal */}
      <AddOilEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default DataPage; 