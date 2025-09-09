import React from 'react';
import MainLayout from '@/01-shared/components/MainLayout';
import SettingsGroup from '@/01-shared/components/settings/SettingsGroup';
import SettingsItem from '@/01-shared/components/settings/SettingsItem';
import BackButton from '@/01-shared/components/BackButton';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';

import NotificationSettings from '../components/NotificationSettings';
import UpdateManager from '../components/UpdateManager';
import DebugSettings from '../components/DebugSettings';

function SettingsPage() {
  const { data: userProfile, isLoading } = useUserProfile();

  return (
    <MainLayout
      header={(
        <div className="flex items-center">
          <BackButton />
          <h1 className="text-2xl font-bold ml-4">Configurações</h1>
        </div>
      )}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-8">
          <SettingsGroup title="Geral">
            <SettingsItem
              label="Editar Perfil"
              path="/perfil"
            />
          </SettingsGroup>

          <SettingsGroup title="Notificações">
            <NotificationSettings />
          </SettingsGroup>

          <SettingsGroup title="Depuração">
            <DebugSettings />
          </SettingsGroup>

          {userProfile?.can_view_users && (
            <SettingsGroup title="Administração">
              <SettingsItem
                label="Gerenciar Usuários"
                path="/users-management"
              />
            </SettingsGroup>
          )}

          <UpdateManager />
        </div>
      )}
    </MainLayout>
  );
}

export default SettingsPage;
