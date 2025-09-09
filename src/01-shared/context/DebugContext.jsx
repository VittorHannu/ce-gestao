import React, { createContext, useState, useEffect, useContext } from 'react';

const DebugContext = createContext();

export const DebugProvider = ({ children }) => {
  const [isErudaEnabled, setIsErudaEnabled] = useState(() => {
    return localStorage.getItem('erudaEnabled') === 'true';
  });

  const erudaRef = React.useRef(null);

  useEffect(() => {
    const loadEruda = async () => {
      if (isErudaEnabled) {
        try {
          const erudaModule = await import('eruda');
          erudaModule.default.init();
          erudaRef.current = erudaModule.default; // Store the eruda instance
          localStorage.setItem('erudaEnabled', 'true');
        } catch (error) {
          console.error('Failed to load Eruda', error);
        }
      } else {
        if (erudaRef.current) {
          erudaRef.current.destroy();
          erudaRef.current = null; // Clear the ref
        }
        localStorage.setItem('erudaEnabled', 'false');
      }
    };

    loadEruda();

    // Cleanup function for useEffect
    return () => {
      if (!isErudaEnabled && erudaRef.current) {
        erudaRef.current.destroy();
        erudaRef.current = null;
      }
    };
  }, [isErudaEnabled]);

  return (
    <DebugContext.Provider value={{ isErudaEnabled, setIsErudaEnabled }}>
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
