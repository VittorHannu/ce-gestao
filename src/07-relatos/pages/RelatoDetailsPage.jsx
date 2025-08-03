import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Novo estado para modo de edição
  const [isSaving, setIsSaving] = useState(false); // Estado para o salvamento
  const [isDeleting, setIsDeleting] = useState(false); // Novo estado para o carregamento da exclusão

  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();
  const canManageRelatos = userProfile?.can_manage_relatos;

  const fetchRelato = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('relatos')
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
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRelato();
  }, [id, showToast]);

  const handleUpdateRelato = async (formData) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('relatos')
        .update({
          local_ocorrencia: formData.local_ocorrencia,
          data_ocorrencia: formData.data_ocorrencia,
          hora_aproximada_ocorrencia: formData.hora_aproximada_ocorrencia || null,
          descricao: formData.descricao,
          riscos_identificados: formData.riscos_identificados,
          danos_ocorridos: formData.danos_ocorridos || null,
          planejamento_cronologia_solucao: formData.planejamento_cronologia_solucao || null,
          data_conclusao_solucao: formData.data_conclusao_solucao || null,
        })
        .eq('id', id);

      if (error) {
        throw error;
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
        />
      ) : (
        <RelatoDisplayDetails relato={relato} />
      )}

      <div className="mt-6 flex space-x-2">
        {canManageRelatos && !isEditing && (
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
