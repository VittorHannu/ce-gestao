/* eslint-disable no-restricted-globals */

// public/service-worker.js

const STATIC_CACHE_NAME = 'sgi-copa-static-v1';
const DYNAMIC_CACHE_NAME = 'sgi-copa-dynamic-v1';

// Arquivos essenciais da "App Shell"
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// --- CICLO DE VIDA DO SERVICE WORKER ---

// 1. Instalação: Faz o pré-cache da App Shell
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('Service Worker: Pré-cache da App Shell');
      // O addAll falhará se qualquer um dos arquivos não for encontrado.
      return cache.addAll(APP_SHELL_URLS).catch(error => {
        console.error('Service Worker: Falha no pré-cache da App Shell:', error);
      });
    })
  );
  self.skipWaiting();
});

// 2. Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// --- INTERCEPTAÇÃO DE REDE E ESTRATÉGIA DE CACHE ---

// 3. Fetch: Usa a estratégia Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não são GET e de extensões do chrome
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Estratégia: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Se a requisição for bem sucedida, atualiza o cache dinâmico
        return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });

      // Retorna a resposta do cache imediatamente se existir,
      // enquanto a requisição de rede acontece em segundo plano.
      // Se não houver cache, espera a resposta da rede.
      return cachedResponse || fetchPromise;
    }).catch(() => {
      // Se tanto o cache quanto a rede falharem, pode-se retornar uma página de fallback offline
      // return caches.match('/offline.html');
    })
  );
});


// --- MANIPULADORES DE PUSH NOTIFICATION (LÓGICA EXISTENTE) ---

self.addEventListener('push', (event) => {
  const data = event.data.json();
  console.log('Push received:', data);

  const title = data.title || 'Nova Notificação';
  const options = {
    body: data.body || 'Você tem uma nova mensagem.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});