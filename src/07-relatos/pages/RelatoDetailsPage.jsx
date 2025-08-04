import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/01-common/lib/supabase';
import { useToast } from '@/01-common/hooks/useToast';
import LoadingSpinner from '@/01-common/components/LoadingSpinner';
import { Button } from '@/core/components/ui/button';
import RelatoForm from '../components/RelatoForm'; // Importa o formulário
import RelatoDisplayDetails from '../components/RelatoDisplayDetails'; // Importa o componente de exibição de detalhes
import { useUserProfile } from '@/04-profile/hooks/useUserProfile'; // Para verificar permissão
import BackButton from '@/01-common/components/BackButton'; // Importa o BackButton

const RelatoDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [relato, setRelato] = useState(null);
  const [allUsers, setAllUsers] = useState([]); // Novo estado para todos os usuários
  const [currentResponsibles, setCurrentResponsibles] = useState([]); // Novo estado para responsáveis do relato
  const [displayResponsibles, setDisplayResponsibles] = useState([]); // Novo estado para responsáveis para exibição
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Novo estado para modo de edição
  const [isSaving, setIsSaving] = useState(false); // Estado para o salvamento
  const [isDeleting, setIsDeleting] = useState(false); // Novo estado para o carregamento da exclusão

  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();
  const canManageRelatos = userProfile?.can_manage_relatos;

  const fetchRelato = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('relatos_with_responsibles_view')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar detalhes do relato:', error);
      setError('Relato não encontrado ou erro ao carregar.');
      showToast('Erro ao carregar detalhes do relato.', 'error');
    } else if (!data) {
      setError('Relato não encontrado.');
    } else {
      setRelato(data);
      // Mapeia os responsáveis para um formato mais fácil de usar
      setCurrentResponsibles(data.responsibles_details ? data.responsibles_details.map(r => r.id) : []); // IDs para o formulário
      setDisplayResponsibles(data.responsibles_details || []); // Objetos de perfil para exibição
      console.log('Display Responsibles (from fetchRelato):', data.responsibles_details);
    }
    setLoading(false);
  }, [id, showToast]);

  const fetchAllUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('is_active', true);

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      showToast('Erro ao carregar lista de usuários.', 'error');
    } else {
      setAllUsers(data);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRelato();
    fetchAllUsers(); // Busca todos os usuários ao carregar a página
  }, [id, showToast, fetchRelato, fetchAllUsers]);

  const handleUpdateRelato = async (formData) => {
    setIsSaving(true);
    const { responsaveis: responsibleIds, ...relatoData } = formData; // Extrai os responsáveis

    try {
      // 1. Atualiza os dados do relato
      const { error: updateRelatoError } = await supabase
        .from('relatos')
        .update({
          local_ocorrencia: relatoData.local_ocorrencia,
          data_ocorrencia: relatoData.data_ocorrencia,
          hora_aproximada_ocorrencia: relatoData.hora_aproximada_ocorrencia || null,
          descricao: relatoData.descricao,
          riscos_identificados: relatoData.riscos_identificados,
          danos_ocorridos: relatoData.danos_ocorridos,
          planejamento_cronologia_solucao: relatoData.planejamento_cronologia_solucao,
          data_conclusao_solucao: relatoData.data_conclusao_solucao
        })
        .eq('id', id);

      if (updateRelatoError) throw updateRelatoError;

      // 2. Sincroniza os responsáveis
      // Deleta os responsáveis existentes
      const { error: deleteResponsiblesError } = await supabase
        .from('relato_responsaveis')
        .delete()
        .eq('relato_id', id);

      if (deleteResponsiblesError) throw deleteResponsiblesError;

      // Insere os novos responsáveis
      if (responsibleIds && responsibleIds.length > 0) {
        console.log('Responsible IDs to insert:', responsibleIds);
        const responsiblesToInsert = responsibleIds.map(userId => ({
          relato_id: id,
          user_id: userId
        }));
        console.log('Responsibles to insert (mapped):', responsiblesToInsert);
        const { error: insertResponsiblesError } = await supabase
          .from('relato_responsaveis')
          .insert(responsiblesToInsert);

        if (insertResponsiblesError) throw insertResponsiblesError;
      }

      showToast('Relato atualizado com sucesso!', 'success');
      setIsEditing(false); // Sai do modo de edição
      fetchRelato(); // Recarrega os dados atualizados
    } catch (error) {
      console.error('Erro ao atualizar relato:', error);
      showToast(`Erro ao atualizar o relato: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRelato = async () => {
    if (window.confirm('Tem certeza que deseja excluir este relato? Esta ação não pode ser desfeita.')) {
      setIsDeleting(true);
      try {
        const { error } = await supabase
          .from('relatos')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        showToast('Relato excluído com sucesso!', 'success');
        navigate('/relatos'); // Redireciona para a página de listagem
      } catch (error) {
        console.error('Erro ao excluir relato:', error);
        showToast(`Erro ao excluir o relato: ${error.message}`, 'error');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const isResponsibleForRelato = currentResponsibles.includes(userProfile?.id);

  if (loading || isLoadingProfile) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  if (!relato) {
    return <div className="container mx-auto p-4">Relato não encontrado.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <BackButton />
        <h1 className="text-2xl font-bold ml-4">Detalhes do Relato</h1>
      </div>

      {isEditing ? (
        <RelatoForm
          onSubmit={handleUpdateRelato}
          isLoading={isSaving}
          initialData={relato} // Passa os dados iniciais para o formulário
          submitButtonText="Salvar Alterações"
          canManageRelatos={canManageRelatos} // Passa a permissão para o formulário
          allUsers={allUsers} // Passa todos os usuários
          initialResponsibles={currentResponsibles} // Passa os responsáveis atuais
        />
      ) : (
        <RelatoDisplayDetails relato={relato} responsibles={displayResponsibles} />
      )}

      <div className="mt-6 flex space-x-2">
        {(canManageRelatos || isResponsibleForRelato) && !isEditing && (
          <Button onClick={() => setIsEditing(true)}>Editar</Button>
        )}
        {canManageRelatos && !isEditing && (
          <Button variant="destructive" onClick={handleDeleteRelato} disabled={isDeleting}>
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        )}
        {isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
};

export default RelatoDetailsPage;
