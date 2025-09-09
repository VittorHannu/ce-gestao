const ONE_SIGNAL_SDK_URL = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
let isOneSignalInitialized = false;

/**
 * Carrega dinamicamente o script do OneSignal SDK.
 * Evita recarregar o script se ele já estiver na página.
 * @returns {Promise<void>} Resolve quando o script é carregado, rejeita em caso de erro.
 */
const loadOneSignalScript = () => {
  return new Promise((resolve, reject) => {
    // Verifica se o script já foi injetado
    if (document.querySelector(`script[src="${ONE_SIGNAL_SDK_URL}"]`)) {
      // Se o OneSignal já estiver disponível, resolve imediatamente
      if (window.OneSignal) {
        return resolve();
      }
      // Se o script existe mas o OneSignal não está pronto, espera pelo carregamento
      const script = document.querySelector(`script[src="${ONE_SIGNAL_SDK_URL}"]`);
      script.addEventListener('load', resolve);
      script.addEventListener('error', reject);
      return;
    }

    // Cria e injeta o script
    const script = document.createElement('script');
    script.src = ONE_SIGNAL_SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (error) => {
      console.error("OneSignal: Falha ao carregar o SDK.", error);
      reject(error);
    };
    document.head.appendChild(script);
  });
};

/**
 * Inicializa o OneSignal após garantir que o SDK foi carregado.
 * Só executa em ambiente de produção ou desenvolvimento.
 */
export const initOneSignal = async () => {
  if (isOneSignalInitialized) {
    console.log("OneSignal: Já inicializado.");
    return;
  }

  // Não executa em ambientes que não sejam DEV ou PROD
  if (!import.meta.env.PROD && !import.meta.env.DEV) {
    console.log("OneSignal: Inicialização não realizada (ambiente não suportado).");
    return;
  }

  try {
    await loadOneSignalScript();
    
    const OneSignal = window.OneSignal || [];
    OneSignal.push(function() {
      OneSignal.init({
        appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
        safari_web_id: import.meta.env.VITE_ONESIGNAL_SAFARI_WEB_ID,
        allowLocalhostAsSecureOrigin: true,
      });
    });
    
    isOneSignalInitialized = true;
    console.log("OneSignal: SDK inicializado com sucesso.");

  } catch (error) {
    console.error("OneSignal: Não foi possível inicializar o SDK. Push Notifications podem não funcionar.", error);
  }
};