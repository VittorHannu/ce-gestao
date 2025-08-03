import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import MainLayout from '@/01-common/components/MainLayout';
import CreateUserForm from '@/05-adm/components/CreateUserForm';

const CreateUserPage = () => {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();

  const handleUserCreated = () => {
    showToast('Usuário criado com sucesso!', 'success');
    navigate('/users-management');
  };

  const handleCancel = () => {
    navigate('/users-management');
  };

  return (
    <MainLayout title="Criar Novo Usuário">
      <div className="p-4">
        <CreateUserForm onUserCreated={handleUserCreated} onCancel={handleCancel} />
      </div>
    </MainLayout>
  );
};

export default CreateUserPage;
