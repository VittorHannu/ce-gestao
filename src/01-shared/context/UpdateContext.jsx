import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToast } from '@/01-shared/hooks/useToast';

const UpdateContext = createContext();

export const useUpdate = () => {
  return useContext(UpdateContext);
};

export const UpdateProvider = ({ children }) => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [checking, setChecking] = useState(false);
  const { toast } = useToast();

  const {
    needRefresh: [needRefresh],
    updateServiceWorker
  } = useRegisterSW();

  useEffect(() => {
    if (needRefresh) {
      setIsUpdateAvailable(true);
    }
  }, [needRefresh]);

  const checkForUpdates = async () => {
    setChecking(true);
    toast({ title: 'Verificando atualizações...' });
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
        // Se uma atualização for encontrada, o estado `needRefresh` do useRegisterSW se tornará true,
        // que por sua vez aciona o `useEffect` acima e define `isUpdateAvailable`.
        toast({
          title: 'Verificação Concluída',
          description: 'Se uma nova versão for encontrada, um indicador aparecerá nas configurações.'
        });
      } else {
        toast({
          title: 'Recurso não disponível',
          description: 'O PWA não parece estar ativo ou não é suportado.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error checking for PWA update:', error);
      toast({
        title: 'Erro ao verificar',
        description: 'Não foi possível conectar para verificar atualizações.',
        variant: 'destructive'
      });
    } finally {
      setChecking(false);
    }
  };

  const updateApp = () => {
    if (needRefresh) {
      updateServiceWorker(true);
    }
  };

  const value = {
    isUpdateAvailable,
    checkingForUpdate: checking,
    checkForUpdates,
    updateApp
  };

  return (
    <UpdateContext.Provider value={value}>
      {children}
    </UpdateContext.Provider>
  );
};
