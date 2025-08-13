// src/07-relatos/hooks/useRelatoManagement.js

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/01-shared/lib/supabase';
import { useOutletContext, useNavigate } from 'react-router-dom';

const useRelatoManagement = (relatoId) => {
  const { showToast } = useOutletContext();
  const navigate = useNavigate();
  const [relato, setRelato] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [currentResponsibles, setCurrentResponsibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReproving, setIsReproving] = useState(false);

  // Fetch Relato details
  const fetchRelato = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('relatos')
        .select(`
          *,
          responsibles:profiles(id, full_name),
          comments:relato_comentarios(*, author:profiles(id, full_name))
        `)
        .eq('id', relatoId)
        .single();

      if (error) throw error;
      setRelato(data);
      setCurrentResponsibles(data.responsibles.map(r => r.id));
    } catch (err) {
      setError(err);
      showToast(`Erro ao carregar relato: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [relatoId, showToast]);

  // Fetch all users for responsible assignment
  const fetchAllUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (error) throw error;
      setAllUsers(data);
    } catch (err) {
      showToast(`Erro ao carregar usuários: ${err.message}`, 'error');
    }
  }, [showToast]);

  // Handle updating relato
  const handleUpdateRelato = async (formData, canManageRelatos) => {
    setIsSaving(true);
    try {
      const { responsaveis: newResponsibleIds, ...newRelatoData } = formData;
      const newResponsibleIdsArray = newResponsibleIds || []; // Ensure it's an array

      // Convert empty string for hora_aproximada_ocorrencia to null
      if (newRelatoData.hora_aproximada_ocorrencia === '') {
        newRelatoData.hora_aproximada_ocorrencia = null;
      }

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
            relato_id: relatoId, // Use relatoId from hook
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
      // This part needs access to 'currentResponsibles' and 'allUsers' from the hook's state
      // and 'newResponsibleIdsArray' from formData
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
            relato_id: relatoId,
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
            relato_id: relatoId,
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

      // 1. Update relato data (excluding responsaveis)
      const { error: updateRelatoError } = await supabase
        .from('relatos')
        .update(newRelatoData) // Use newRelatoData without responsaveis
        .eq('id', relatoId);

      if (updateRelatoError) throw updateRelatoError;

      // 2. Synchronize responsibles (ONLY if user has permission)
      if (canManageRelatos) {
        // Delete existing responsibles
        const { error: deleteResponsiblesError } = await supabase
          .from('relato_responsaveis')
          .delete()
          .eq('relato_id', relatoId);

        if (deleteResponsiblesError) throw deleteResponsiblesError;

        // Insert new responsibles
        if (newResponsibleIdsArray.length > 0) {
          const responsiblesToInsert = newResponsibleIdsArray.map(userId => ({
            relato_id: relatoId,
            user_id: userId
          }));
          const { error: insertResponsiblesError } = await supabase
            .from('relato_responsaveis')
            .insert(responsiblesToInsert);

          if (insertResponsiblesError) throw insertResponsiblesError;
        }
      }

      showToast('Relato atualizado com sucesso!', 'success');
      fetchRelato(); // Re-fetch to get latest data
      return true; // Indicate success
    } catch (err) {
      showToast(`Erro ao atualizar relato: ${err.message}`, 'error');
      return false; // Indicate failure
    }
  };

  // Handle reproving relato
  const handleReproveRelato = async (reason) => {
    setIsReproving(true);
    try {
      const { error } = await supabase
        .from('relatos')
        .update({ status: 'REPROVADO' })
        .eq('id', relatoId);

      if (error) {
        console.error('handleReproveRelato: Supabase update error:', error);
        throw error;
      }

      // Log da ação de reprovação
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user ? user.id : null;
      const { error: logError } = await supabase.from('relato_logs').insert({
        relato_id: relatoId,
        user_id: currentUserId,
        action_type: 'STATUS_CHANGE',
        details: {
          old_status: relato.status, // Assuming 'relato' state is up-to-date
          new_status: 'REPROVADO',
          reproval_reason: reason // Include the reason in the log
        }
      });

      if (logError) {
        console.error('Erro ao registrar log de reprovação:', logError);
        // Do not throw fatal error here, as the report status was already updated
      }

      showToast('Relato reprovado com sucesso!', 'success');
      fetchRelato();
      return true; // Indicate success
    } catch (err) {
      console.error('handleReproveRelato: Error during reproval:', err);
      showToast(`Erro ao reprovar relato: ${err.message}`, 'error');
      return false; // Indicate failure
    } finally {
      setIsReproving(false);
    }
  };

  // Handle reapproving relato
  const handleReapproveRelato = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('relatos')
        .update({ status: 'APROVADO' })
        .eq('id', relatoId);

      if (error) throw error;
      showToast('Relato re-aprovado com sucesso!', 'success');
      fetchRelato();
    } catch (err) {
      showToast(`Erro ao re-aprovar relato: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle deleting relato
  const handleDeleteRelato = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('relatos')
        .delete()
        .eq('id', relatoId);

      if (error) throw error;
      showToast('Relato deletado com sucesso!', 'success');
      return true; // Indicate success
    } catch (err) {
      showToast(`Erro ao deletar relato: ${err.message}`, 'error');
      return false; // Indicate failure
    }
  finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (relatoId) {
      fetchRelato();
      fetchAllUsers();
    }
  }, [relatoId, fetchRelato, fetchAllUsers]);

  return {
    relato,
    allUsers,
    currentResponsibles,
    setCurrentResponsibles,
    loading,
    error,
    isSaving,
    isDeleting,
    isReproving,
    fetchRelato,
    handleUpdateRelato,
    handleReproveRelato,
    handleReapproveRelato,
    handleDeleteRelato,
  };
};

export default useRelatoManagement;