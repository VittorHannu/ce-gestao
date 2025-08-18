// public/service-worker.js
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  clients.claim();
});

self.addEventListener('push', (event) => {
  const data = event.data.json();
  console.log('Push received:', data);

  const title = data.title || 'Nova Notificação';
  const options = {
    body: data.body || 'Você tem uma nova mensagem.',
    icon: '/favicon.ico', // You can customize this
    badge: '/favicon.ico', // You can customize this
    data: {
      url: data.url || '/' // URL to open when notification is clicked
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
