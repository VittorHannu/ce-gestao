import React from 'react';
import { usePWAUpdate } from '@/01-shared/context/PWAUpdateContext';
import SettingsItem from '@/01-shared/components/settings/SettingsItem';
import { Rocket } from 'lucide-react';

function PwaUpdateSettings() {
  const { isUpdateAvailable, updateApp } = usePWAUpdate();

  if (!isUpdateAvailable) {
    return (
      <SettingsItem
        label="Buscar Atualizações"
        value="Nenhuma atualização disponível"
        isLast={true}
        icon={Rocket}
        iconColor="bg-gray-500"
      />
    );
  }

  return (
    <SettingsItem
      label="Atualização Disponível"
      value="Instalar nova versão"
      isLast={true}
      icon={Rocket}
      iconColor="bg-green-500 animate-pulse"
      onClick={updateApp}
    />
  );
}

export default PwaUpdateSettings;