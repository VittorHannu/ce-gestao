import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../01-shared/components/ui/card';
import { ChevronRight, Loader2 } from 'lucide-react';
import PageHeader from '../../01-shared/components/PageHeader';
import MainLayout from '../../01-shared/components/MainLayout';
import { useClassificationCounts } from '../hooks/useClassificationCounts';
import { Badge } from '../../01-shared/components/ui/badge';

const classificationCategories = [
  { name: 'Agentes', table: 'classificacao_agentes' },
  { name: 'Tarefas', table: 'classificacao_tarefas' },
  { name: 'Equipamentos', table: 'classificacao_equipamentos' },
  { name: 'Causas', table: 'classificacao_causas' },
  { name: 'Danos', table: 'classificacao_danos' },
  { name: 'Ações Corretivas', table: 'classificacao_acoes_corretivas' },
  { name: 'Riscos', table: 'classificacao_riscos' }
];

const GerenciarClassificacoesPage = () => {
  const { data: counts, isLoading, isError } = useClassificationCounts();

  return (
    <MainLayout header={<PageHeader title="Gerenciar Classificações" />}>
      <p className="mb-6 text-muted-foreground">
        Selecione uma categoria para visualizar, adicionar, editar ou remover itens. Essas opções serão usadas nos formulários de criação de relatos.
      </p>
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {classificationCategories.map((category) => {
              const count = counts?.[category.table] ?? 0;
              return (
                <Link key={category.table} to={`/adm/classificacoes/${category.table}`} className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                  <span className="font-medium">{category.name}</span>
                  <div className="flex items-center gap-4">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Badge variant="secondary">{count}</Badge>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
      {isError && (
        <p className="mt-4 text-sm text-red-500">
          Não foi possível carregar a contagem de itens.
        </p>
      )}
    </MainLayout>
  );
};

export default GerenciarClassificacoesPage;