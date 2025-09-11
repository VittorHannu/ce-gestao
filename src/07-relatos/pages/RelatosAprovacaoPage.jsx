import React, { useState, useEffect } from 'react';


import { Button } from '@/01-shared/components/ui/button';

import RelatoDisplayDetails from '../components/RelatoDisplayDetails'; // Importa o componente de exibição de detalhes
import { supabase } from '@/01-shared/lib/supabase';
import { useToast } from '@/01-shared/hooks/useToast';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import BackButton from '@/01-shared/components/BackButton'; // Importa o BackButton
import { Link } from 'react-router-dom';
import MainLayout from '@/01-shared/components/MainLayout';

const RelatosAprovacaoPage = () => {
  const [relatos, setRelatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPendentes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('relatos')
        .select('*')
        .eq('status', 'PENDENTE')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar relatos pendentes:', error);
        toast({ title: 'Erro ao buscar relatos para aprovação.', variant: 'destructive' });
      } else {
        setRelatos(data);
      }
      setLoading(false);
    };

    fetchPendentes();
  }, [toast]);

  const handleUpdateStatus = async (id, newStatus) => {
    const relatoToUpdate = relatos.find(r => r.id === id);
    if (!relatoToUpdate) {
      toast({ title: 'Relato não encontrado na lista.', variant: 'destructive' });
      return;
    }

    const oldStatus = relatoToUpdate.status;

    const { error } = await supabase
      .from('relatos')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro ao atualizar o status', description: error.message, variant: 'destructive' });
    } else {
      // Log da ação de mudança de status
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user ? user.id : null;

      const { error: logError } = await supabase.from('relato_logs').insert({
        relato_id: id,
        user_id: currentUserId,
        action_type: 'STATUS_CHANGE',
        details: {
          old_status: oldStatus,
          new_status: newStatus
        }
      });

      if (logError) {
        console.error('Erro ao registrar log de status:', logError);
        // Não impede a operação principal, mas registra o erro
      }

      toast({ title: `Relato ${newStatus.toLowerCase()} com sucesso!` });
      // Remove o relato da lista na UI para não precisar recarregar a página
      setRelatos(relatos.filter((r) => r.id !== id));
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <MainLayout
      header={(
        <>
          <BackButton />
          <h1 className="text-2xl font-bold ml-4">Aprovação de Relatos</h1>
          <Link to="/relatos/reprovados" className="ml-auto">
            <Button variant="outline" size="sm">
              Ver Reprovados
            </Button>
          </Link>
        </>
      )}
    >
      <div className="p-4">
        {relatos.length === 0 ? (
          <p>Não há relatos pendentes de aprovação no momento.</p>
        ) : (
          <div className="space-y-4">
            {relatos.map((relato) => (
              <div key={relato.id} className="border p-4 rounded-lg shadow-sm bg-white">
                <RelatoDisplayDetails relato={relato} /> {/* Usa o componente de detalhes */}
                <div className="mt-4 flex space-x-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(relato.id, 'REPROVADO')}>
                    Reprovar
                  </Button>
                  <Button size="sm" onClick={() => handleUpdateStatus(relato.id, 'APROVADO')}>
                    Aprovar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RelatosAprovacaoPage;
