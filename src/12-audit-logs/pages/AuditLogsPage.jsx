import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '../services/auditLogService';
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
} from "@/01-shared/components/ui/dialog";

const AuditLogItem = ({ log }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const getActionColor = (action) => {
    switch (action) {
      case 'INSERT': return 'text-green-500';
      case 'UPDATE': return 'text-yellow-500';
      case 'DELETE': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="p-4 mb-2 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-bold">
            {log.author?.full_name || 'Sistema'}
            <span className={`ml-2 font-semibold ${getActionColor(log.action)}`}>{log.action}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tabela: <span className="font-mono">{log.table_name}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {new Date(log.created_at).toLocaleString()}
          </p>
        </div>
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">Ver Detalhes</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Log</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Registro Antigo (Old)</h3>
                <pre className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md overflow-auto max-h-96">
                  {JSON.stringify(log.old_record, null, 2) || 'N/A'}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Registro Novo (New)</h3>
                <pre className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md overflow-auto max-h-96">
                  {JSON.stringify(log.new_record, null, 2) || 'N/A'}
                </pre>
              </div>
            </div>
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
    <MainLayout>
      <PageHeader title="Logs de Auditoria" />
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
              <Button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
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
