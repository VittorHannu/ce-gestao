import React, { useState, useEffect } from 'react';
import { Button } from '@/01-shared/components/ui/button';

const NotificationSettings = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const OneSignal = window.OneSignal || [];

    const updateSubscriptionStatus = async () => {
      const isPushEnabled = await OneSignal.isPushNotificationsEnabled();
      setIsSubscribed(isPushEnabled);
      setIsLoading(false);
    };

    OneSignal.push(() => {
      // Run after OneSignal is initialized
      updateSubscriptionStatus();

      OneSignal.on('subscriptionChange', function (isSubscribed) {
        console.log('A inscrição de notificação foi alterada para:', isSubscribed);
        setIsSubscribed(isSubscribed);
      });
    });

    // Cleanup listener on component unmount
    return () => {
        OneSignal.push(() => {
            OneSignal.off('subscriptionChange');
        });
    };
  }, []);

  const handleSubscriptionChange = async () => {
    const OneSignal = window.OneSignal || [];
    setIsLoading(true);
    await OneSignal.push(async () => {
      if (isSubscribed) {
        // Unsubscribe
        await OneSignal.setSubscription(false);
      } else {
        // Subscribe
        await OneSignal.showSlidedownPrompt();
      }
      // The subscriptionChange event will update the state
    });
    // Give OneSignal a moment to process and fire the event
    setTimeout(() => setIsLoading(false), 1000);
  };

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
