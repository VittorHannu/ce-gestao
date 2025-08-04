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
  const [relatoLogs, setRelatoLogs] = useState([]); // Novo estado para os logs do relato

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

  const fetchRelatoLogs = useCallback(async () => {
    const { data, error } = await supabase
      .from('relato_logs')
      .select('*, profiles(full_name, email)') // Seleciona os dados do log e do perfil do usuário
      .eq('relato_id', id)
      .order('created_at', { ascending: false }); // Ordena do mais recente para o mais antigo

    if (error) {
      console.error('Erro ao buscar logs do relato:', error);
      showToast('Erro ao carregar histórico do relato.', 'error');
    } else {
      setRelatoLogs(data);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchRelato();
    fetchAllUsers(); // Busca todos os usuários ao carregar a página
    fetchRelatoLogs(); // Busca os logs do relato
  }, [id, showToast, fetchRelato, fetchAllUsers, fetchRelatoLogs]);

  const handleUpdateRelato = async (formData) => {
    setIsSaving(true);
    const { responsaveis: newResponsibleIds, ...newRelatoData } = formData;
    const newResponsibleIdsArray = newResponsibleIds || []; // Ensure it's an array

    try {
      // Get current user for logging
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user ? user.id : null;

      const logsToInsert = [];

      // Helper to normalize values for comparison (empty string to null)
      const normalizeForComparison = (value) => {
        if (value === '') return null;
        if (value === undefined) return null; // Treat undefined as null for comparison
        return value;
      };

      // Compare fields and collect changes for logging
      const fieldsToCompare = [
        'local_ocorrencia',
        'descricao',
        'riscos_identificados',
        'planejamento_cronologia_solucao',
        'danos_ocorridos',
        'data_ocorrencia',
        'hora_aproximada_ocorrencia',
        'data_conclusao_solucao'
      ];

      for (const field of fieldsToCompare) {
        let oldValue = normalizeForComparison(relato[field]);
        let newValue = normalizeForComparison(newRelatoData[field]);

        // Special handling for date fields: ensure they are in 'YYYY-MM-DD' string format for comparison
        if (field === 'data_ocorrencia' || field === 'data_conclusao_solucao') {
          oldValue = oldValue ? new Date(oldValue).toISOString().split('T')[0] : null;
          newValue = newValue ? new Date(newValue).toISOString().split('T')[0] : null;
        }

        // Compare values. Use String() conversion for robust comparison of potentially mixed types.
        if (String(oldValue) !== String(newValue)) {
          logsToInsert.push({
            relato_id: id,
            user_id: currentUserId,
            action_type: 'UPDATE',
            details: {
              field: field,
              old_value: oldValue,
              new_value: newValue
            }
          });
        }
      }

      // Log responsible changes (only if canManageRelatos)
      if (canManageRelatos) {
        const oldResponsibleIds = currentResponsibles; // This is already an array of IDs
        const newResponsibleIdsArray = newResponsibleIds || []; // Ensure it's an array

        // Find added responsibles
        const addedResponsibles = newResponsibleIdsArray.filter(
          (newId) => !oldResponsibleIds.includes(newId)
        );
        for (const addedId of addedResponsibles) {
          const responsibleProfile = allUsers.find(u => u.id === addedId);
          logsToInsert.push({
            relato_id: id,
            user_id: currentUserId,
            action_type: 'ADD_RESPONSIBLE',
            details: {
              responsible_id: addedId,
              responsible_name: responsibleProfile?.full_name || responsibleProfile?.email || 'Usuário Desconhecido'
            }
          });
        }

        // Find removed responsibles
        const removedResponsibles = oldResponsibleIds.filter(
          (oldId) => !newResponsibleIdsArray.includes(oldId)
        );
        for (const removedId of removedResponsibles) {
          const responsibleProfile = allUsers.find(u => u.id === removedId);
          logsToInsert.push({
            relato_id: id,
            user_id: currentUserId,
            action_type: 'REMOVE_RESPONSIBLE',
            details: {
              responsible_id: removedId,
              responsible_name: responsibleProfile?.full_name || responsibleProfile?.email || 'Usuário Desconhecido'
            }
          });
        }
      }

      // Insert all collected logs before updating the relato itself
      if (logsToInsert.length > 0) {
        const { error: logsInsertError } = await supabase
          .from('relato_logs')
          .insert(logsToInsert);
        if (logsInsertError) {
          console.error('Erro ao inserir logs de atualização:', logsInsertError);
          // Não lançar erro fatal aqui, pois o relato ainda pode ser atualizado
        }
      }

      // 1. Atualiza os dados do relato
      const { error: updateRelatoError } = await supabase
        .from('relatos')
        .update({
          local_ocorrencia: newRelatoData.local_ocorrencia,
          data_ocorrencia: newRelatoData.data_ocorrencia,
          hora_aproximada_ocorrencia: newRelatoData.hora_aproximada_ocorrencia || null,
          descricao: newRelatoData.descricao,
          riscos_identificados: newRelatoData.riscos_identificados,
          danos_ocorridos: newRelatoData.danos_ocorridos,
          planejamento_cronologia_solucao: newRelatoData.planejamento_cronologia_solucao,
          data_conclusao_solucao: newRelatoData.data_conclusao_solucao,
          status: newRelatoData.status // Inclui o status na atualização
        })
        .eq('id', id);

      if (updateRelatoError) throw updateRelatoError;

      // 2. Sincroniza os responsáveis (APENAS se o usuário tiver permissão)
      if (canManageRelatos) {
        // Deleta os responsáveis existentes
        const { error: deleteResponsiblesError } = await supabase
          .from('relato_responsaveis')
          .delete()
          .eq('relato_id', id);

        if (deleteResponsiblesError) throw deleteResponsiblesError;

        // Insere os novos responsáveis
        if (newResponsibleIdsArray && newResponsibleIdsArray.length > 0) {
          const responsiblesToInsert = newResponsibleIdsArray.map(userId => ({
            relato_id: id,
            user_id: userId
          }));
          const { error: insertResponsiblesError } = await supabase
            .from('relato_responsaveis')
            .insert(responsiblesToInsert);

          if (insertResponsiblesError) throw insertResponsiblesError;
        }
      }

      showToast('Relato atualizado com sucesso!', 'success');
      setIsEditing(false); // Sai do modo de edição
      fetchRelato(); // Recarrega os dados atualizados
      fetchRelatoLogs(); // Recarrega os logs atualizados
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
  const canEditTratativa = canManageRelatos || isResponsibleForRelato;

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
          canManageRelatos={canManageRelatos} // Controla a edição de responsáveis
          canEditTratativa={canEditTratativa} // Controla a visibilidade da seção de tratativa
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

      {/* Seção de Histórico de Alterações */}
      <div className="mt-8 p-4 border rounded-lg bg-white">
        <h2 className="text-xl font-bold mb-4">Histórico de Alterações</h2>
        {relatoLogs.length === 0 ? (
          <p className="text-gray-600">Nenhuma alteração registrada ainda.</p>
        ) : (
          <ul className="space-y-3">
            {relatoLogs.map((log) => (
              <li key={log.id} className="p-3 bg-gray-50 rounded-md shadow-sm">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold">{new Date(log.created_at).toLocaleString()}</span> - 
                  <span className="font-medium">{log.profiles?.full_name || log.profiles?.email || 'Usuário Desconhecido'}</span>:
                  {formatLogDetails(log)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// Função auxiliar para formatar os detalhes do log
const formatLogDetails = (log) => {
  switch (log.action_type) {
  case 'CREATE':
    return (
      <span className="ml-1">criou o relato.</span>
    );
  case 'UPDATE':
    if (log.details?.field && log.details?.old_value !== undefined && log.details?.new_value !== undefined) {
      return (
        <span className="ml-1">
            alterou o campo &apos;<span className="font-mono text-blue-600">{log.details.field}</span>&apos; de 
            &apos;<span className="font-mono text-red-600">{String(log.details.old_value)}</span>&apos; para 
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

export default RelatoDetailsPage;
