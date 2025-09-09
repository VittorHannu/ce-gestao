export const initOneSignal = () => {
  const OneSignal = window.OneSignal || [];
  // Roda a inicialização em produção ou desenvolvimento
  if (import.meta.env.PROD || import.meta.env.DEV) {
    OneSignal.push(function() {
      OneSignal.init({
        appId: import.meta.env.VITE_ONESIGNAL_APP_ID, // A sua App ID virá aqui
        safari_web_id: import.meta.env.VITE_ONESIGNAL_SAFARI_WEB_ID, // Opcional, para Safari
        allowLocalhostAsSecureOrigin: true,
        promptOptions: {
          customlink: {
            enabled: true,
            style: 'button',
            size: 'medium',
            text: {
              subscribe: 'Inscrever-se para receber notificações',
              unsubscribe: 'Cancelar inscrição de notificações'
            }
          }
        }
      });
    });
  } else {
    console.log('OneSignal: Inicialização não realizada (ambiente desconhecido).');
  }
};
