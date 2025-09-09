import React, { createContext, useContext, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToast } from '@/01-shared/hooks/useToast';

const UpdateContext = createContext();

export const useUpdate = () => {
  return useContext(UpdateContext);
};

export const UpdateProvider = ({ children }) => {
  const { toast } = useToast();
  const [checking, setChecking] = useState(false);

  const {
    needRefresh: [isUpdateAvailable, setIsUpdateAvailable],
    updateServiceWorker
  } = useRegisterSW();

  const checkForUpdates = async () => {
    setChecking(true);
    toast({ title: 'Verificando atualizações...' });
    
    await updateServiceWorker(); 

    setChecking(false);
    
    // The `needRefresh` state will change automatically if an update is found.
    // We can't reliably know the result here, so we check the state *after* a small delay.
    setTimeout(() => {
        if (!isUpdateAvailable) {
            toast({
              title: 'Nenhuma atualização encontrada',
              description: 'Você já está com a versão mais recente.'
            });
        }
    }, 2000); // 2 second delay to allow state to propagate
  };

  const installUpdate = () => {
    updateServiceWorker(true);
  };

  const value = {
    isUpdateAvailable,
    checkingForUpdate: checking,
    checkForUpdates,
    installUpdate,
    dismissUpdate: () => setIsUpdateAvailable(false)
  };

  return (
    <UpdateContext.Provider value={value}>
      {children}
    </UpdateContext.Provider>
  );
};