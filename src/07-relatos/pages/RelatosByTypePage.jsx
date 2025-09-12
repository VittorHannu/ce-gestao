import React from 'react';
import PageHeader from '@/01-shared/components/PageHeader';
import DateFilterCard from '../components/DateFilterCard';
import MainLayout from '@/01-shared/components/MainLayout';

const RelatosByTypePage = () => {
  return (
    <MainLayout
      header={<PageHeader title="Relatos por Tipo" />}
    >
      <div>
        <div className="mb-4">
          <DateFilterCard />
        </div>

        <div className="p-6 border rounded-lg bg-white shadow-md">
          <p className="text-center text-gray-500">Esta funcionalidade foi integrada à página inicial.</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default RelatosByTypePage;
