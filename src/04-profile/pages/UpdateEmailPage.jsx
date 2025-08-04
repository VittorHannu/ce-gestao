import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/01-common/lib/supabase';

import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import MainLayout from '@/01-common/components/MainLayout';
import FormActionButtons from '@/01-common/components/FormActionButtons';

const UpdateEmailPage = () => {
  const { showToast } = useOutletContext();
  const navigate = useNavigate();

  const [newEmail, setNewEmail] = useState('');
  const [confirmNewEmail, setConfirmNewEmail] = useState('');
  const [emailChangeMessage, setEmailChangeMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { mutate: changeEmail, isLoading: isChangingEmail } = useMutation({
    mutationFn: async ({ email }) => {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
    },
    onSuccess: () => {
      setSuccessMessage('Um e-mail de confirmação foi enviado para o seu novo endereço. Por favor, verifique sua caixa de entrada e também a pasta de spam/lixo eletrônico para completar a alteração.');
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
        {successMessage ? (
          <div className="text-center py-8">
            <p className="text-lg text-green-600 mb-4">{successMessage}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Voltar
            </button>
          </div>
        ) : (
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
            <FormActionButtons
              onCancel={() => navigate(-1)}
              onConfirm={handleChangeEmail}
              isConfirming={isChangingEmail}
              confirmText="Alterar Email"
              confirmingText="Alterando..."
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UpdateEmailPage;
