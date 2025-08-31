import React, { useState, useEffect } from 'react';
import { Plus, Calendar, BarChart3, Fuel, Download, ChevronDown, FileText, FileSpreadsheet, Settings } from 'lucide-react';
import AddOilEntryModal from '../components/AddOilEntryModal';
import LoadingSpinner from '../components/LoadingSpinner';
import PastMonthsData from '../components/PastMonthsData';
import TankAnalysisModal from '../components/TankAnalysisModal';
import CentralTankAnalysisModal from '../components/CentralTankAnalysisModal';
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
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isTankAnalysisOpen, setIsTankAnalysisOpen] = useState(false);
  const [isCentralTankAnalysisOpen, setIsCentralTankAnalysisOpen] = useState(false);

  // Close month selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.month-selector')) {
        setIsMonthSelectorOpen(false);
      }
      if (!target.closest('.export-dropdown')) {
        setIsExportDropdownOpen(false);
      }
    };

    if (isMonthSelectorOpen || isExportDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMonthSelectorOpen, isExportDropdownOpen]);

  // Load data when component mounts or when selected date changes
  useEffect(() => {
    loadData();
  }, [selectedDate, activeTab]);



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
        const data = response.data.data || [];
        setRealDailyData(data);
      } else {
        const response = await dataAPI.getMonthly();
        setRealMonthlyData(response.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Dështoi ngarkimi i të dhënave');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuccess = () => {
    loadData(); // Refresh data after adding new entry
  };

  // Use real data only
  const currentDailyData = realDailyData;
  const currentMonthlyData = realMonthlyData;

  // Filter data by selected date if specified
  const filteredDailyData = selectedDate 
    ? currentDailyData.filter(item => {
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        return itemDate === selectedDate;
      })
    : currentDailyData;

  // Calculate totals for the filtered data
  const totalConsumption = filteredDailyData
    .filter(d => d.type === 'consumption')
    .reduce((sum, d) => {
      const litres = typeof d.litres === 'number' ? d.litres : parseFloat(d.litres) || 0;
      return sum + litres;
    }, 0);

  const totalRefills = filteredDailyData
    .filter(d => d.type === 'refill')
    .reduce((sum, d) => {
      const litres = typeof d.litres === 'number' ? d.litres : parseFloat(d.litres) || 0;
      return sum + litres;
    }, 0);

  // Calculate active days (unique dates with data)
  const activeDays = selectedDate 
    ? (filteredDailyData.length > 0 ? 1 : 0)
    : new Set(filteredDailyData.map(item => new Date(item.date).toISOString().split('T')[0])).size;

  // Get the appropriate label based on whether a date is selected
  const getConsumptionLabel = () => {
    if (selectedDate) {
      return `Selected Date Consumption`;
    }
    return `Current Period Consumption`;
  };

  const getRefillsLabel = () => {
    if (selectedDate) {
      return `Selected Date Refills`;
    }
    return `Current Period Refills`;
  };

  // Export functions
  const formatDateForExport = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {timeZone: 'Europe/Tirane'});
  };

  const exportToCSV = () => {
    const dataToExport = activeTab === 'daily' ? filteredDailyData : currentMonthlyData;
    
    if (dataToExport.length === 0) {
      toast.error('Asnjë të dhënë për eksportim');
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
    link.setAttribute('download', `oil_data_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV u eksportua me sukses');
    setIsExportDropdownOpen(false);
  };

  const exportToExcel = () => {
    const dataToExport = activeTab === 'daily' ? filteredDailyData : currentMonthlyData;
    
    if (dataToExport.length === 0) {
      toast.error('Asnjë të dhënë për eksportim');
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
    link.setAttribute('download', `oil_data_${activeTab}_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Skedari Excel u eksportua me sukses');
    setIsExportDropdownOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {isSuperAdmin() ? 'Të Dhënat & Raportet' : 'Të Dhënat e Muajit Aktual'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {isSuperAdmin() 
              ? 'Shiko të dhënat dhe raportet ditore dhe mujore të konsumit të naftës'
              : 'Shiko të dhënat e konsumit të naftës të muajit aktual'
            }
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {/* Central Tank Analysis Button */}
          <button 
            onClick={() => setIsCentralTankAnalysisOpen(true)}
            className="btn btn-secondary flex items-center justify-center w-full sm:w-auto"
          >
            <Settings className="h-4 w-4 mr-2" />
            Rezervuari Qendror
          </button>
          
          {/* Individual Tank Analysis Button */}
          <button 
            onClick={() => setIsTankAnalysisOpen(true)}
            className="btn btn-secondary flex items-center justify-center w-full sm:w-auto"
          >
            <Fuel className="h-4 w-4 mr-2" />
            Rezervuarët Individualë
          </button>
          
          {/* Export Dropdown */}
          <div className="relative export-dropdown">
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="btn btn-secondary flex items-center justify-center w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Eksporto
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
                    Eksporto si CSV
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Eksporto si Excel
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary flex items-center justify-center w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Shto Hyrje
          </button>
        </div>
      </div>

      {/* Month Selector for SuperAdmin */}
      {isSuperAdmin() && (
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Zgjidh Muajin</h2>
              <p className="text-sm text-gray-600">Zgjidh një muaj për të parë të dhënat historike</p>
            </div>
            
            <div className="relative month-selector">
              <button
                onClick={() => setIsMonthSelectorOpen(!isMonthSelectorOpen)}
                className="btn btn-secondary flex items-center justify-center w-full sm:w-auto"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {selectedMonth ? (() => {
                  const [year, month] = selectedMonth.split('-');
                  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'Europe/Tirane'
                  });
                  return monthName;
                })() : 'Zgjidh Muajin'}
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
              
              {isMonthSelectorOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-4">
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">PERIUDHA AKTUALE:</h3>
                      <div className="flex items-center p-2 bg-gray-50 border rounded">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">
                          {new Date().toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric',
                            timeZone: 'Europe/Tirane'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">ZGJIDH VITIN:</h3>
                      <div className="grid grid-cols-3 gap-1">
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                          <button
                            key={year}
                            onClick={() => {
                              const currentMonth = new Date().getMonth() + 1;
                              setSelectedMonth(`${year}-${currentMonth.toString().padStart(2, '0')}`);
                              setIsMonthSelectorOpen(false);
                            }}
                            className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">ZGJIDH MUAJIN:</h3>
                      <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                        {['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'].map((month) => (
                          <button
                            key={month}
                            onClick={() => {
                              const monthNum = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'].indexOf(month) + 1;
                              const currentYear = new Date().getFullYear();
                              setSelectedMonth(`${currentYear}-${monthNum.toString().padStart(2, '0')}`);
                              setIsMonthSelectorOpen(false);
                            }}
                            className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                          >
                            {month}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">ZGJIDHJA PERSONALIZUAR:</h3>
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <select 
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                            onChange={(e) => {
                              const selectedMonth = e.target.value;
                              const currentYear = new Date().getFullYear();
                              if (selectedMonth) {
                                const monthNum = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'].indexOf(selectedMonth) + 1;
                                setSelectedMonth(`${currentYear}-${monthNum.toString().padStart(2, '0')}`);
                                setIsMonthSelectorOpen(false);
                              }
                            }}
                          >
                            <option value="">Zgjidh Muajin</option>
                            {['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'].map((month) => (
                              <option key={month} value={month}>{month}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="Viti"
                            min="2020"
                            max="2030"
                            defaultValue={new Date().getFullYear()}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const year = e.currentTarget.value;
                                const monthSelect = e.currentTarget.parentElement?.querySelector('select') as HTMLSelectElement;
                                if (year && monthSelect.value) {
                                  const monthNum = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'].indexOf(monthSelect.value) + 1;
                                  setSelectedMonth(`${year}-${monthNum.toString().padStart(2, '0')}`);
                                  setIsMonthSelectorOpen(false);
                                }
                              }
                            }}
                          />
                        </div>
                        <button
                          onClick={() => {
                            const monthSelect = document.querySelector('.month-selector select') as HTMLSelectElement;
                            const yearInput = document.querySelector('.month-selector input[type="number"]') as HTMLInputElement;
                            if (monthSelect?.value && yearInput?.value) {
                              const monthNum = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'].indexOf(monthSelect.value) + 1;
                              setSelectedMonth(`${yearInput.value}-${monthNum.toString().padStart(2, '0')}`);
                              setIsMonthSelectorOpen(false);
                            }
                          }}
                          className="w-full px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          Apliko Zgjedhjen
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">ZGJIDHJET E SHPEJTA:</h3>
                      <div className="space-y-1">
                        {(() => {
                          const currentYear = new Date().getFullYear();
                          // const currentMonth = new Date().getMonth();
                          // const months = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'];
                          
                          return [
                            { year: currentYear - 1, month: 12, label: 'Dhjetor 2024' },
                            { year: currentYear, month: 1, label: 'Janar 2025' },
                            { year: currentYear, month: 2, label: 'Shkurt 2025' },
                            { year: currentYear, month: 3, label: 'Mars 2025' },
                            { year: currentYear, month: 4, label: 'Prill 2025' },
                            { year: currentYear, month: 5, label: 'Maj 2025' },
                            { year: currentYear, month: 6, label: 'Qershor 2025' },
                            { year: currentYear, month: 7, label: 'Korrik 2025' },
                            { year: currentYear, month: 8, label: 'Gusht 2025' },
                            { year: currentYear, month: 9, label: 'Shtator 2025' },
                            { year: currentYear, month: 10, label: 'Tetor 2025' },
                            { year: currentYear, month: 11, label: 'Nëntor 2025' },
                            { year: currentYear, month: 12, label: 'Dhjetor 2025' },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={() => {
                                setSelectedMonth(`${item.year}-${item.month.toString().padStart(2, '0')}`);
                                setIsMonthSelectorOpen(false);
                              }}
                              className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                            >
                              {item.label}
                            </button>
                          ));
                        })()}
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
                  <p className="text-sm font-medium text-gray-600">{getConsumptionLabel()}</p>
                  <p className="text-2xl font-bold text-gray-900">{(totalConsumption || 0).toFixed(0)}L</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Fuel className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{getRefillsLabel()}</p>
                  <p className="text-2xl font-bold text-gray-900">{(totalRefills || 0).toFixed(0)}L</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hyrje Totale</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredDailyData.length}</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ditë Aktive</p>
                  <p className="text-2xl font-bold text-gray-900">{activeDays}</p>
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
                    Të Dhënat Ditore
                  </button>
                  <button
                    onClick={() => setActiveTab('monthly')}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                      activeTab === 'monthly'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Përmbledhja Mujore
                  </button>
                </div>
              ) : (
                <div className="flex space-x-1 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium bg-primary-100 text-primary-700 text-sm sm:text-base">
                    Të Dhënat e Muajit Aktual
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="date"
                  className="input w-full sm:w-auto"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  placeholder="Zgjidh datën"
                />
                {selectedDate && (
                  <button 
                    onClick={() => setSelectedDate('')}
                    className="btn btn-secondary flex items-center justify-center w-full sm:w-auto"
                  >
                    Pastro Filtri
                  </button>
                )}
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
                        <th className="text-xs sm:text-sm">Data</th>
                        <th className="text-xs sm:text-sm">Makineri</th>
                        <th className="text-xs sm:text-sm hidden sm:table-cell">Tipi</th>
                        <th className="text-xs sm:text-sm">Vendi</th>
                        <th className="text-xs sm:text-sm">Litrat</th>
                        <th className="text-xs sm:text-sm">Tipi i Hyrjes</th>
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
                        <th className="text-xs sm:text-sm">Muaji</th>
                        <th className="text-xs sm:text-sm">Makineri</th>
                        <th className="text-xs sm:text-sm hidden md:table-cell">Vendi</th>
                        <th className="text-xs sm:text-sm">Litrat Totale</th>
                        <th className="text-xs sm:text-sm hidden sm:table-cell">Mesatarja Ditore</th>
                        <th className="text-xs sm:text-sm hidden lg:table-cell">Regjistrimet</th>
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
                              {item.record_count} hyrje
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


        </>
      )}

      {/* Add Oil Entry Modal */}
      <AddOilEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Tank Analysis Modal */}
      <TankAnalysisModal
        isOpen={isTankAnalysisOpen}
        onClose={() => setIsTankAnalysisOpen(false)}
      />

      {/* Central Tank Analysis Modal */}
      <CentralTankAnalysisModal
        isOpen={isCentralTankAnalysisOpen}
        onClose={() => setIsCentralTankAnalysisOpen(false)}
      />
    </div>
  );
};

export default DataPage; 