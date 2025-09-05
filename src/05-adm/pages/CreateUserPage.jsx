import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import MainLayout from '@/01-shared/components/MainLayout';
import BackButton from '@/01-shared/components/BackButton';
import CreateUserForm from '@/05-adm/components/CreateUserForm';

const CreateUserPage = () => {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();

  const handleUserCreated = () => {
    showToast('Usuário criado com sucesso!', 'success');
    navigate('/users-management');
  };

  return (
    <MainLayout
      header={(
        <>
          <BackButton />
          <h1 className="text-2xl font-bold ml-4">Criar Novo Usuário</h1>
        </>
      )}
    >
      <div className="p-4">
        <CreateUserForm onUserCreated={handleUserCreated} />
      </div>
    </MainLayout>
  );
};

export default CreateUserPage;
