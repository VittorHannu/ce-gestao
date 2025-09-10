const ONE_SIGNAL_SDK_URL = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';

// Estado global para controlar a inicialização
let isOneSignalInitialized = false;
let initializationPromise = null;
let oneSignalInstance = null;

/**
 * Carrega dinamicamente o script do OneSignal SDK.
 */
const loadOneSignalScript = () => {
  return new Promise((resolve, reject) => {
    // Verifica se o script já existe
    const existingScript = document.querySelector(`script[src="${ONE_SIGNAL_SDK_URL}"]`);

    if (existingScript) {
      if (window.OneSignal) {
        return resolve();
      }
      // Se o script existe mas OneSignal não está disponível, aguarda o carregamento
      existingScript.addEventListener('load', resolve);
      existingScript.addEventListener('error', reject);
      return;
    }

    // Cria e adiciona o script
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
 * Verifica se o OneSignal está disponível e pronto
 */
const waitForOneSignal = () => {
  return new Promise((resolve) => {
    if (window.OneSignal && typeof window.OneSignal.init === 'function') {
      resolve();
      return;
    }

    // Aguarda até que OneSignal esteja disponível
    const checkInterval = setInterval(() => {
      if (window.OneSignal && typeof window.OneSignal.init === 'function') {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);

    // Timeout após 10 segundos
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve(); // Resolve anyway to let init check for window.OneSignal
    }, 10000);
  });
};

/**
 * Inicializa o OneSignal de forma segura
 */
export const initOneSignal = async () => {
  // Se já está inicializando, retorna a promise existente
  if (initializationPromise) {
    return initializationPromise;
  }

  // Se já foi inicializado, retorna true
  if (isOneSignalInitialized && window.OneSignal) {
    return true;
  }

  initializationPromise = (async () => {
    try {
      console.log('OneSignal: Iniciando carregamento do SDK...');

      // Carrega o script do OneSignal
      await loadOneSignalScript();

      // Aguarda o OneSignal estar disponível
      await waitForOneSignal();

      if (!window.OneSignal) {
        throw new Error('OneSignal SDK não foi carregado corretamente');
      }

      // Verifica se já foi inicializado anteriormente
      if (window.OneSignal.initialized) {
        console.log('OneSignal: Já estava inicializado.');
        isOneSignalInitialized = true;
        oneSignalInstance = window.OneSignal;
        return true;
      }

      console.log('OneSignal: Inicializando SDK...');

      // Inicializa o OneSignal
      await window.OneSignal.init({
        appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
        safari_web_id: import.meta.env.VITE_ONESIGNAL_SAFARI_WEB_ID,
        allowLocalhostAsSecureOrigin: true,
        autoResubscribe: true,
        autoRegister: false, // Não registra automaticamente
        notifyButton: {
          enable: false // Desabilita o botão padrão
        }
      });

      // Aguarda a inicialização completa
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout na inicialização do OneSignal'));
        }, 15000);

        window.OneSignal.on('initialized', () => {
          clearTimeout(timeout);
          console.log('OneSignal: Inicializado com sucesso.');
          isOneSignalInitialized = true;
          oneSignalInstance = window.OneSignal;
          resolve();
        });
      });

      return true;
    } catch (error) {
      console.error('OneSignal: Erro na inicialização:', error);
      // Reset do estado em caso de erro
      isOneSignalInitialized = false;
      initializationPromise = null;
      oneSignalInstance = null;
      return false;
    }
  })();

  return initializationPromise;
};

/**
 * Retorna se o OneSignal está pronto para uso
 */
export const isOneSignalReady = () => {
  return isOneSignalInitialized && window.OneSignal && window.OneSignal.initialized;
};

/**
 * Obtém a instância do OneSignal
 */
export const getOneSignalInstance = () => {
  return oneSignalInstance || window.OneSignal;
};

/**
 * Verifica se o usuário está inscrito para notificações
 */
