import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import MainLayout from '@/01-shared/components/MainLayout';
import PageHeader from '@/01-shared/components/PageHeader';
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
      header={<PageHeader title="Criar Novo Usuário" />}
    >
      <div>
        <CreateUserForm onUserCreated={handleUserCreated} />
      </div>
    </MainLayout>
  );
};

export default CreateUserPage;
