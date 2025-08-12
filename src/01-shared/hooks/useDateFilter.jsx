import React, { createContext, useState, useContext, useMemo } from 'react';

const DateFilterContext = createContext();

export const DateFilterProvider = ({ children }) => {
  const [year, setYearState] = useState(() => {
    const storedYear = localStorage.getItem('dateFilterYear');
    return storedYear ? parseInt(storedYear, 10) : new Date().getFullYear();
  });
  const [semester, setSemesterState] = useState(() => {
    const storedSemester = localStorage.getItem('dateFilterSemester');
    return storedSemester ? parseInt(storedSemester, 10) : 0;
  });

  // Funções para atualizar o estado e o localStorage
  const setYear = (newYear) => {
    setYearState(newYear);
    localStorage.setItem('dateFilterYear', newYear.toString());
  };

  const setSemester = (newSemester) => {
    setSemesterState(newSemester);
    localStorage.setItem('dateFilterSemester', newSemester.toString());
  };

  const value = useMemo(() => {
    let startDate = null;
    let endDate = null;

    if (semester === 1) { // 1º semestre (Janeiro a Junho)
      startDate = new Date(Date.UTC(year, 0, 1));
      endDate = new Date(Date.UTC(year, 5, 30, 23, 59, 59, 999));
    } else if (semester === 2) { // 2º semestre (Julho a Dezembro)
      startDate = new Date(Date.UTC(year, 6, 1));
      endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    } else { // Ano todo (0 ou qualquer outro valor)
      startDate = new Date(Date.UTC(year, 0, 1));
      endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    }

    return {
      year,
      setYear,
      semester,
      setSemester,
      startDate: startDate ? startDate.toISOString().split('T')[0] : null, // Formato YYYY-MM-DD
      endDate: endDate ? endDate.toISOString().split('T')[0] : null // Formato YYYY-MM-DD
    };
  }, [year, semester]);

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
