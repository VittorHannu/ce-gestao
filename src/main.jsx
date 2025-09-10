import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DebugProvider } from './01-shared/context/DebugContext.jsx';
import '@/00-global/styles/index.css';
import App from './App.jsx';

// START: Global console.log override
(function () {
  const isDebugEnabled = localStorage.getItem('debugLogsEnabled') === 'true';
  const originalConsoleLog = console.log;

  console.log = function () {
    if (isDebugEnabled) {
      originalConsoleLog.apply(console, arguments);
    }
  };
})();
// END: Global console.log override

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <DebugProvider>
        <App />
      </DebugProvider>
    </QueryClientProvider>
  </StrictMode>
);

