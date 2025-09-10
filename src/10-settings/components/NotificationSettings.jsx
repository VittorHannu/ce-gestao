import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/01-shared/components/ui/button';
import { initOneSignal, isOneSignalReady } from '@/01-shared/lib/oneSignal';
const NotificationSettings = () => {
 const [isSubscribed, setIsSubscribed] = useState(false);
 const [isLoading, setIsLoading] = useState(true);
 const [oneSignalReady, setOneSignalReady] = useState(false);
 const checkSubscriptionStatus = useCallback(async () => {
   if (!window.OneSignal) {
     console.error('OneSignal não disponível');
     setIsLoading(false);
     return;
   }
   try {
     // Usando a API correta para v16+
     const isPushEnabled = await window.OneSignal.Notifications.isPushSubscribed();
     setIsSubscribed(isPushEnabled);
   } catch (error) {
     console.error('Erro ao verificar status da inscrição:', error);
     // Fallback para API mais antiga se necessário
     if (window.OneSignal.isPushNotificationsEnabled) {
       window.OneSignal.isPushNotificationsEnabled((isEnabled) => {
         setIsSubscribed(isEnabled);
       });
     }
   } finally {
     setIsLoading(false);
   }
 }, []);
 const handleSubscriptionChange = useCallback(async () => {
   if (isLoading || !oneSignalReady) return;
   setIsLoading(true);
   try {
     if (isSubscribed) {
       // Usando a API correta para v16+
       await window.OneSignal.Notifications.setSubscription(false);
     } else {
       // Usando a API correta para v16+
       await window.OneSignal.Slidedown.promptPush();
     }
   } catch (error) {
     console.error('Erro ao alterar inscrição:', error);
     // Fallback para API mais antiga se necessário
     if (isSubscribed) {
       window.OneSignal.setSubscription(false);
     } else {
       window.OneSignal.showSlidedownPrompt();
     }
   }
 }, [isSubscribed, isLoading, oneSignalReady]);
 useEffect(() => {
   let isMounted = true;
   let subscriptionChangeHandler = null;
   const initializeOneSignal = async () => {
     try {
       const success = await initOneSignal();
       if (!isMounted) return;
       setOneSignalReady(success);
       if (!success) {
         setIsLoading(false);
         return;
       }
       // Configura o listener de mudança de subscription
       subscriptionChangeHandler = (isSubscribed) => {
         if (isMounted) {
           setIsSubscribed(isSubscribed);
         }
       };
       window.OneSignal.on('subscriptionChange', subscriptionChangeHandler);
       // Verifica o status atual
       await checkSubscriptionStatus();
     } catch (error) {
       console.error('Falha na inicialização do OneSignal:', error);
       if (isMounted) {
         setIsLoading(false);
       }
     }
   };
   // Se OneSignal já estiver pronto, apenas configura os listeners
   if (isOneSignalReady()) {
     setOneSignalReady(true);
     checkSubscriptionStatus();
     subscriptionChangeHandler = (isSubscribed) => {
       if (isMounted) {
         setIsSubscribed(isSubscribed);
       }
     };
     window.OneSignal.on('subscriptionChange', subscriptionChangeHandler);
   } else {
     initializeOneSignal();
   }
   return () => {
     isMounted = false;
     if (window.OneSignal && subscriptionChangeHandler) {
       window.OneSignal.off('subscriptionChange', subscriptionChangeHandler);
     }
   };
 }, [checkSubscriptionStatus]);
 return (
<div class="space-y-6">
<div class="p-4 border rounded-lg">
<h3 class="font-semibold mb-2">Notificações do Navegador (Push)</h3>
<p class="text-sm text-muted-foreground mb-3">
         Use o botão abaixo para ativar ou desativar as notificações em tempo real neste navegador.
</p>
<Button
         onClick={handleSubscriptionChange}
         disabled={isLoading || !oneSignalReady}
>
         {isLoading
           ? 'Carregando...'
           : !oneSignalReady
             ? 'OneSignal Não Inicializado'
             : isSubscribed
               ? 'Cancelar Inscrição'
               : 'Inscrever-se para Notificações'}
</Button>
</div>
</div>
 );
};
export default NotificationSettings;