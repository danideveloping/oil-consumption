import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
  selectedYear: string;
  selectedMonth: string;
  setSelectedYear: (year: string) => void;
  setSelectedMonth: (month: string) => void;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const clearFilters = () => {
    setSelectedYear('');
    setSelectedMonth('');
  };

  return (
    <FilterContext.Provider value={{
      selectedYear,
      selectedMonth,
      setSelectedYear,
      setSelectedMonth,
      clearFilters
    }}>
      {children}
    </FilterContext.Provider>
  );
}; 