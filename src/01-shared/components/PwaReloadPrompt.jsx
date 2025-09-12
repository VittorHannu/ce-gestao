
import React from 'react';
import { usePWAUpdate } from '@/01-shared/context/PWAUpdateContext';
import { Button } from '@/01-shared/components/ui/button';
import { Rocket } from 'lucide-react';

function PwaReloadPrompt() {
  const {
    isUpdateAvailable,
    promptVisible,
    dismissPrompt,
    updateApp
  } = usePWAUpdate();

  if (isUpdateAvailable && promptVisible) {
    return (
      <div className="fixed right-4 bottom-4 z-50 p-4 bg-gray-800 text-white rounded-lg shadow-lg flex items-center gap-4">
        <div className="flex-grow">
          <h3 className="font-bold flex items-center">
            <Rocket className="mr-2 animate-pulse" />
            Atualização Disponível
          </h3>
          <p className="text-sm text-gray-300">Uma nova versão do aplicativo está pronta para ser instalada.</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={updateApp} className="bg-blue-500 hover:bg-blue-600 text-white">
            Atualizar
          </Button>
          <Button onClick={dismissPrompt} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            Ignorar
          </Button>
        </div>
      </div>
    );
  }

  // O toast 'offlineReady' pode ser útil, mas para manter a UI limpa, vamos omiti-lo por enquanto.
  // Se o suporte offline precisar ser mais explícito, podemos reativá-lo.
  /*
  if (offlineReady) {
    return (
      <div className="fixed right-4 bottom-4 z-50 p-4 bg-green-600 text-white rounded-lg shadow-lg">
        <p>Aplicativo pronto para funcionar offline.</p>
        <Button onClick={() => setOfflineReady(false)} className="mt-2">
          Fechar
        </Button>
      </div>
    );
  }
  */

  return null;
}

export default PwaReloadPrompt;
