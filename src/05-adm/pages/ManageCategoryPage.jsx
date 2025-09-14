import React from 'react';
import { useParams } from 'react-router-dom';
import ClassificationTableManager from '../components/ClassificationTableManager';
import MainLayout from '../../01-shared/components/MainLayout';
import PageHeader from '../../01-shared/components/PageHeader';

const categoryMap = {
  classificacao_agentes: 'Agentes',
  classificacao_tarefas: 'Tarefas',
  classificacao_equipamentos: 'Equipamentos',
  classificacao_causas: 'Causas',
  classificacao_danos: 'Danos',
  classificacao_acoes_corretivas: 'Ações Corretivas',
  classificacao_riscos: 'Riscos'
};

const ManageCategoryPage = () => {
  const { tableName } = useParams();
  const title = categoryMap[tableName] || 'Gerenciar Categoria';

  return (
    <MainLayout header={<PageHeader title={title} backTo="/adm/classificacoes" />}>
      <ClassificationTableManager tableName={tableName} title={title} />
    </MainLayout>
  );
};

export default ManageCategoryPage;
