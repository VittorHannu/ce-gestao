import React from 'react';
import { usePWAUpdate } from '@/01-shared/context/PWAUpdateContext';
import SettingsItem from '@/01-shared/components/settings/SettingsItem';

function PwaUpdateSettings() {
  const { isUpdateAvailable } = usePWAUpdate();

  if (isUpdateAvailable) {
    return (
      <SettingsItem
        label="Atualização Disponível"
        description="Feche e abra o aplicativo para aplicar a nova versão."
        isLast={false}
      />
    );
  }

  return (
    <SettingsItem
      label="Status da Versão"
      description="Seu aplicativo está atualizado."
      isLast={false}
    />
  );
}

export default PwaUpdateSettings;