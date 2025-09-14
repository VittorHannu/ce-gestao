import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs, fetchAuditLogDiff } from '../services/auditLogService';
import MainLayout from '@/01-shared/components/MainLayout';
import PageHeader from '@/01-shared/components/PageHeader';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import { Button } from '@/01-shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/01-shared/components/ui/dialog";
import { useToast } from '@/01-shared/hooks/useToast';

// Helper function to generate human-readable log messages
const generateLogMessage = (log) => {
  const author = log.author?.full_name || 'Sistema';
  const target = `${log.table_name} ${log.record_id ? `(${log.record_id.substring(0, 8)})` : ''}`;

  switch (log.action) {
    case 'INSERT':
      return `${author} criou um novo registro em ${log.table_name}.`;
    case 'DELETE':
      return `${author} excluiu um registro de ${log.table_name}.`;
    case 'UPDATE': {
      if (!log.old_record || !log.new_record) {
        return `${author} atualizou ${target}`;
      }
      const oldKeys = Object.keys(log.old_record);
      const newKeys = Object.keys(log.new_record);
      const allKeys = new Set([...oldKeys, ...newKeys]);
      const changedFields = [];
      for (const key of allKeys) {
        if (JSON.stringify(log.old_record[key]) !== JSON.stringify(log.new_record[key])) {
          changedFields.push(key);
        }
      }

      if (changedFields.length === 0) {
        return `${author} atualizou ${target} (sem alterações visíveis).`;
      }
      if (changedFields.length === 1) {
        const field = changedFields[0];
        // Rule 1: Simple, short value changes
        if (['status', 'tipo_relato'].includes(field) && String(log.new_record[field]).length < 25) {
          return `${author} alterou ${field} de "${log.old_record[field]}" para "${log.new_record[field]}" em ${target}`;
        }
        // Rule 2: Long text changes
        return `${author} atualizou o campo ${field} em ${target}`;
      }
      // Rule 3: Multiple changes
      return `${author} atualizou ${changedFields.length} campos em ${target} (incluindo ${changedFields.join(', ')}).`;
    }
    default:
      return `Ação desconhecida: ${log.action}`;
  }
};

const DiffViewer = ({ diffData, showFullJson, oldRecord, newRecord }) => {
  if (!diffData || diffData.length === 0) {
    return <p className="text-center text-gray-500 py-4">Nenhuma alteração de dados para exibir.</p>;
  }

  return (
    <div className="mt-2">
      {/* Diff items */}
      <div className="space-y-4">
        {/* Header for the diff view, hidden on mobile */}
        <div className="hidden md:grid md:grid-cols-12 gap-x-4 text-xs font-bold uppercase text-gray-500 mb-2 px-1">
          <div className="md:col-span-3">Campo</div>
          <div className="md:col-span-4">Valor Antigo</div>
          <div className="md:col-span-5">Valor Novo</div>
        </div>

        {diffData.map(({ field, old: oldVal, new: newVal }) => (
          <div key={field} className="grid md:grid-cols-12 gap-x-4 border-t pt-4">
            {/* Field Name */}
            <div className="font-semibold md:col-span-3 break-words">
              <span className="text-xs font-bold uppercase text-gray-500 md:hidden">CAMPO: </span>
              {field}
            </div>

            {/* Old Value */}
            <div className="md:col-span-4 bg-red-50 dark:bg-red-900/20 p-2 rounded mt-2 md:mt-0">
              <span className="text-xs font-bold text-red-700 dark:text-red-300 md:hidden">DE: </span>
              <pre className="whitespace-pre-wrap break-all font-mono text-sm">{JSON.stringify(oldVal, null, 2) ?? 'null'}</pre>
            </div>

            {/* New Value */}
            <div className="md:col-span-5 bg-green-50 dark:bg-green-900/20 p-2 rounded mt-2 md:mt-0">
              <span className="text-xs font-bold text-green-700 dark:text-green-300 md:hidden">PARA: </span>
              <pre className="whitespace-pre-wrap break-all font-mono text-sm">{JSON.stringify(newVal, null, 2) ?? 'null'}</pre>
            </div>
          </div>
        ))}
      </div>

      {showFullJson && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-4 border-t">
          <div>
            <h3 className="font-semibold mb-2">Registro Antigo (Old)</h3>
            <pre className="p-2 bg-gray-100 dark:bg-gray-900 rounded-md overflow-auto max-h-96">{JSON.stringify(oldRecord, null, 2) || 'N/A'}</pre>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Registro Novo (New)</h3>
            <pre className="p-2 bg-gray-100 dark:bg-gray-900 rounded-md overflow-auto max-h-96">{JSON.stringify(newRecord, null, 2) || 'N/A'}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

const AuditLogItem = ({ log }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [diffData, setDiffData] = useState(null);
  const [isDiffLoading, setIsDiffLoading] = useState(false);
  const [showFullJson, setShowFullJson] = useState(false);
  const { toast } = useToast();

  const message = useMemo(() => generateLogMessage(log), [log]);

  const handleOpenDetails = async () => {
    if (diffData) return;

    if (log.action !== 'UPDATE') {
      const record = log.new_record || log.old_record;
      const pseudoDiff = record ? Object.keys(record).map(key => ({
        field: key,
        old: log.old_record ? record[key] : null,
        new: log.new_record ? record[key] : null,
      })) : [];
      setDiffData(pseudoDiff);
      return;
    }

    setIsDiffLoading(true);
    try {
      const diff = await fetchAuditLogDiff({ oldRecord: log.old_record, newRecord: log.new_record });
      setDiffData(diff);
    } catch (error) {
      toast({ title: 'Erro ao buscar detalhes da alteração', description: error.message, variant: 'destructive' });
    } finally {
      setIsDiffLoading(false);
    }
  };

  return (
    <div className="p-4 mb-2 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center">
        <div className="flex-grow">
          <p className="text-sm">{message}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(log.created_at).toLocaleString('pt-BR')}
          </p>
        </div>
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={handleOpenDetails}>Ver Detalhes</Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
            <DialogHeader className="p-6 border-b">
              <DialogTitle>Detalhes da Alteração</DialogTitle>
            </DialogHeader>
            <div className="flex-grow overflow-auto p-6">
              {isDiffLoading ? <LoadingSpinner /> : <DiffViewer diffData={diffData} oldRecord={log.old_record} newRecord={log.new_record} showFullJson={showFullJson} />}
            </div>
            <DialogFooter className="p-4 border-t bg-background">
              <Button variant="secondary" onClick={() => setShowFullJson(!showFullJson)}>
                {showFullJson ? 'Ocultar Dados Completos' : 'Ver Dados Completos'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

const AuditLogsPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['auditLogs', page],
    queryFn: () => fetchAuditLogs({ page }),
    keepPreviousData: true,
  });

  const totalPages = data ? Math.ceil(data.count / 20) : 0;

  return (
    <MainLayout header={<PageHeader title="Logs de Auditoria" />}>
      <div className="p-4">
        {isLoading && <LoadingSpinner />}
        {isError && <p className="text-red-500">Erro ao carregar logs: {error.message}</p>}
        {data && (
          <>
            <div>
              {data.data.map(log => <AuditLogItem key={log.id} log={log} />)}
            </div>
            <div className="flex justify-between items-center mt-4">
              <Button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
                Anterior
              </Button>
              <span>Página {page} de {totalPages}</span>
              <Button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages || totalPages === 0}>
                Próxima
              </Button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default AuditLogsPage;
