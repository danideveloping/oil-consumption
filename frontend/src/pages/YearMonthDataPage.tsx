import React, { useState, useEffect } from 'react';
import { Calendar, BarChart3, TrendingUp, Fuel } from 'lucide-react';
import YearMonthFilter from '../components/YearMonthFilter';
import StatsTableModal from '../components/StatsTableModal';
import { dataAPI, OilData } from '../services/api';
import { useFilter } from '../contexts/FilterContext';
import toast from 'react-hot-toast';

const YearMonthDataPage: React.FC = () => {
  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth } = useFilter();
  const [oilData, setOilData] = useState<OilData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  // Load data when year/month selection changes
  useEffect(() => {
    if (selectedYear || selectedMonth) {
      loadFilteredData();
    } else {
      setOilData([]);
    }
  }, [selectedYear, selectedMonth]);

  // Listen for oil entry additions from dashboard
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'oilEntryAdded' && (selectedYear || selectedMonth)) {
        // Refresh data when a new oil entry is added
        loadFilteredData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events
    const handleOilEntryAdded = () => {
      if (selectedYear || selectedMonth) {
        loadFilteredData();
      }
    };

    window.addEventListener('oilEntryAdded', handleOilEntryAdded);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('oilEntryAdded', handleOilEntryAdded);
    };
  }, [selectedYear, selectedMonth]);

  const loadFilteredData = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      
      if (selectedYear && selectedMonth) {
        params.year = selectedYear;
        params.month = selectedMonth;
      } else if (selectedYear) {
        params.year = selectedYear;
      }

      const response = await dataAPI.getAll(params);
      setOilData(response.data?.data || []);
    } catch (error) {
      console.error('Error loading filtered data:', error);
      toast.error('Dështoi ngarkimi i të dhënave');
      setOilData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats for the selected period
  const calculateStats = () => {
    const totalEntries = oilData.length;
    
    const consumptionData = oilData.filter(entry => entry.type === 'consumption');
    const refillData = oilData.filter(entry => entry.type === 'refill');
    // const maintenanceData = oilData.filter(entry => entry.type === 'maintenance');
    
    const totalConsumption = consumptionData.reduce((sum, entry) => {
      const litres = typeof entry.litres === 'number' ? entry.litres : parseFloat(entry.litres) || 0;
      return sum + litres;
    }, 0);
    
    const totalRefills = refillData.reduce((sum, entry) => {
      const litres = typeof entry.litres === 'number' ? entry.litres : parseFloat(entry.litres) || 0;
      return sum + litres;
    }, 0);
    
    // const totalMaintenance = maintenanceData.reduce((sum, entry) => {
    //   const litres = typeof entry.litres === 'number' ? entry.litres : parseFloat(entry.litres) || 0;
    //   return sum + litres;
    // }, 0);

    // Get unique machinery and places
    const uniqueMachinery = [...new Set(oilData.map(entry => entry.machinery_name))];
    const uniquePlaces = [...new Set(oilData.map(entry => entry.place_name).filter(Boolean))];

    return [
      {
        name: 'Hyrje Totale',
        value: totalEntries.toString(),
        icon: BarChart3,
        color: 'bg-blue-500',
        change: `${selectedYear}${selectedMonth ? ` - ${selectedMonth}` : ''}`
      },
      {
        name: 'Konsumi Total',
        value: `${(totalConsumption || 0).toFixed(0)}L`,
        icon: Fuel,
        color: 'bg-red-500',
        change: `${consumptionData.length} hyrje`
      },
      {
        name: 'Rimbushje Totale',
        value: `${(totalRefills || 0).toFixed(0)}L`,
        icon: TrendingUp,
        color: 'bg-green-500',
        change: `${refillData.length} hyrje`
      },
      {
        name: 'Makineri Aktive',
        value: uniqueMachinery.length.toString(),
        icon: BarChart3,
        color: 'bg-purple-500',
        change: `${uniquePlaces.length} vendndodhje`
      }
    ];
  };

  const stats = calculateStats();

  // Functions to open table modals
  const openAllDataTable = () => {
    setStatsTableModal({
      isOpen: true,
      title: `Të Gjitha Të Dhënat - ${selectedYear}${selectedMonth ? ` ${selectedMonth}` : ''}`,
      data: oilData,
      columns: [
        { key: 'machinery_name', label: 'Makineri' },
        { key: 'place_name', label: 'Vendndodhja' },
        { key: 'litres', label: 'Litra', render: (value: any) => `${value}L` },
        { key: 'type', label: 'Tipi', render: (value: any) => {
          switch(value) {
            case 'consumption': return 'Konsum';
            case 'refill': return 'Plotësim';
            case 'maintenance': return 'Mirëmbajtje';
            default: return value;
          }
        }},
        { key: 'date', label: 'Data & Ora', render: (value: any) => {
          const date = new Date(value);
          const dateStr = date.toLocaleDateString('en-US', {timeZone: 'Europe/Tirane'});
          const timeStr = date.getHours() === 0 && date.getMinutes() === 0 ? '' : ` ${date.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', timeZone: 'Europe/Tirane'})}`;
          return dateStr + timeStr;
        }},
        { key: 'notes', label: 'Shënime' }
      ],
      searchPlaceholder: 'Kërko të dhëna...'
    });
  };

  const openConsumptionTable = () => {
    const consumptionData = oilData.filter(entry => entry.type === 'consumption');
    const columns = [
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
      title: `Të Dhënat e Konsumit - ${selectedYear}${selectedMonth ? ` ${selectedMonth}` : ''}`,
      data: consumptionData,
      columns,
      searchPlaceholder: 'Kërko të dhënat e konsumit...'
    });
  };

  const openMachineryTable = () => {
    const uniqueMachinery = [...new Set(oilData.map(entry => entry.machinery_name))];
    const machineryData = uniqueMachinery.map(name => {
      const entries = oilData.filter(entry => entry.machinery_name === name);
      const totalLitres = entries.reduce((sum, entry) => {
        const litres = typeof entry.litres === 'number' ? entry.litres : parseFloat(entry.litres) || 0;
        return sum + litres;
      }, 0);
      return {
        name,
        total_entries: entries.length,
        total_litres: totalLitres,
        types: [...new Set(entries.map(e => e.type))].join(', ')
      };
    });

    const columns = [
      { key: 'name', label: 'Makineri' },
      { key: 'total_entries', label: 'Hyrje' },
      { 
        key: 'total_litres', 
        label: 'Litrat Total',
        render: (value: any) => `${value.toFixed(0)}L`
      },
      { key: 'types', label: 'Llojet' }
    ];

    setStatsTableModal({
      isOpen: true,
      title: `Përmbledhja e Makinerisë - ${selectedYear}${selectedMonth ? ` ${selectedMonth}` : ''}`,
      data: machineryData,
      columns,
      searchPlaceholder: 'Kërko makineri...'
    });
  };

  const openPlacesTable = () => {
    const uniquePlaces = [...new Set(oilData.map(entry => entry.place_name).filter(Boolean))];
    const placesData = uniquePlaces.map(placeName => {
      const entries = oilData.filter(entry => entry.place_name === placeName);
      const totalLitres = entries.reduce((sum, entry) => {
        const litres = typeof entry.litres === 'number' ? entry.litres : parseFloat(entry.litres) || 0;
        return sum + litres;
      }, 0);
      return {
        name: placeName,
        total_entries: entries.length,
        total_litres: totalLitres,
        machinery_count: [...new Set(entries.map(e => e.machinery_name))].length
      };
    });

    const columns = [
      { key: 'name', label: 'Vendndodhja' },
      { key: 'total_entries', label: 'Hyrje' },
      { 
        key: 'total_litres', 
        label: 'Litrat Total',
        render: (value: any) => `${value.toFixed(0)}L`
      },
      { key: 'machinery_count', label: 'Makineri' }
    ];

    setStatsTableModal({
      isOpen: true,
      title: `Përmbledhja e Vendeve - ${selectedYear}${selectedMonth ? ` ${selectedMonth}` : ''}`,
      data: placesData,
      columns,
      searchPlaceholder: 'Kërko vende...'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analiza e të Dhënave sipas Vitit/Muajit</h1>
          <p className="text-sm sm:text-base text-gray-600">Shiko dhe analizo të dhënat sipas vitit dhe muajit</p>
        </div>
        {(selectedYear || selectedMonth) && (
          <button
            onClick={loadFilteredData}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Duke rifreskuar...
              </>
            ) : (
              'Rifresko Të Dhënat'
            )}
          </button>
        )}
      </div>

      {/* Year/Month Filter */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtro Të Dhënat</h2>
        <YearMonthFilter
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
        />
        
        {(selectedYear || selectedMonth) && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSelectedYear('');
                setSelectedMonth('');
              }}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Pastro Filtrot
            </button>
          </div>
        )}
        
        {!selectedYear && !selectedMonth && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Zgjidh një vit dhe/ose muaj për të parë të dhënat</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      {(selectedYear || selectedMonth) && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              const handleClick = () => {
                switch (stat.name) {
                  case 'Hyrje Totale':
                    openAllDataTable();
                    break;
                  case 'Konsumi Total':
                    openConsumptionTable();
                    break;
                  case 'Makineri Aktive':
                    openMachineryTable();
                    break;
                  case 'Rimbushje Totale':
                    openPlacesTable();
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

          {/* Data Summary */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Përmbledhja e të Dhënave për {selectedYear}{selectedMonth ? ` - ${selectedMonth}` : ''}
            </h3>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Duke ngarkuar të dhënat...</p>
              </div>
            ) : oilData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nuk u gjetën të dhëna për periudhën e zgjedhur</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Makineri
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendndodhja
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lloji
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sasia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data & Ora
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {oilData.slice(0, 10).map((entry, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {entry.machinery_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.place_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            entry.type === 'consumption' ? 'bg-red-100 text-red-800' :
                            entry.type === 'refill' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {entry.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.litres}L
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(entry.date).toLocaleDateString('en-US', {timeZone: 'Europe/Tirane'})}
                          {new Date(entry.date).getHours() === 0 && new Date(entry.date).getMinutes() === 0 ? '' : ` ${new Date(entry.date).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', timeZone: 'Europe/Tirane'})}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {oilData.length > 10 && (
                  <div className="text-center py-4 text-sm text-gray-500">
                    Duke shfaqur 10 hyrjet e para. Kliko në kartat e statistikave për të parë të gjitha të dhënat.
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

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

export default YearMonthDataPage; 