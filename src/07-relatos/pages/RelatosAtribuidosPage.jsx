import React, { useState, useEffect } from 'react';
import { supabase } from '@/01-common/lib/supabase';
import { useToast } from '@/01-common/hooks/useToast';
import LoadingSpinner from '@/01-common/components/LoadingSpinner';
import RelatoCard from '../components/RelatoCard';
import BackButton from '@/01-common/components/BackButton';

const RelatosAtribuidosPage = () => {
  const [relatos, setRelatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAssignedRelatos = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        showToast('Você precisa estar logado para ver os relatos atribuídos.', 'error');
        setLoading(false);
        return;
      }

      // Primeiro, busca os IDs dos relatos atribuídos a este usuário
      const { data: assignedRelatoIds, error: assignedIdsError } = await supabase
        .from('relato_responsaveis')
        .select('relato_id')
        .eq('user_id', user.id);

      if (assignedIdsError) {
        console.error('Erro ao buscar IDs de relatos atribuídos:', assignedIdsError);
        showToast('Erro ao carregar relatos atribuídos.', 'error');
        setLoading(false);
        return;
      }

      const relatoIds = assignedRelatoIds.map(item => item.relato_id);

      if (relatoIds.length === 0) {
        setRelatos([]);
        setLoading(false);
        return;
      }

      // Agora, busca os detalhes dos relatos usando os IDs obtidos
      const { data, error } = await supabase
        .from('relatos')
        .select('*, relato_code')
        .in('id', relatoIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar relatos atribuídos:', error);
        showToast('Erro ao carregar relatos atribuídos.', 'error');
      } else {
        setRelatos(data);
      }
      setLoading(false);
    };

    fetchAssignedRelatos();
  }, [showToast]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <BackButton />
        <h1 className="text-2xl font-bold ml-4">Relatos Atribuídos a Você</h1>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : relatos.length === 0 ? (
        <p>Nenhum relato atribuído a você.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatos.map((relato) => (
            <RelatoCard key={relato.id} relato={relato} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RelatosAtribuidosPage;
