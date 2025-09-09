import React, { createContext, useState, useCallback } from 'react';
import Toast from '@/01-shared/components/ui/Toast';

export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  // This function can accept a string or an object
  const showToast = useCallback((config) => {
    const toastConfig = typeof config === 'string'
      ? { message: config, type: 'info' }
      : config;

    // Map variant to type for compatibility
    if (toastConfig.variant && !toastConfig.type) {
      if (toastConfig.variant === 'destructive') {
        toastConfig.type = 'error';
      } else {
        toastConfig.type = toastConfig.variant;
      }
    }

    setToast({ ...toastConfig, id: Date.now() });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <Toast
          key={toast.id}
          {...toast}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};
