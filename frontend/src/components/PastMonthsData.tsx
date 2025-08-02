import React, { useState, useEffect } from 'react';
import { Search, Calendar, BarChart3, Fuel, Download, ChevronDown, FileText, FileSpreadsheet } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { dataAPI } from '../services/api';
import toast from 'react-hot-toast';

interface PastMonthsDataProps {
  selectedMonth: string;
}

const PastMonthsData: React.FC<PastMonthsDataProps> = ({ selectedMonth }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  // Load data for the selected month
  useEffect(() => {
    if (selectedMonth) {
      loadMonthData();
    }
  }, [selectedMonth]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.export-dropdown')) {
        setIsExportDropdownOpen(false);
      }
    };

    if (isExportDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportDropdownOpen]);

  const loadMonthData = async () => {
    try {
      setIsLoading(true);
      
      // Parse the selectedMonth to get year and month
      const [year, month] = selectedMonth.split('-');
      
      // Load daily data for the selected month
      const dailyResponse = await dataAPI.getAll({ year, month });
      setDailyData(dailyResponse.data.data || []);
      
      // Load monthly summary for the selected month
      const monthlyResponse = await dataAPI.getMonthly({ year, month });
      setMonthlyData(monthlyResponse.data || []);
    } catch (error) {
      console.error('Error loading month data:', error);
      toast.error('Failed to load month data');
    } finally {
      setIsLoading(false);
    }
  };

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

  // Filter data based on search term
  const filteredDailyData = dailyData.filter(item =>
    item.machinery_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.place_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.machinery_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMonthlyData = monthlyData.filter(item =>
    item.machinery_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.place_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.machinery_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totalConsumption = dailyData
    .filter(d => d.type === 'consumption')
    .reduce((sum, d) => {
      const litres = typeof d.litres === 'number' ? d.litres : parseFloat(d.litres) || 0;
      return sum + litres;
    }, 0);

  const totalRefills = dailyData
    .filter(d => d.type === 'refill')
    .reduce((sum, d) => {
      const litres = typeof d.litres === 'number' ? d.litres : parseFloat(d.litres) || 0;
      return sum + litres;
    }, 0);

  const totalEntries = dailyData.length;

  // Export functions
  const formatDateForExport = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {timeZone: 'Europe/Tirane'});
  };

  const exportToCSV = () => {
    const dataToExport = activeTab === 'daily' ? filteredDailyData : filteredMonthlyData;
    
    if (dataToExport.length === 0) {
      toast.error('No data to export');
      return;
    }

    let csvContent = '';
    
    if (activeTab === 'daily') {
      // Daily data CSV
      csvContent = 'Date,Machinery,Machinery Type,Place,Litres,Entry Type\n';
      dataToExport.forEach(item => {
        const date = formatDateForExport(item.date);
        const machinery = item.machinery_name || '';
        const machineryType = item.machinery_type || '';
        const place = item.place_name || '';
        const litres = item.litres || 0;
        const type = item.type || '';
        
        csvContent += `"${date}","${machinery}","${machineryType}","${place}","${litres}","${type}"\n`;
      });
    } else {
      // Monthly data CSV
      csvContent = 'Month,Machinery,Machinery Type,Place,Total Litres,Daily Average,Records\n';
      dataToExport.forEach(item => {
        const month = item.month || '';
        const machinery = item.machinery_name || '';
        const machineryType = item.machinery_type || '';
        const place = item.place_name || '';
        const totalLitres = item.total_litres || 0;
        const avgDaily = item.avg_daily_litres || 0;
        const records = item.record_count || 0;
        
        csvContent += `"${month}","${machinery}","${machineryType}","${place}","${totalLitres}","${avgDaily}","${records}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historical_data_${selectedMonth}_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV exported successfully');
    setIsExportDropdownOpen(false);
  };

  const exportToExcel = () => {
    const dataToExport = activeTab === 'daily' ? filteredDailyData : filteredMonthlyData;
    
    if (dataToExport.length === 0) {
      toast.error('No data to export');
      return;
    }

    // For Excel, we'll create a CSV with Excel-compatible formatting
    let excelContent = '';
    
    if (activeTab === 'daily') {
      // Daily data Excel
      excelContent = 'Date\tMachinery\tMachinery Type\tPlace\tLitres\tEntry Type\n';
      dataToExport.forEach(item => {
        const date = formatDateForExport(item.date);
        const machinery = item.machinery_name || '';
        const machineryType = item.machinery_type || '';
        const place = item.place_name || '';
        const litres = item.litres || 0;
        const type = item.type || '';
        
        excelContent += `${date}\t${machinery}\t${machineryType}\t${place}\t${litres}\t${type}\n`;
      });
    } else {
      // Monthly data Excel
      excelContent = 'Month\tMachinery\tMachinery Type\tPlace\tTotal Litres\tDaily Average\tRecords\n';
      dataToExport.forEach(item => {
        const month = item.month || '';
        const machinery = item.machinery_name || '';
        const machineryType = item.machinery_type || '';
        const place = item.place_name || '';
        const totalLitres = item.total_litres || 0;
        const avgDaily = item.avg_daily_litres || 0;
        const records = item.record_count || 0;
        
        excelContent += `${month}\t${machinery}\t${machineryType}\t${place}\t${totalLitres}\t${avgDaily}\t${records}\n`;
      });
    }

    const blob = new Blob([excelContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historical_data_${selectedMonth}_${activeTab}_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Excel file exported successfully');
    setIsExportDropdownOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {(() => {
              const [year, month] = selectedMonth.split('-');
              const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
                month: 'long',
                year: 'numeric',
                timeZone: 'Europe/Tirane'
              });
              return `${monthName} - Historical Data`;
            })()}
          </h2>
          <p className="text-sm text-gray-600">
            Read-only view of past month's oil consumption data
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {/* Export Dropdown */}
          <div className="relative export-dropdown">
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="btn btn-secondary flex items-center justify-center w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            
            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={exportToCSV}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as CSV
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export as Excel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <Fuel className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Consumption</p>
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
              <p className="text-sm font-medium text-gray-600">Total Refills</p>
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
              <p className="text-2xl font-bold text-gray-900">{totalEntries}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {(() => {
                  const [year, month] = selectedMonth.split('-');
                  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
                    month: 'short',
                    year: 'numeric',
                    timeZone: 'Europe/Tirane'
                  });
                  return monthName;
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="card">
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-6">
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
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search machinery, place, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
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
            ) : filteredDailyData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No data found matching your search.' : 'No data available for this month.'}
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
                    {filteredDailyData.map((item) => (
                      <tr key={item.id}>
                        <td className="font-medium text-xs sm:text-sm">
                          {(() => {
                            const date = new Date(item.date);
                            const dateStr = date.toLocaleDateString('en-US', {timeZone: 'Europe/Tirane'});
                            const timeStr = date.getHours() === 0 && date.getMinutes() === 0 ? '' : ` ${date.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', timeZone: 'Europe/Tirane'})}`;
                            return dateStr + timeStr;
                          })()}
                        </td>
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
        {activeTab === 'monthly' && (
          <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-2 text-gray-600">Loading data...</span>
              </div>
            ) : filteredMonthlyData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No data found matching your search.' : 'No monthly summary available for this month.'}
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
                    {filteredMonthlyData.map((item, index) => (
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
    </div>
  );
};

export default PastMonthsData; 