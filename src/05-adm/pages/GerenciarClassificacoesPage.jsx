import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../01-shared/components/ui/card';
import { ChevronRight } from 'lucide-react';
import PageHeader from '../../01-shared/components/PageHeader';
import MainLayout from '../../01-shared/components/MainLayout';

const classificationCategories = [
  { name: 'Agentes', table: 'classificacao_agentes' },
  { name: 'Tarefas', table: 'classificacao_tarefas' },
  { name: 'Equipamentos', table: 'classificacao_equipamentos' },
  { name: 'Causas', table: 'classificacao_causas' },
  { name: 'Danos', table: 'classificacao_danos' },
  { name: 'Ações Corretivas', table: 'classificacao_acoes_corretivas' },
  { name: 'Riscos', table: 'classificacao_riscos' },
];

const GerenciarClassificacoesPage = () => {
  return (
    <MainLayout header={<PageHeader title="Gerenciar Classificações" />}>
      <p className="mb-6 text-muted-foreground">
        Selecione uma categoria para visualizar, adicionar, editar ou remover itens. Essas opções serão usadas nos formulários de criação de relatos.
      </p>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {classificationCategories.map((category) => (
                <Link key={category.table} to={`/adm/classificacoes/${category.table}`} className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                  <span className="font-medium">{category.name}</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default GerenciarClassificacoesPage;