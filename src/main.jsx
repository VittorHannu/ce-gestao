// Another dummy change for Vercel deploy.
// Dummy change for Vercel deploy.
// Inicia o Eruda apenas em ambiente de desenvolvimento
if (import.meta.env.DEV) {
  import('eruda').then((eruda) => eruda.default.init());
}

/*
 * Este é o arquivo de entrada principal (`main.jsx`) da aplicação React.
 * Ele é responsável por inicializar o aplicativo, renderizar o componente `App`
 * no DOM e configurar o `QueryClientProvider` do React Query, que gerencia
 * o cache e a sincronização de dados em toda a aplicação.
 *
 * Visualmente no seu site, este arquivo não tem impacto direto, pois sua função
 * é de configuração e inicialização de bastidores. Sem ele, o aplicativo React
 * não seria capaz de ser carregado e executado no navegador.
 *
 *
 *
 *
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@/00-global/styles/index.css';
import App from './App.jsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}