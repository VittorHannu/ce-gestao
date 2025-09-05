import React, { createContext, useState, useContext, useMemo } from 'react';

const DateFilterContext = createContext();

export const DateFilterProvider = ({ children }) => {
  const [year, setYearState] = useState(() => {
    const storedYear = localStorage.getItem('dateFilterYear');
    return storedYear ? parseInt(storedYear, 10) : new Date().getFullYear();
  });
  // REMOVED: semester state
  // REMOVED: month state

  // NEW: Add periodType state
  const [periodType, setPeriodTypeState] = useState(() => {
    const storedPeriodType = localStorage.getItem('dateFilterPeriodType');
    if (storedPeriodType) {
      return parseInt(storedPeriodType, 10);
    }
    // If no period is stored, default to the current semester
    const currentMonth = new Date().getMonth(); // 0-11
    if (currentMonth <= 5) { // Jan-Jun (0-5)
      return 13; // 1º Semestre
    } else { // Jul-Dec (6-11)
      return 14; // 2º Semestre
    }
  });

  // Funções para atualizar o estado e o localStorage
  const setYear = (newYear) => {
    setYearState(newYear);
    localStorage.setItem('dateFilterYear', newYear.toString());
    // NEW: Reset periodType to 'Ano Todo' when year changes
    setPeriodTypeState(0);
    localStorage.setItem('dateFilterPeriodType', '0');
  };

  // NEW: setPeriodType function
  const setPeriodType = (newPeriodType) => {
    setPeriodTypeState(newPeriodType);
    localStorage.setItem('dateFilterPeriodType', newPeriodType.toString());
  };

  const value = useMemo(() => {
    let startDate = null;
    let endDate = null;

    if (periodType >= 1 && periodType <= 12) { // Specific month selected
      startDate = new Date(Date.UTC(year, periodType - 1, 1)); // month - 1 because months are 0-indexed in JS Date
      endDate = new Date(Date.UTC(year, periodType, 0, 23, 59, 59, 999)); // Last day of the selected month
    } else if (periodType === 13) { // 1º semestre (Janeiro a Junho)
      startDate = new Date(Date.UTC(year, 0, 1));
      endDate = new Date(Date.UTC(year, 5, 30, 23, 59, 59, 999));
    } else if (periodType === 14) { // 2º semestre (Julho a Dezembro)
      startDate = new Date(Date.UTC(year, 6, 1));
      endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    } else { // Ano todo (0 ou qualquer outro valor)
      startDate = new Date(Date.UTC(year, 0, 1));
      endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    }

    return {
      year,
      setYear,
      periodType,
      setPeriodType,
      startDate: startDate ? startDate.toISOString().split('T')[0] : null,
      endDate: endDate ? endDate.toISOString().split('T')[0] : null
    };
  }, [year, periodType]);

  return (
    <DateFilterContext.Provider value={value}>
      {children}
    </DateFilterContext.Provider>
  );
};

export const useDateFilter = () => {
  const context = useContext(DateFilterContext);
  if (context === undefined) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
};
