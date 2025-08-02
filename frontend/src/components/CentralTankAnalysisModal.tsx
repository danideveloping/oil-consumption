import React, { useState, useEffect } from 'react';
import { X, Fuel, TrendingUp, TrendingDown, AlertTriangle, Calendar, BarChart3 } from 'lucide-react';
import { dataAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

interface CentralTankAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MachinerySummary {
  id: number;
  name: string;
  type: string;
  place_name: string;
  capacity: number;
  totalConsumption: number;
  refillCount: number;
  currentLevel: number;
}

interface CentralTankCycle {
  startDate: string;
  endDate: string;
  refillAmount: number;
  totalConsumption: number;
  machineryConsumption: Record<number, {
    machinery_name: string;
    machinery_type: string;
    place_name: string;
    consumption: number;
  }>;
  expectedConsumption: number;
  actualConsumption: number;
  discrepancy: number;
  discrepancyPercentage: number;
  entries: any[];
}

interface CentralTankAnalysis {
  centralTank: {
    lastRefillDate: string;
    lastRefillAmount: number;
    currentTankLevel: number;
    consumptionSinceLastRefill: number;
    remainingCapacity: number;
  };
  centralTankCycles: CentralTankCycle[];
  machinerySummary: MachinerySummary[];
  statistics: {
    totalRefills: number;
    totalConsumption: number;
    totalRefillAmount: number;
    overallDiscrepancy: number;
    overallDiscrepancyPercentage: number;
    averageDiscrepancy: number;
    averageDiscrepancyPercentage: number;
  };
}

const CentralTankAnalysisModal: React.FC<CentralTankAnalysisModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tankAnalysis, setTankAnalysis] = useState<CentralTankAnalysis | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load tank analysis when modal opens or dates change
  useEffect(() => {
    if (isOpen) {
      loadTankAnalysis();
    }
  }, [isOpen, startDate, endDate]);

  const loadTankAnalysis = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      console.log('🔍 Loading central tank analysis with params:', params);
      const response = await dataAPI.getCentralTankAnalysis(params);
      console.log('📊 Central tank analysis response:', response.data);
      setTankAnalysis(response.data);
    } catch (error) {
      console.error('❌ Error loading central tank analysis:', error);
      toast.error('Failed to load central tank analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { timeZone: 'Europe/Tirane' });
  };

  const getDiscrepancyColor = (discrepancy: number) => {
    if (discrepancy > 0) return 'text-red-600';
    if (discrepancy < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getDiscrepancyIcon = (discrepancy: number) => {
    if (discrepancy > 0) return <TrendingUp className="h-4 w-4 text-red-600" />;
    if (discrepancy < 0) return <TrendingDown className="h-4 w-4 text-green-600" />;
    return <BarChart3 className="h-4 w-4 text-gray-600" />;
  };

  const getTankLevelPercentage = () => {
    if (!tankAnalysis || Number(tankAnalysis.centralTank.lastRefillAmount) === 0) return 0;
    return (Number(tankAnalysis.centralTank.currentTankLevel) / Number(tankAnalysis.centralTank.lastRefillAmount)) * 100;
  };

  const getTankLevelColor = (percentage: number) => {
    if (percentage < 20) return 'bg-red-500';
    if (percentage < 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Central Tank Analysis</h2>
            <p className="text-sm text-gray-600">Monitor main static tank and fuel distribution to all machinery</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date (Optional)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {startDate && (
                  <button
                    onClick={() => setStartDate('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date (Optional)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {endDate && (
                  <button
                    onClick={() => setEndDate('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
              <span className="ml-2 text-gray-600">Loading central tank analysis...</span>
            </div>
          ) : tankAnalysis ? (
            <div className="space-y-6">
              {/* Central Tank Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Fuel className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Last Refill Amount</p>
                      <p className="text-2xl font-bold text-gray-900">{Number(tankAnalysis.centralTank.lastRefillAmount) || 0}L</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Fuel className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Current Level</p>
                      <p className="text-2xl font-bold text-gray-900">{(Number(tankAnalysis.centralTank.currentTankLevel) || 0).toFixed(1)}L</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <Fuel className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Consumed Since Refill</p>
                      <p className="text-2xl font-bold text-gray-900">{(Number(tankAnalysis.centralTank.consumptionSinceLastRefill) || 0).toFixed(1)}L</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Last Refill</p>
                      <p className="text-lg font-bold text-gray-900">
                        {tankAnalysis.centralTank.lastRefillDate ? formatDate(tankAnalysis.centralTank.lastRefillDate) : 'None'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Central Tank Level Visual */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Central Tank Level</h3>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-8">
                    <div
                      className={`h-8 rounded-full transition-all duration-300 ${getTankLevelColor(getTankLevelPercentage())}`}
                      style={{ width: `${Math.min(getTankLevelPercentage(), 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>0L</span>
                                         <span>{(Number(tankAnalysis.centralTank.currentTankLevel) || 0).toFixed(1)}L / {Number(tankAnalysis.centralTank.lastRefillAmount) || 0}L</span>
                     <span>{Number(tankAnalysis.centralTank.lastRefillAmount) || 0}L</span>
                  </div>
                </div>
              </div>

              {/* Discrepancy Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card">
                  <div className="flex items-center">
                    <div className="bg-red-100 p-3 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Overall Discrepancy</p>
                      <p className={`text-2xl font-bold ${getDiscrepancyColor(Number(tankAnalysis.statistics.overallDiscrepancy) || 0)}`}>
                        {(Number(tankAnalysis.statistics.overallDiscrepancy) || 0).toFixed(1)}L
                      </p>
                      <p className={`text-sm ${getDiscrepancyColor(Number(tankAnalysis.statistics.overallDiscrepancyPercentage) || 0)}`}>
                        {(Number(tankAnalysis.statistics.overallDiscrepancyPercentage) || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Discrepancy</p>
                      <p className={`text-2xl font-bold ${getDiscrepancyColor(Number(tankAnalysis.statistics.averageDiscrepancy) || 0)}`}>
                        {(Number(tankAnalysis.statistics.averageDiscrepancy) || 0).toFixed(1)}L
                      </p>
                      <p className={`text-sm ${getDiscrepancyColor(Number(tankAnalysis.statistics.averageDiscrepancyPercentage) || 0)}`}>
                        {(Number(tankAnalysis.statistics.averageDiscrepancyPercentage) || 0).toFixed(1)}%
                      </p>
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
                      <p className="text-2xl font-bold text-gray-900">{tankAnalysis.statistics.totalRefills || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <TrendingDown className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Consumption</p>
                      <p className="text-2xl font-bold text-gray-900">{(Number(tankAnalysis.statistics.totalConsumption) || 0).toFixed(1)}L</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Machinery Summary */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Machinery Fuel Status</h3>
                {tankAnalysis.machinerySummary.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No machinery data available.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table min-w-full">
                      <thead>
                        <tr>
                          <th className="text-xs sm:text-sm">Machinery</th>
                          <th className="text-xs sm:text-sm">Type</th>
                          <th className="text-xs sm:text-sm">Location</th>
                          <th className="text-xs sm:text-sm">Capacity</th>
                          <th className="text-xs sm:text-sm">Current Level</th>
                          <th className="text-xs sm:text-sm">Total Consumption</th>
                          <th className="text-xs sm:text-sm">Refill Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tankAnalysis.machinerySummary.map((machinery) => (
                          <tr key={machinery.id}>
                            <td className="text-xs sm:text-sm font-medium">{machinery.name}</td>
                            <td className="text-xs sm:text-sm">{machinery.type}</td>
                            <td className="text-xs sm:text-sm">{machinery.place_name}</td>
                            <td className="text-xs sm:text-sm">{machinery.capacity || 'N/A'}L</td>
                                                         <td className="text-xs sm:text-sm">
                               <span className="font-semibold">{(Number(machinery.currentLevel) || 0).toFixed(1)}L</span>
                             </td>
                             <td className="text-xs sm:text-sm">{(Number(machinery.totalConsumption) || 0).toFixed(1)}L</td>
                            <td className="text-xs sm:text-sm">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {machinery.refillCount}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Central Tank Cycles Table */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Central Tank Refill Cycles</h3>
                {tankAnalysis.centralTankCycles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No refill cycles found for the selected period.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table min-w-full">
                      <thead>
                        <tr>
                          <th className="text-xs sm:text-sm">Start Date</th>
                          <th className="text-xs sm:text-sm">End Date</th>
                          <th className="text-xs sm:text-sm">Refill Amount</th>
                          <th className="text-xs sm:text-sm">Actual Consumption</th>
                          <th className="text-xs sm:text-sm">Expected Consumption</th>
                          <th className="text-xs sm:text-sm">Discrepancy</th>
                          <th className="text-xs sm:text-sm">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tankAnalysis.centralTankCycles.map((cycle, index) => (
                          <tr key={index}>
                            <td className="text-xs sm:text-sm">{formatDate(cycle.startDate)}</td>
                            <td className="text-xs sm:text-sm">{cycle.endDate ? formatDate(cycle.endDate) : 'Ongoing'}</td>
                                                         <td className="text-xs sm:text-sm font-semibold">{Number(cycle.refillAmount) || 0}L</td>
                             <td className="text-xs sm:text-sm">{(Number(cycle.actualConsumption) || 0).toFixed(1)}L</td>
                             <td className="text-xs sm:text-sm">{(Number(cycle.expectedConsumption) || 0).toFixed(1)}L</td>
                            <td className="text-xs sm:text-sm">
                              <div className="flex items-center">
                                {getDiscrepancyIcon(cycle.discrepancy)}
                                                                 <span className={`ml-1 font-semibold ${getDiscrepancyColor(Number(cycle.discrepancy) || 0)}`}>
                                   {(Number(cycle.discrepancy) || 0).toFixed(1)}L
                                 </span>
                               </div>
                             </td>
                             <td className="text-xs sm:text-sm">
                               <span className={`font-semibold ${getDiscrepancyColor(Number(cycle.discrepancyPercentage) || 0)}`}>
                                 {(Number(cycle.discrepancyPercentage) || 0).toFixed(1)}%
                               </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No central tank analysis data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CentralTankAnalysisModal; 