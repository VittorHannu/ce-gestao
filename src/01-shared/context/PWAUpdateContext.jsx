import React, { createContext, useContext, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const PWAUpdateContext = createContext();

export const usePWAUpdate = () => useContext(PWAUpdateContext);

export const PWAUpdateProvider = ({ children }) => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const [promptVisible, setPromptVisible] = useState(true);

  const dismissPrompt = () => {
    setPromptVisible(false);
  };

  const value = {
    isUpdateAvailable: needRefresh,
    promptVisible,
    dismissPrompt,
    updateApp: () => updateServiceWorker(true),
    offlineReady,
    setOfflineReady,
  };

  return (
    <PWAUpdateContext.Provider value={value}>
      {children}
    </PWAUpdateContext.Provider>
  );
};