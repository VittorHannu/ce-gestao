const ONE_SIGNAL_SDK_URL = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
let isOneSignalInitialized = false;
let initializationPromise = null;
/**
* Carrega dinamicamente o script do OneSignal SDK.
*/
const loadOneSignalScript = () => {
 return new Promise((resolve, reject) => {
   if (document.querySelector(`script[src="${ONE_SIGNAL_SDK_URL}"]`)) {
     if (window.OneSignal) {
       return resolve();
     }
     const script = document.querySelector(`script[src="${ONE_SIGNAL_SDK_URL}"]`);
     script.addEventListener('load', resolve);
     script.addEventListener('error', reject);
     return;
   }
   const script = document.createElement('script');
   script.src = ONE_SIGNAL_SDK_URL;
   script.async = true;
   script.onload = () => resolve();
   script.onerror = (error) => {
     console.error('OneSignal: Falha ao carregar o SDK.', error);
     reject(error);
   };
   document.head.appendChild(script);
 });
};
/**
* Inicializa o OneSignal de forma segura para múltiplas chamadas
*/
export const initOneSignal = async () => {
 // Retorna a promise existente se já estiver inicializando
 if (initializationPromise) {
   return initializationPromise;
 }
 initializationPromise = (async () => {
   if (isOneSignalInitialized) {
     console.log('OneSignal: Já inicializado.');
     return true;
   }
   if (!import.meta.env.PROD && !import.meta.env.DEV) {
     console.log('OneSignal: Inicialização não realizada (ambiente não suportado).');
     return false;
   }
   try {
     await loadOneSignalScript();
     // Verifica se o OneSignal já foi inicializado por outro processo
     if (window.OneSignal && window.OneSignal.initialized) {
       isOneSignalInitialized = true;
       return true;
     }
     await new Promise((resolve, reject) => {
       const OneSignal = window.OneSignal || [];
       OneSignal.push(function() {
         OneSignal.init({
           appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
           safari_web_id: import.meta.env.VITE_ONESIGNAL_SAFARI_WEB_ID,
           allowLocalhostAsSecureOrigin: true
         });
         OneSignal.on('initialized', () => {
           isOneSignalInitialized = true;
           resolve();
         });
         OneSignal.on('initializationFailed', (error) => {
           reject(error);
         });
       });
     });
     console.log('OneSignal: SDK inicializado com sucesso.');
     return true;
   } catch (error) {
     console.error('OneSignal: Não foi possível inicializar o SDK.', error);
     initializationPromise = null;
     return false;
   }
 })();
 return initializationPromise;
};
/**
* Retorna o status de inicialização
*/
export const isOneSignalReady = () => {
 return isOneSignalInitialized;
};