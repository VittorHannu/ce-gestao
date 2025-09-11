import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/01-shared/lib/supabase';

import { Input } from '@/01-shared/components/ui/input';
import { Label } from '@/01-shared/components/ui/label';
import MainLayout from '@/01-shared/components/MainLayout';
import PageHeader from '@/01-shared/components/PageHeader';
import FormActionButtons from '@/01-shared/components/FormActionButtons';

const UpdatePasswordProfilePage = () => {
  const { showToast } = useOutletContext();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeMessage, setPasswordChangeMessage] = useState('');

  const { mutate: changePassword, isLoading: isChangingPassword } = useMutation({
    mutationFn: async ({ password }) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    onSuccess: () => {
      showToast('Senha alterada com sucesso!', 'success');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordChangeMessage('');
      navigate(-1); // Volta para a página anterior
    },
    onError: (error) => {
      showToast(`Erro ao alterar senha: ${error.message}`, 'error');
    }
  });

  const handleChangePassword = () => {
    setPasswordChangeMessage('');
    if (!newPassword || !confirmNewPassword) {
      return setPasswordChangeMessage('Por favor, preencha ambos os campos de senha.');
    }
    if (newPassword !== confirmNewPassword) {
      return setPasswordChangeMessage('As novas senhas não coincidem.');
    }
    if (newPassword.length < 6) {
      return setPasswordChangeMessage('A senha deve ter pelo menos 6 caracteres.');
    }
    changePassword({ password: newPassword });
  };

  return (
    <MainLayout
      header={<PageHeader title="Alterar Senha" />}
    >
      <div>
        <div className="grid grid-cols-1 gap-4 pt-2">
          <div>
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="********"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
            <Input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="********"
              className="mt-1"
            />
          </div>
          {passwordChangeMessage && (
            <p className="text-sm text-red-500">{passwordChangeMessage}</p>
          )}
          <FormActionButtons
            onConfirm={handleChangePassword}
            isConfirming={isChangingPassword}
            confirmText="Alterar Senha"
            confirmingText="Alterando..."
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default UpdatePasswordProfilePage;