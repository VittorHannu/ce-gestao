import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import { supabase } from '@/01-shared/lib/supabase';
import { handleServiceError } from '@/01-shared/lib/errorUtils';
import { getAllUsers } from '@/05-adm/services/userService';

export const useRelatoManagement = (relatoId) => {
  const { showToast } = useOutletContext();
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();

  const [relato, setRelato] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [currentResponsibles, setCurrentResponsibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReproving, setIsReproving] = useState(false);

  const fetchRelato = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: relatoData, error: relatoError } = await supabase
        .from('relatos')
        .select(`
          *,
          relato_responsaveis(user_id),
          relato_comentarios(*)
        `)
        .eq('id', relatoId)
        .single();

      if (relatoError) throw relatoError;

      setRelato(relatoData);
      setCurrentResponsibles(relatoData.relato_responsaveis.map(r => r.user_id));
    } catch (err) {
      setError(err);
      handleServiceError('fetchRelato', err, showToast);
    } finally {
      setLoading(false);
    }
  }, [relatoId, showToast]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const users = await getAllUsers();
      setAllUsers(users);
    } catch (err) {
      handleServiceError('fetchAllUsers', err, showToast);
    }
  }, [showToast]);

  const handleUpdateRelato = useCallback(async (formData, canManageRelatos) => {
    setIsSaving(true);
    try {
      const { responsaveis, ...relatoData } = formData;

      // FIX: O banco de dados não aceita string vazia para campos de tempo, converte para null.
      if (relatoData.hora_aproximada_ocorrencia === '') {
        relatoData.hora_aproximada_ocorrencia = null;
      }

      // 1. Atualiza os campos de texto na tabela principal 'relatos'
      const { error: updateError } = await supabase
        .from('relatos')
        .update(relatoData)
        .eq('id', relatoId);

      if (updateError) throw updateError;

      // 2. Se o usuário pode gerenciar e a lista de responsáveis existe, chama a função RPC
      if (canManageRelatos && responsaveis) {
        const { error: rpcError } = await supabase.rpc('update_relato_responsaveis', {
          p_relato_id: relatoId,
          p_user_ids: responsaveis
        });

        if (rpcError) throw rpcError;
      }

      showToast('Relato atualizado com sucesso!', 'success');
      fetchRelato(); // Recarrega os dados para mostrar o estado atualizado
      return true;
    } catch (err) {
      handleServiceError('handleUpdateRelato', err, showToast);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [relatoId, showToast, fetchRelato]);

  const handleReproveRelato = useCallback(async (reproveReason) => {
    setIsReproving(true);
    try {
      const { error: updateError } = await supabase
        .from('relatos')
        .update({ status: 'REPROVADO' })
        .eq('id', relatoId);

      if (updateError) throw updateError;

      // Log the action
      await supabase.from('relato_logs').insert({
        relato_id: relatoId,
        user_id: userProfile?.id,
        action_type: 'REPROVADO',
        details: { reason: reproveReason }
      });

      showToast('Relato reprovado com sucesso!', 'success');
      fetchRelato();
      return true;
    } catch (err) {
      handleServiceError('handleReproveRelato', err, showToast);
      return false;
    } finally {
      setIsReproving(false);
    }
  }, [relatoId, showToast, fetchRelato, userProfile]);

  const handleReapproveRelato = useCallback(async () => {
    setIsSaving(true); // Using isSaving for reapprove as well
    try {
      const { error: updateError } = await supabase
        .from('relatos')
        .update({ status: 'PENDENTE' }) // Or 'APROVADO' depending on desired flow
        .eq('id', relatoId);

      if (updateError) throw updateError;

      // Log the action
      await supabase.from('relato_logs').insert({
        relato_id: relatoId,
        user_id: userProfile?.id,
        action_type: 'REAPROVADO',
        details: {}
      });

      showToast('Relato reaprovado com sucesso!', 'success');
      fetchRelato();
      return true;
    } catch (err) {
      handleServiceError('handleReapproveRelato', err, showToast);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [relatoId, showToast, fetchRelato, userProfile]);

  const handleDeleteRelato = useCallback(async () => {
    setIsDeleting(true);
    try {
      // Delete comments first due to foreign key constraints
      const { error: commentsError } = await supabase
        .from('relato_comentarios')
        .delete()
        .eq('relato_id', relatoId);
      if (commentsError) throw commentsError;

      // Delete responsibles
      const { error: responsiblesError } = await supabase
        .from('relato_responsaveis')
        .delete()
        .eq('relato_id', relatoId);
      if (responsiblesError) throw responsiblesError;

      // Delete logs
      const { error: logsError } = await supabase
        .from('relato_logs')
        .delete()
        .eq('relato_id', relatoId);
      if (logsError) throw logsError;

      // Finally, delete the relato
      const { error: deleteError } = await supabase
        .from('relatos')
        .delete()
        .eq('id', relatoId);

      if (deleteError) throw deleteError;

      showToast('Relato excluído com sucesso!', 'success');
      return true;
    } catch (err) {
      handleServiceError('handleDeleteRelato', err, showToast);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [relatoId, showToast]);

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
    loading,
    error,
    isSaving,
    isDeleting,
    isReproving,
    userProfile,
    isLoadingProfile,
    handleUpdateRelato,
    handleReproveRelato,
    handleReapproveRelato,
    handleDeleteRelato,
    setRelato,
    setCurrentResponsibles,
    fetchRelato // Expose fetchRelato to allow re-fetching from component if needed
  };
};
