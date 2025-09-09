import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/01-shared/components/ui/button';
import { initOneSignal } from '@/01-shared/lib/oneSignal';

const NotificationSettings = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleSubscriptionChange = useCallback(() => {
    if (isLoading) return;

    setIsLoading(true);
    if (isSubscribed) {
      window.OneSignal.setSubscription(false);
    } else {
      window.OneSignal.showSlidedownPrompt();
    }
  }, [isSubscribed, isLoading]);

  useEffect(() => {
    let isMounted = true;
    let cleanupOneSignal = () => {};

    const initializeAndSetup = async () => {
      // Garante que o SDK esteja pronto antes de qualquer outra coisa
      await initOneSignal(); 

      if (!window.OneSignal) {
        console.error('OneSignal SDK não pôde ser inicializado.');
        if (isMounted) setIsLoading(false);
        return;
      }

      // Usa a fila de comandos do OneSignal para garantir execução segura
      window.OneSignal.push(async () => {
        if (!isMounted) return;

        try {
          const isPushEnabled = await window.OneSignal.isPushNotificationsEnabled();
          if (isMounted) setIsSubscribed(isPushEnabled);
        } catch (error) {
          console.error('OneSignal: Erro ao verificar status da inscrição', error);
        } finally {
          if (isMounted) setIsLoading(false);
        }

        const onSubscriptionChange = (subscribed) => {
          if (isMounted) {
            console.log('OneSignal: Inscrição alterada para:', subscribed);
            setIsSubscribed(subscribed);
            setIsLoading(false);
          }
        };

        window.OneSignal.on('subscriptionChange', onSubscriptionChange);
        
        // Prepara a função de limpeza
        cleanupOneSignal = () => {
          window.OneSignal.off('subscriptionChange', onSubscriptionChange);
        };
      });
    };

    initializeAndSetup();

    // Função de limpeza do useEffect
    return () => {
      isMounted = false;
      if (window.OneSignal) {
        window.OneSignal.push(() => {
          cleanupOneSignal();
        });
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">Notificações do Navegador (Push)</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Use o botão abaixo para ativar ou desativar as notificações em tempo real neste navegador.
        </p>
        <Button
          onClick={handleSubscriptionChange}
          disabled={isLoading}
        >
          {isLoading
            ? 'Carregando...'
            : isSubscribed
              ? 'Cancelar Inscrição'
              : 'Inscrever-se para Notificações'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;