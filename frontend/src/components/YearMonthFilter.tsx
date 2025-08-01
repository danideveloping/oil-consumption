import React from 'react';
import { ChevronDown } from 'lucide-react';

interface YearMonthFilterProps {
  selectedYear: string;
  selectedMonth: string;
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
}

const YearMonthFilter: React.FC<YearMonthFilterProps> = ({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange
}) => {
  // Generate years from 2025 down to 2020 (or earlier if needed)
  const currentYear = new Date().getFullYear();
  const maxYear = Math.min(currentYear, 2025);
  const years = Array.from({ length: maxYear - 2019 }, (_, i) => (maxYear - i).toString());

  const months = [
    { value: '', label: 'All Months' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Year
        </label>
        <div className="relative">
          <select
            id="year-filter"
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex-1">
        <label htmlFor="month-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Month
        </label>
        <div className="relative">
          <select
            id="month-filter"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default YearMonthFilter; 