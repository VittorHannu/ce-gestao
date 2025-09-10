import React, { createContext, useState, useEffect, useContext } from 'react';

const DebugContext = createContext();

export const DebugProvider = ({ children }) => {
  const [isErudaEnabled, setIsErudaEnabled] = useState(() => {
    return localStorage.getItem('erudaEnabled') === 'true';
  });

  const [isDebugLogsEnabled, setIsDebugLogsEnabled] = useState(() => {
    return localStorage.getItem('debugLogsEnabled') === 'true';
  });

  const erudaRef = React.useRef(null);

  

  useEffect(() => {
    const loadEruda = async () => {
      if (isErudaEnabled) {
        try {
          const erudaModule = await import('eruda');
          erudaModule.default.init();
          erudaRef.current = erudaModule.default;
          localStorage.setItem('erudaEnabled', 'true');
        } catch (error) {
          console.error('Failed to load Eruda', error);
        }
      } else {
        if (erudaRef.current) {
          erudaRef.current.destroy();
          erudaRef.current = null;
        }
        localStorage.setItem('erudaEnabled', 'false');
      }
    };

    loadEruda();

    return () => {
      if (!isErudaEnabled && erudaRef.current) {
        erudaRef.current.destroy();
        erudaRef.current = null;
      }
    };
  }, [isErudaEnabled]);

  return (
    <DebugContext.Provider value={{ isErudaEnabled, setIsErudaEnabled, isDebugLogsEnabled, setIsDebugLogsEnabled }}>
      {children}
    </DebugContext.Provider>
  );
};

export const useDebug = () => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
};
