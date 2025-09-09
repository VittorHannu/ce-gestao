import React from 'react';
import { Button } from '@/01-shared/components/ui/button';
import { useUpdate } from '@/01-shared/context/UpdateContext';
import { Alert, AlertDescription, AlertTitle } from '@/01-shared/components/ui/alert';
import { Rocket } from 'lucide-react';

const UpdateManager = () => {
  const {
    isUpdateAvailable,
    checkingForUpdate,
    checkForUpdates,
    updateApp
  } = useUpdate();

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-foreground">Atualização do Aplicativo</h3>
      
      {isUpdateAvailable && (
        <Alert className="mt-4 border-green-500 text-green-600">
          <Rocket className="h-4 w-4 !text-green-600" />
          <AlertTitle className="font-bold !text-green-700">Nova versão disponível!</AlertTitle>
          <AlertDescription>
            <p className="mb-4 text-sm">
              Uma nova versão do aplicativo está pronta para ser instalada.
            </p>
            <Button onClick={updateApp} className="bg-green-600 hover:bg-green-700 text-white">
              Atualizar Agora e Reiniciar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-4 rounded-lg border bg-card text-card-foreground">
        <div className="p-6">
          <p className="text-sm text-muted-foreground mb-4">
            Se o aplicativo parecer desatualizado, force uma verificação por uma nova versão aqui.
          </p>
          <Button onClick={checkForUpdates} disabled={checkingForUpdate || isUpdateAvailable}>
            {checkingForUpdate ? 'Verificando...' : 'Verificar se há Atualizações'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpdateManager;
