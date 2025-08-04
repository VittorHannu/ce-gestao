import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/01-common/lib/supabase';
import MainLayout from '@/01-common/components/MainLayout';
import DataLoader from '@/01-common/components/data-loader/DataLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Badge } from '@/core/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useOutletContext } from 'react-router-dom';
import BackButton from '@/01-common/components/BackButton';

const FeedbackReportsPage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useOutletContext();
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['feedbackReports', filterType, filterStatus],
    queryFn: async () => {
      let query = supabase.from('feedback_reports').select('*, profiles(full_name, email)');

      if (filterType !== 'all') {
        query = query.eq('report_type', filterType);
      }
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { mutate: updateReportStatus, isLoading: isUpdatingStatus } = useMutation({
    mutationFn: async ({ id, status }) => {
      const { error } = await supabase
        .from('feedback_reports')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['feedbackReports']);
      showToast('Status do relatório atualizado com sucesso!', 'success');
    },
    onError: (error) => {
      showToast(`Erro ao atualizar status: ${error.message}`, 'error');
    }
  });

  const handleStatusChange = (id, newStatus) => {
    updateReportStatus({ id, status: newStatus });
  };

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
      <div className="flex items-center gap-4 mb-4">
        <BackButton />
        <h1 className="text-2xl font-bold">Relatórios de Feedback</h1>
      </div>

      <div className="flex flex-wrap space-x-4 mb-4">
        <Select onValueChange={setFilterType} value={filterType}>
          <SelectTrigger className="w-[180px] bg-gray-700 text-white">
            <SelectValue placeholder="Filtrar por Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="feedback">Feedback</SelectItem>
            <SelectItem value="bug">Bug / Erro</SelectItem>
            <SelectItem value="suggestion">Sugestão</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setFilterStatus} value={filterStatus}>
          <SelectTrigger className="w-[180px] bg-gray-700 text-white">
            <SelectValue placeholder="Filtrar por Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="PENDENTE">PENDENTE</SelectItem>
            <SelectItem value="EM_ANALISE">EM ANÁLISE</SelectItem>
            <SelectItem value="RESOLVIDO">RESOLVIDO</SelectItem>
            <SelectItem value="FECHADO">FECHADO</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataLoader loading={isLoading} error={error} loadingMessage="Carregando relatórios...">
        <div className="space-y-4 p-4">
          {reports && reports.length > 0 ? (
            reports.map((report) => (
              <Card key={report.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium mb-1">
                    {getReportTypeLabel(report.report_type)}
                  </CardTitle>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Assunto: {report.subject || 'Sem Assunto'}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                  <p className="text-xs text-gray-500 mb-4">
                    Enviado por: {report.profiles?.full_name || report.profiles?.email || 'Usuário Desconhecido'} em {
                      format(new Date(report.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                    }
                  </p>
                  <div className="flex items-center space-x-2">
                    <Select onValueChange={(newStatus) => handleStatusChange(report.id, newStatus)} value={report.status} disabled={isUpdatingStatus}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder={report.status} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDENTE">PENDENTE</SelectItem>
                        <SelectItem value="EM_ANALISE">EM ANÁLISE</SelectItem>
                        <SelectItem value="RESOLVIDO">RESOLVIDO</SelectItem>
                        <SelectItem value="FECHADO">FECHADO</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant={getBadgeVariant(report.status)}>{report.status}</Badge>
                  </div>
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