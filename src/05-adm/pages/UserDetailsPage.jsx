import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '@/01-common/lib/supabase';
import { Checkbox } from '@/core/components/ui/checkbox';
import { Button } from '@/core/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/core/components/ui/alert-dialog';
import MainLayout from '@/01-common/components/MainLayout';

const UserDetailsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editedPermissions, setEditedPermissions] = useState({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const _permissionKeys = [
    'can_view_users',
    'can_create_users',
    'can_delete_users',
    'can_manage_relatos',
    'can_view_feedbacks',
    'is_active'
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, is_active, needs_password_reset, can_manage_relatos, can_view_users, can_create_users, can_delete_users, can_view_feedbacks')
          .eq('id', userId)
          .single();

        if (error) throw error;
        setUser(data);
        setEditedPermissions({
          is_active: data.is_active,
          needs_password_reset: data.needs_password_reset,
          can_manage_relatos: data.can_manage_relatos,
          can_view_users: data.can_view_users,
          can_create_users: data.can_create_users,
          can_delete_users: data.can_delete_users,
          can_view_feedbacks: data.can_view_feedbacks
        });
      } catch (err) {
        setError(err);
        showToast(`Erro ao carregar usuário: ${err.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, showToast]);

  const handlePermissionChange = (key, value) => {
    setEditedPermissions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSavePermissions = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(editedPermissions)
        .eq('id', userId);

      if (error) throw error;

      showToast('Permissões atualizadas com sucesso!', 'success');
      navigate('/users-management');
    } catch (err) {
      console.error('Erro ao salvar permissões:', err);
      showToast(`Erro ao salvar permissões: ${err.message}`, 'error');
    }
  };

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId: userId }
      });

      if (error) throw error;

      showToast(`Usuário ${user.full_name} foi deletado (simulação).`, 'success');
      navigate('/users-management');
    } catch (err) {
      console.error('Erro ao deletar usuário:', err);
      showToast(`Erro ao deletar usuário: ${err.message}`, 'error');
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando usuário...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="text-center text-red-500">
          <p>Erro ao carregar usuário: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <div>
        <div className="text-center text-gray-500">
          <p>Usuário não encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow-sm border border-slate-400 p-4 flex flex-col">
        <div className="flex-grow">
          <h4 className="font-bold text-lg mb-2">{user.full_name || 'N/A'}</h4>
          <p className="text-sm text-gray-600 mb-4">{user.email}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Coluna de Permissões de Usuários */}
            <div>
              <h5 className="font-semibold mb-2">Permissões de Usuários</h5>
              {[ 
                'can_view_users',
                'can_create_users',
                'can_delete_users'
              ].map(key => (
                <div key={key} className="flex items-center mb-2">
                  <Checkbox
                    checked={editedPermissions[key]}
                    onCheckedChange={(checked) => handlePermissionChange(key, checked)}
                    id={`${user.id}-${key}`}
                  />
                  <label htmlFor={`${user.id}-${key}`} className="ml-2 capitalize">
                    {(() => {
                      const displayNames = {
                        can_view_users: 'Visualizar Usuários',
                        can_create_users: 'Criar Usuários',
                        can_delete_users: 'Deletar Usuários',
                        can_manage_relatos: 'Gerenciar Relatos',
                        is_active: 'Ativo',
                        needs_password_reset: 'Redefinir Senha no Próximo Login'
                      };
                      return displayNames[key] || key.replace('can_', '').replace('_', ' ');
                    })()}
                  </label>
                </div>
              ))}
            </div>

            {/* Coluna de Permissões de Relatos */}
            <div>
              <h5 className="font-semibold mb-2">Permissões de Relatos</h5>
              {[ 
                'can_manage_relatos',
                'can_view_feedbacks'
              ].map(key => (
                <div key={key} className="flex items-center mb-2">
                  <Checkbox
                    checked={editedPermissions[key]}
                    onCheckedChange={(checked) => handlePermissionChange(key, checked)}
                    id={`${user.id}-${key}`}
                  />
                  <label htmlFor={`${user.id}-${key}`} className="ml-2 capitalize">
                    {(() => {
                      const displayNames = {
                        can_view_users: 'Visualizar Usuários',
                        can_create_users: 'Criar Usuários',
                        can_delete_users: 'Deletar Usuários',
                        can_manage_relatos: 'Gerenciar Relatos',
                        can_view_feedbacks: 'Visualizar Feedbacks',
                        is_active: 'Ativo',
                        needs_password_reset: 'Redefinir Senha no Próximo Login'
                      };
                      return displayNames[key] || key.replace('can_', '').replace('_', ' ');
                    })()}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Nova Seção: Status da Conta */}
          <div className="mt-4">
            <h5 className="font-semibold mb-2">Status da Conta</h5>
            {[ 
              'is_active'
            ].map(key => (
              <div key={key} className="flex items-center mb-2">
                <Checkbox
                  checked={editedPermissions[key]}
                  onCheckedChange={(checked) => handlePermissionChange(key, checked)}
                  id={`${user.id}-${key}`}
                />
                <label htmlFor={`${user.id}-${key}`} className="ml-2 capitalize">
                  {key === 'is_active' ? 'Ativo' :
                    ''}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex gap-2 self-end">
          <Button size="sm" onClick={handleSavePermissions}>Salvar</Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/users-management')}>Cancelar</Button>
          <Button size="sm" variant="destructive" onClick={openDeleteDialog}>Deletar</Button>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente o usuário e remover seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default UserDetailsPage;