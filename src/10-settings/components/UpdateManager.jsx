import React from 'react';
import SettingsGroup from '@/01-shared/components/settings/SettingsGroup';
import SettingsItem from '@/01-shared/components/settings/SettingsItem';
import { useUpdate } from '@/01-shared/context/UpdateContext';
import { Button } from '@/01-shared/components/ui/button';
import { Rocket, CheckCircle, Calendar } from 'lucide-react';

function UpdateManager() {
  const { 
    isUpdateAvailable, 
    checkingForUpdate, 
    checkForUpdates, 
    installUpdate,
    dismissUpdate
  } = useUpdate();
  
  const version = import.meta.env.VITE_APP_VERSION;
  const buildDate = import.meta.env.VITE_APP_BUILD_DATE;

  const handleUpdateAction = () => {
    if (isUpdateAvailable) {
      if (window.confirm('Uma nova versão está disponível. Deseja reiniciar o aplicativo para instalar a atualização?')) {
        installUpdate();
      }
    } else {
      checkForUpdates();
    }
  };

  return (
    <SettingsGroup title="Sobre o Aplicativo">
      <div className="px-4 pt-2 pb-4 space-y-2">
        {isUpdateAvailable ? (
          <div className="p-3 mb-2 text-center bg-green-100 dark:bg-green-900/50 rounded-lg">
            <h3 className="font-semibold text-green-800 dark:text-green-200">Nova versão disponível!</h3>
            <p className="text-sm text-green-700 dark:text-green-300">Instale para obter os recursos mais recentes.</p>
          </div>
        ) : (
           <p className="text-xs text-center text-muted-foreground">Clique para verificar se há uma nova versão.</p>
        )}

        <Button 
          onClick={handleUpdateAction} 
          disabled={checkingForUpdate}
          className="w-full"
        >
          {checkingForUpdate ? (
            'Verificando...'
          ) : isUpdateAvailable ? (
            <>
              <Rocket className="mr-2 h-4 w-4 animate-pulse" />
              Instalar Atualização
            </>
          ) : (
            'Verificar se há atualizações'
          )}
        </Button>
        {isUpdateAvailable && (
            <Button variant="ghost" size="sm" className="w-full" onClick={() => dismissUpdate()}>
                Ignorar por agora
            </Button>
        )}
      </div>

      <SettingsItem
        label={`Versão do App`}
        value={`${version} (ver histórico)`}
        isLast={false}
        icon={CheckCircle}
        iconColor="bg-blue-500"
        path="/version-history"
      />
       <SettingsItem
        label={`Data da Compilação`}
        value={buildDate}
        isLast={true}
        icon={Calendar}
        iconColor="bg-purple-500"
      />
    </SettingsGroup>
  );
}

export default UpdateManager;
