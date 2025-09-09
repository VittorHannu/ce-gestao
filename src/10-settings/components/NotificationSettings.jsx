import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/01-shared/components/ui/button';

const NotificationSettings = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleSubscriptionChange = useCallback(() => {
    setIsLoading(true);
    if (isSubscribed) {
      window.OneSignal.setSubscription(false);
    } else {
      window.OneSignal.showSlidedownPrompt();
    }
  }, [isSubscribed]);

  useEffect(() => {
    const setupOneSignal = () => {
      const updateStatus = async () => {
        setIsLoading(true);
        try {
          const isPushEnabled = await window.OneSignal.isPushNotificationsEnabled();
          setIsSubscribed(isPushEnabled);
        } catch (error) {
          console.error('OneSignal: Erro ao verificar status da inscrição', error);
        }
        setIsLoading(false);
      };

      updateStatus();

      const onSubscriptionChange = (subscribed) => {
        console.log('OneSignal: Inscrição alterada para:', subscribed);
        setIsSubscribed(subscribed);
        setIsLoading(false); // Para de carregar quando o evento de mudança é recebido
      };

      window.OneSignal.on('subscriptionChange', onSubscriptionChange);

      return () => {
        window.OneSignal.off('subscriptionChange', onSubscriptionChange);
      };
    };

    if (window.OneSignal) {
      window.OneSignal.push(setupOneSignal);
    }

    // Cleanup no caso do componente ser desmontado antes do OneSignal carregar
    return () => {
      if (window.OneSignal) {
        window.OneSignal.push(() => {
          window.OneSignal.off('subscriptionChange');
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
