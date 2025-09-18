
import React from 'react';
import { useAuth } from '@/03-auth/hooks/useAuth';
import MainLayout from '@/01-shared/components/MainLayout';
import PageHeader from '@/01-shared/components/PageHeader';
import RelatoForm from '../components/RelatoForm'; // This will be the new form

const CreateRelatoPage = () => {
  const { user } = useAuth();

  return (
    <MainLayout
      header={(
        <PageHeader
          title="Criar Novo Relato"
          subtitle="Sua contribuição é fundamental para a segurança de todos."
        />
      )}
    >
      <RelatoForm user={user} key={user ? user.id : 'anonymous'} />
    </MainLayout>
  );
};

export default CreateRelatoPage;
