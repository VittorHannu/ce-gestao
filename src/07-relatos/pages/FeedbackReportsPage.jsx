import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/01-common/lib/supabase';
import MainLayout from '@/01-common/components/MainLayout';
import DataLoader from '@/01-common/components/data-loader/DataLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const FeedbackReportsPage = () => {
  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['feedbackReports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback_reports')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'PENDENTE': return 'default';
      case 'EM_ANALISE': return 'secondary';
      case 'RESOLVIDO': return 'success';
      case 'FECHADO': return 'outline';
      default: return 'default';
    }
  };

  const getReportTypeLabel = (type) => {
    switch (type) {
      case 'feedback': return 'Feedback Geral';
      case 'bug': return 'Bug / Erro';
      case 'suggestion': return 'Sugestão de Melhoria';
      default: return type;
    }
  };

  return (
    <MainLayout title="Relatórios de Feedback">
      <DataLoader loading={isLoading} error={error} loadingMessage="Carregando relatórios...">
        <div className="space-y-4 p-4">
          {reports && reports.length > 0 ? (
            reports.map((report) => (
              <Card key={report.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">
                    {getReportTypeLabel(report.report_type)}: {report.subject || 'Sem Assunto'}
                  </CardTitle>
                  <Badge variant={getBadgeVariant(report.status)}>{report.status}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                  <p className="text-xs text-gray-500">
                    Enviado por: {report.profiles?.full_name || report.profiles?.email || 'Usuário Desconhecido'} em {
                      format(new Date(report.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                    }
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500">Nenhum relatório de feedback encontrado.</p>
          )}
        </div>
      </DataLoader>
    </MainLayout>
  );
};

export default FeedbackReportsPage;
