import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/01-shared/lib/supabase';
import { useToast } from '@/01-shared/hooks/useToast';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import PageHeader from '@/01-shared/components/PageHeader';
import MainLayout from '@/01-shared/components/MainLayout';

const RelatoLogsPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, profiles(full_name, email)')
      .eq('record_id', id)
      .eq('table_name', 'relatos')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
      toast({ title: 'Erro ao carregar histórico do relato.', variant: 'destructive' });
    } else {
      setAuditLogs(data);
    }
    setLoading(false);
  }, [id, toast]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <MainLayout
      header={<PageHeader title="Histórico de Alterações do Relato" />}
    >
      <div>
        <div className="mt-8 p-4 border rounded-lg bg-white">
          {auditLogs.length === 0 ? (
            <p className="text-gray-600">Nenhuma alteração registrada ainda.</p>
          ) : (
            <ul className="space-y-3">
              {auditLogs.map((log) => (
                <li key={log.id} className="p-3 bg-gray-50 rounded-md shadow-sm">
                  <div className="text-sm text-gray-800">
                    <span className="font-semibold">{new Date(log.created_at).toLocaleString()}</span> - 
                    <span className="font-medium">{log.profiles?.full_name || log.profiles?.email || 'Usuário Desconhecido'}</span>:
                    {formatLogDetails(log)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

// Função auxiliar para formatar os detalhes do log
const formatLogDetails = (log) => {
  const { action, old_record, new_record } = log;

  switch (action) {
  case 'INSERT':
    return <span className="ml-1">criou o relato.</span>;
  case 'DELETE':
    return <span className="ml-1">excluiu o relato.</span>;
  case 'UPDATE': {
    if (!old_record || !new_record) {
      return <span className="ml-1">atualizou o relato.</span>;
    }
    const changes = Object.keys(new_record).reduce((acc, key) => {
      if (old_record[key] !== new_record[key]) {
        acc.push(
          <li key={key}>
              O campo <span className="font-mono text-blue-600">{key}</span> foi alterado de{' '}
            <span className="font-mono text-red-600">{String(old_record[key])}</span> para{' '}
            <span className="font-mono text-green-600">{String(new_record[key])}</span>.
          </li>
        );
      }
      return acc;
    }, []);

    if (changes.length === 0) {
      return <span className="ml-1">atualizou o relato sem alterações visíveis.</span>;
    }

    return (
      <div className="ml-1 mt-2 p-2 bg-gray-100 rounded-md text-xs">
        <p className="font-semibold">Alterações:</p>
        <ul className="list-disc list-inside ml-2">{changes}</ul>
      </div>
    );
  }
  default:
    return <span className="ml-1">realizou uma ação desconhecida.</span>;
  }
};

export default RelatoLogsPage;
