import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/01-shared/components/ui/button';
import {
  initOneSignal,
  isOneSignalReady,
  isUserSubscribed,
  requestNotificationPermission,
  unsubscribeFromNotifications,
  resetOneSignal
} from '@/01-shared/lib/oneSignal';

const NotificationSettings = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [oneSignalReady, setOneSignalReady] = useState(false);
  const [error, setError] = useState(null);

  // Verifica o status de inscrição
  const checkSubscriptionStatus = useCallback(async () => {
    try {
      setError(null);
      const subscribed = await isUserSubscribed();
      setIsSubscribed(subscribed);
    } catch (error) {
      console.error('Erro ao verificar status da inscrição:', error);
      setError('Erro ao verificar status das notificações');
    }
  }, []);

  // Inicializa o OneSignal
  const initializeOneSignal = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('NotificationSettings: Inicializando OneSignal...');
      const success = await initOneSignal();

      if (success) {
        setOneSignalReady(true);
        await checkSubscriptionStatus();
        // Configura listener para mudanças de inscrição
        if (window.OneSignal) {
          window.OneSignal.on('subscriptionChange', (isSubscribed) => {
            console.log('OneSignal: Mudança de inscrição detectada:', isSubscribed);
            setIsSubscribed(isSubscribed);
          });
        }
      } else {
        setError('Falha ao inicializar o sistema de notificações');
      }
    } catch (error) {
      console.error('Erro na inicialização:', error);
      setError('Erro ao inicializar notificações');
    } finally {
      setIsLoading(false);
    }
  }, [checkSubscriptionStatus]);

  // Manipula mudanças na inscrição
  const handleSubscriptionChange = useCallback(async () => {
    if (isLoading || !oneSignalReady) return;

    try {
      setIsLoading(true);
      setError(null);

      if (isSubscribed) {
        // Cancelar inscrição
        console.log('NotificationSettings: Cancelando inscrição...');
        await unsubscribeFromNotifications();
        setIsSubscribed(false);
      } else {
        // Solicitar permissão e inscrever
        console.log('NotificationSettings: Solicitando permissão...');
        await requestNotificationPermission();
        // O status será atualizado pelo listener de subscriptionChange
      }
    } catch (error) {
      console.error('Erro ao alterar inscrição:', error);
      setError('Erro ao alterar configuração de notificações');
    } finally {
      setIsLoading(false);
    }
  }, [isSubscribed, isLoading, oneSignalReady]);

  // Effect principal
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      // Verifica se OneSignal já está pronto
      if (isOneSignalReady()) {
        console.log('NotificationSettings: OneSignal já está pronto');
        setOneSignalReady(true);
        await checkSubscriptionStatus();
        setIsLoading(false);

        // Configura listener
        if (window.OneSignal) {
          window.OneSignal.on('subscriptionChange', (isSubscribed) => {
            if (isMounted) {
              console.log('OneSignal: Mudança de inscrição detectada:', isSubscribed);
              setIsSubscribed(isSubscribed);
            }
          });
        }
      } else {
        // Inicializa OneSignal
        await initializeOneSignal();
      }
    };

    init();

    return () => {
      isMounted = false;
      // Remove listeners se necessário
      if (window.OneSignal && window.OneSignal.off) {
        window.OneSignal.off('subscriptionChange');
      }
    };
  }, [initializeOneSignal, checkSubscriptionStatus]);

  // Função para retry em caso de erro
  const handleRetry = useCallback(() => {
    setError(null);
    initializeOneSignal();
  }, [initializeOneSignal]);

  // Função para resetar o estado do OneSignal
  const handleReset = useCallback(() => {
    console.log('NotificationSettings: Resetando estado do OneSignal...');
    resetOneSignal();
    // Força um re-render e re-inicialização
    setOneSignalReady(false);
    setIsSubscribed(false);
    handleRetry();
  }, [handleRetry]);


  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">Notificações do Navegador (Push)</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Use o botão abaixo para ativar ou desativar as notificações em
          tempo real neste navegador.
        </p>
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
            <Button
              variant="link"
              size="sm"
              onClick={handleRetry}
              className="ml-2 p-0 h-auto text-red-700 underline"
            >
              Tentar novamente
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleSubscriptionChange}
            disabled={isLoading || !oneSignalReady}
            variant={isSubscribed ? 'destructive' : 'default'}
          >
            {isLoading
              ? 'Carregando...'
              : !oneSignalReady
                ? 'Inicializando...'
                : isSubscribed
                  ? 'Cancelar Inscrição'
                  : 'Inscrever-se para Notificações'}
          </Button>
          {oneSignalReady && (
            <div className="text-xs text-muted-foreground">
              Status: {isSubscribed ? 'Inscrito' : 'Não inscrito'} •
              OneSignal: {oneSignalReady ? 'Pronto' : 'Não inicializado'}
            </div>
          )}
        </div>
        {/* Seção de Debug */}
        <div className="mt-4 pt-4 border-t border-dashed">
          <h4 className="text-xs font-bold text-muted-foreground mb-2">Debug</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            Forçar Reinicialização do OneSignal
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Use isso se as notificações pararem de funcionar ou o estado parecer travado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
