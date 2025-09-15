import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/01-shared/lib/supabase';
import { useToast } from '@/01-shared/hooks/useToast';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';

const formatLogDetails = (log) => {
  switch (log.action_type) {
  case 'CREATE':
    return (
      <div className="ml-1 mt-2 p-2 bg-gray-100 rounded-md text-xs">
        <p className="font-semibold">Relato criado com os seguintes dados:</p>
        <ul className="list-disc list-inside ml-2">
          {Object.entries(log.details).map(([key, value]) => {
            if (['is_anonymous', 'data_conclusao_solucao', 'planejamento_cronologia_solucao', 'responsaveis'].includes(key)) return null;
            return (
              <li key={key}>
                <span className="font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span> {String(value)}
              </li>
            );
          })}
          {log.details.responsaveis && log.details.responsaveis.length > 0 && (
            <li>
              <span className="font-medium">Responsáveis:</span> {log.details.responsaveis.join(', ')}
            </li>
          )}
        </ul>
      </div>
    );
  case 'UPDATE':
    if (log.details?.field && log.details?.new_value !== undefined) {
      return (
        <span className="ml-1">
            alterou o campo &apos;<span className="font-mono text-blue-600">{log.details.field}</span>&apos; para 
            &apos;<span className="font-mono text-green-600">{String(log.details.new_value)}</span>&apos;.
        </span>
      );
    } else {
      return <span className="ml-1">atualizou o relato.</span>;
    }
  case 'STATUS_CHANGE':
    return (
      <span className="ml-1">
          alterou o status de 
          &apos;<span className="font-mono text-red-600">{log.details.old_status}</span>&apos; para 
          &apos;<span className="font-mono text-green-600">{log.details.new_status}</span>&apos;.
      </span>
    );
  case 'ADD_RESPONSIBLE':
    return (
      <span className="ml-1">
          adicionou &apos;<span className="font-medium">{log.details.responsible_name}</span>&apos; como responsável.
      </span>
    );
  case 'REMOVE_RESPONSIBLE':
    return (
      <span className="ml-1">
          removeu &apos;<span className="font-medium">{log.details.responsible_name}</span>&apos; como responsável.
      </span>
    );
  default:
    return <span className="ml-1">realizou uma ação desconhecida.</span>;
  }
};

const RelatoLogs = ({ relatoId }) => {
  const { toast } = useToast();
  const [relatoLogs, setRelatoLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRelatoLogs = useCallback(async () => {
    if (!relatoId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('relato_logs')
      .select('*, profiles(full_name, email)')
      .eq('relato_id', relatoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar logs do relato:', error);
      toast({ title: 'Erro ao carregar histórico do relato.', variant: 'destructive' });
    } else {
      setRelatoLogs(data);
    }
    setLoading(false);
  }, [relatoId, toast]);

  useEffect(() => {
    fetchRelatoLogs();
  }, [fetchRelatoLogs]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mt-4 p-4 border rounded-lg bg-white">
      {relatoLogs.length === 0 ? (
        <p className="text-gray-600">Nenhuma alteração registrada ainda.</p>
      ) : (
        <ul className="space-y-3">
          {relatoLogs.map((log) => (
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
  );
};

export default RelatoLogs;
