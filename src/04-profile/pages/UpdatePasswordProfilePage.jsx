import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/01-common/lib/supabase';

import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import MainLayout from '@/01-common/components/MainLayout';

const UpdatePasswordProfilePage = () => {
  const { showToast } = useOutletContext();

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
    <MainLayout title="Alterar Senha">
      <div className="p-4">
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
          <div className="flex justify-end">
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UpdatePasswordProfilePage;