export const isUserSubscribed = async () => {
  if (!isOneSignalReady()) {
    return false;
  }

  try {
    // Tenta usar a API mais nova primeiro
    if (window.OneSignal.Notifications && window.OneSignal.Notifications.isPushSubscribed) {
      return await window.OneSignal.Notifications.isPushSubscribed();
    }

    // Fallback para API mais antiga
    if (window.OneSignal.isPushNotificationsEnabled) {
      return new Promise((resolve) => {
        window.OneSignal.isPushNotificationsEnabled(resolve);
      });
    }

    return false;
  } catch (error) {
    console.error('OneSignal: Erro ao verificar status de inscrição:', error);
    return false;
  }
};

/**
 * Solicita permissão para notificações
 */
export const requestNotificationPermission = async () => {
  if (!isOneSignalReady()) {
    throw new Error('OneSignal não está pronto');
  }

  try {
    // Tenta usar a API mais nova primeiro
    if (window.OneSignal.Slidedown && window.OneSignal.Slidedown.promptPush) {
      return await window.OneSignal.Slidedown.promptPush();
    }

    // Fallback para API mais antiga
    if (window.OneSignal.showSlidedownPrompt) {
      return await window.OneSignal.showSlidedownPrompt();
    }

    throw new Error('Método de solicitação de permissão não encontrado');
  } catch (error) {
    console.error('OneSignal: Erro ao solicitar permissão:', error);
    throw error;
  }
};

/**
 * Cancela a inscrição de notificações
 */
export const unsubscribeFromNotifications = async () => {
  if (!isOneSignalReady()) {
    throw new Error('OneSignal não está pronto');
  }

  try {
    // Tenta usar a API mais nova primeiro
    if (window.OneSignal.Notifications && window.OneSignal.Notifications.setSubscription) {
      return await window.OneSignal.Notifications.setSubscription(false);
    }

    // Fallback para API mais antiga
    if (window.OneSignal.setSubscription) {
      return await window.OneSignal.setSubscription(false);
    }

    throw new Error('Método de cancelamento de inscrição não encontrado');
  } catch (error) {
    console.error('OneSignal: Erro ao cancelar inscrição:', error);
    throw error;
  }
};

/**
 * Obtém o ID do usuário do OneSignal
 */
export const getOneSignalUserId = async () => {
  if (!isOneSignalReady()) {
    return null;
  }

  try {
    // Tenta usar a API mais nova primeiro
    if (window.OneSignal.User && window.OneSignal.User.onesignalId) {
      return window.OneSignal.User.onesignalId;
    }

    // Fallback para API mais antiga
    if (window.OneSignal.getUserId) {
      return await window.OneSignal.getUserId();
    }

    return null;
  } catch (error) {
    console.error('OneSignal: Erro ao obter ID do usuário:', error);
    return null;
  }
};

/**
 * Reset completo do OneSignal (para debugging)
 */
export const resetOneSignal = () => {
  isOneSignalInitialized = false;
  initializationPromise = null;
  oneSignalInstance = null;
  console.log('OneSignal: Estado resetado.');
};

/**
 * Associa o usuário atual ao OneSignal.
 * @param {string} externalId O ID do usuário no seu sistema.
 */
export const loginOneSignal = async (externalId) => {
  if (!isOneSignalReady()) {
    console.error('OneSignal: Não é possível fazer login, SDK não está pronto.');
    return;
  }
  if (!externalId) {
    console.error('OneSignal: ID externo do usuário não fornecido para login.');
    return;
  }

  try {
    console.log(`OneSignal: Associando usuário com ID externo: ${externalId}`);
    await window.OneSignal.login(externalId);
    console.log('OneSignal: Usuário associado com sucesso.');
  } catch (error) {
    console.error('OneSignal: Erro ao associar usuário:', error);
  }
};

/**
 * Desassocia o usuário atual do OneSignal.
 */
export const logoutOneSignal = async () => {
  if (!isOneSignalReady()) {
    console.error('OneSignal: Não é possível fazer logout, SDK não está pronto.');
    return;
  }

  try {
    console.log('OneSignal: Desassociando usuário.');
    await window.OneSignal.logout();
    console.log('OneSignal: Usuário desassociado com sucesso.');
  } catch (error) {
    console.error('OneSignal: Erro ao desassociar usuário:', error);
  }
};
