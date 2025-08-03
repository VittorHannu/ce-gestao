import React, { useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { User, Camera, Shield, LogOut, Mail, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/01-common/lib/supabase';

import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import DataLoader from '@/01-common/components/data-loader/DataLoader';
import { Button } from '@/core/components/ui/button';
import MainLayout from '@/01-common/components/MainLayout';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { onLogout, showToast } = useOutletContext();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  

  // Fetch user profile using React Query
  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useUserProfile();

  // Mutation for updating user avatar
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
      // Invalidate the user profile query to refetch the latest data
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

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('pt-BR') : 'Não informado';
  };

  const isLoading = isUploading;

  return (
    <MainLayout title="Perfil do Usuário">
      <DataLoader loading={isProfileLoading} error={profileError} loadingMessage="Carregando perfil...">
        {userProfile && (
          <>
            {/* Seção de Informações Básicas do Usuário */}
            <div className="flex flex-col items-center space-y-4 mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                  {userProfile.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-gray-500" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-opacity disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center">
                  {userProfile.full_name || 'Nome não informado'}
                  {userProfile.is_super_admin && <Shield className="w-5 h-5 text-blue-600 ml-2" />}
                </h2>
                <p className="text-gray-600">{userProfile.email}</p>
                <p className="text-gray-500 text-sm">Membro desde: {formatDate(userProfile.created_at)}</p>
              </div>
            </div>

            {/* Seção de Configurações da Conta */}
            <div className="p-4 border rounded-lg bg-white shadow-md mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações da Conta</h3>
              <div className="flex flex-col space-y-4">
                <Link to="/perfil/update-email" className="w-full">
                  <Button className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Alterar Email
                  </Button>
                </Link>
                <Link to="/perfil/update-password" className="w-full">
                  <Button className="w-full">
                    <Key className="w-4 h-4 mr-2" />
                    Alterar Senha
                  </Button>
                </Link>
              </div>
            </div>

            {/* Botão de Sair */}
            <div className="flex justify-center">
              <Button
                onClick={handleLogoutClick}
                variant="destructive"
                disabled={isLoading}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </>
        )}
      </DataLoader>
    </MainLayout>
  );
};

export default ProfilePage;
