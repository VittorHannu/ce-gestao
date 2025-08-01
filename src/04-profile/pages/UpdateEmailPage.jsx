import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/01-common/lib/supabase';

import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import MainLayout from '@/01-common/components/MainLayout';

const UpdateEmailPage = () => {
  const { showToast } = useOutletContext();

  const [newEmail, setNewEmail] = useState('');
  const [confirmNewEmail, setConfirmNewEmail] = useState('');
  const [emailChangeMessage, setEmailChangeMessage] = useState('');

  const { mutate: changeEmail, isLoading: isChangingEmail } = useMutation({
    mutationFn: async ({ email }) => {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
    },
    onSuccess: () => {
      showToast('Verifique seu novo e-mail para confirmar a alteração!', 'info');
      setNewEmail('');
      setConfirmNewEmail('');
      setEmailChangeMessage('');
    },
    onError: (error) => {
      showToast(`Erro ao alterar e-mail: ${error.message}`, 'error');
    }
  });

  const handleChangeEmail = () => {
    setEmailChangeMessage('');
    if (!newEmail || !confirmNewEmail) {
      return setEmailChangeMessage('Por favor, preencha ambos os campos de e-mail.');
    }
    if (newEmail !== confirmNewEmail) {
      return setEmailChangeMessage('Os novos e-mails não coincidem.');
    }
    changeEmail({ email: newEmail });
  };

  return (
    <MainLayout title="Alterar Email">
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4 pt-2">
          <div>
            <Label htmlFor="newEmail">Novo Email</Label>
            <Input
              type="email"
              id="newEmail"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="novo.email@exemplo.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="confirmNewEmail">Confirmar Novo Email</Label>
            <Input
              type="email"
              id="confirmNewEmail"
              value={confirmNewEmail}
              onChange={(e) => setConfirmNewEmail(e.target.value)}
              placeholder="novo.email@exemplo.com"
              className="mt-1"
            />
          </div>
          {emailChangeMessage && (
            <p className="text-sm text-red-500">{emailChangeMessage}</p>
          )}
          <div className="flex justify-end">
            <Button onClick={handleChangeEmail} disabled={isChangingEmail}>
              {isChangingEmail ? 'Alterando...' : 'Alterar Email'}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UpdateEmailPage;
