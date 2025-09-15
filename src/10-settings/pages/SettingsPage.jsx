import React, { useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { User, Camera, LogOut, Mail, Key, MessageSquare, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/01-shared/lib/supabase';

import MainLayout from '@/01-shared/components/MainLayout';
import SettingsGroup from '@/01-shared/components/settings/SettingsGroup';
import SettingsItem from '@/01-shared/components/settings/SettingsItem';
import PageHeader from '@/01-shared/components/PageHeader';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import { Button } from '@/01-shared/components/ui/button';
import FeedbackForm from '@/01-shared/components/FeedbackForm';
import PwaUpdateSettings from '../components/PwaUpdateSettings';
import DebugSettings from '../components/DebugSettings';

function SettingsPage() {
  const navigate = useNavigate();
  const { onLogout, showToast } = useOutletContext();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);

  const { data: userProfile, isLoading: isProfileLoading, refetch } = useUserProfile();

  const { mutate: updateAvatar, isLoading: isUploading } = useMutation({
    mutationFn: async (file) => {
      if (!file || !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
        throw new Error('Por favor, selecione um arquivo de imagem com menos de 5MB.');
      }
      if (!userProfile?.id) throw new Error('ID do usuário não encontrado.');

      const fileExt = file.name.split('.').pop();
      const fileName = `${userProfile.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userProfile.id);

      if (updateError) throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
      
      return publicUrl;
    },
    onSuccess: () => {
      showToast('Avatar atualizado com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error) => {
      showToast(error.message, 'error');
    }
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateAvatar(file);
    }
  };

  const handleLogoutClick = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      await onLogout();
      navigate('/');
    }
  };

  const isLoading = isProfileLoading || isUploading;

  return (
    <MainLayout
      header={<PageHeader title="Configurações" />}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-8">
          {userProfile && (
            <div className="flex flex-col items-center space-y-4 mb-6 py-6 border rounded-lg bg-white shadow-sm">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                  {userProfile.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-opacity disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-800">
                  {userProfile.full_name || 'Nome não informado'}
                </h2>
                <p className="text-gray-500">{userProfile.email}</p>
                <div className="flex space-x-2 mt-4">
                  <Link to="/settings/update-email">
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Alterar Email
                    </Button>
                  </Link>
                  <Link to="/settings/update-password">
                    <Button variant="outline" size="sm">
                      <Key className="w-4 h-4 mr-2" />
                      Alterar Senha
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {(userProfile?.can_view_users || userProfile?.can_view_audit_logs) && (
            <SettingsGroup title="Administração">
              {userProfile?.can_view_users && (
                <SettingsItem
                  label="Gerenciar Usuários"
                  path="/users-management"
                />
              )}
              {userProfile?.can_view_audit_logs && (
                <SettingsItem
                  label="Logs de Auditoria"
                  path="/audit-logs"
                />
              )}
            </SettingsGroup>
          )}

          <SettingsGroup title="Aplicativo">
            <SettingsItem
              label="Enviar Feedback / Relatar Erro"
              onClick={() => setIsFeedbackFormOpen(true)}
            />
            {userProfile?.can_view_feedbacks && (
              <SettingsItem
                label="Ver Relatórios de Feedback"
                path="/feedback-reports"
              />
            )}
          </SettingsGroup>

          {import.meta.env.DEV && (
            <SettingsGroup title="Depuração">
              <DebugSettings />
            </SettingsGroup>
          )}

          <SettingsGroup title="Sobre">
            <PwaUpdateSettings />
            <SettingsItem
              label={'Versão do App'}
              value={`${import.meta.env.VITE_APP_VERSION}`}
              path="/version-history"
            />
            <SettingsItem
              label={'Data da Compilação'}
              value={import.meta.env.VITE_APP_BUILD_DATE}
            />
          </SettingsGroup>

          <div className="pt-4">
            <Button onClick={handleLogoutClick} variant="destructive" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>

          <FeedbackForm
            isOpen={isFeedbackFormOpen}
            onClose={() => setIsFeedbackFormOpen(false)}
          />
        </div>
      )}
    </MainLayout>
  );
}

export default SettingsPage;
