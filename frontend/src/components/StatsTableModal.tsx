import React, { useState, useMemo } from 'react';
import { X, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface StatsTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
  }[];
  searchPlaceholder?: string;
}

const StatsTableModal: React.FC<StatsTableModalProps> = ({
  isOpen,
  onClose,
  title,
  data,
  columns,
  searchPlaceholder = "Search..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(row => 
      Object.values(row).some(value => 
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Europe/Tirane'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredData.length} of {data.length} entries
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {paginatedData.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                {searchTerm ? 'No results found' : 'No data available'}
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-primary-600 hover:text-primary-700 text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {column.render 
                            ? column.render(row[column.key], row)
                            : row[column.key] || '-'
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-1 text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsTableModal; 