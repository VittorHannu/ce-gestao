import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/01-shared/hooks/useToast';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import { supabase } from '@/01-shared/lib/supabase';
import { handleServiceError } from '@/01-shared/lib/errorUtils';
import { getAllUsers } from '@/05-adm/services/userService';

export const useRelatoManagement = (relatoId) => {
  const { toast } = useToast();
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();

  const [relato, setRelato] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [currentResponsibles, setCurrentResponsibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  

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
      handleServiceError('fetchRelato', err, toast);
    } finally {
      setLoading(false);
    }
  }, [relatoId, toast]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const users = await getAllUsers();
      setAllUsers(users);
    } catch (err) {
      handleServiceError('fetchAllUsers', err, toast);
    }
  }, [toast]);

  const handleUpdateRelato = useCallback(async (formData, canManageRelatos) => {
    setIsSaving(true);
    console.log('handleUpdateRelato: Iniciando atualização do relato.');
    console.log('handleUpdateRelato: formData recebido:', formData);
    try {
      const { responsaveis, ...relatoData } = formData;

      // FIX: O banco de dados não aceita string vazia para campos de tempo, converte para null.
      if (relatoData.hora_aproximada_ocorrencia === '') {
        relatoData.hora_aproximada_ocorrencia = null;
      }

      // Clear reproval_reason if status is not REPROVADO
      if (relatoData.status && relatoData.status !== 'REPROVADO') {
        relatoData.reproval_reason = null;
      }

      // 1. Atualiza os campos de texto na tabela principal 'relatos'
      console.log('handleUpdateRelato: Atualizando tabela relatos com:', relatoData);
      const { error: updateError } = await supabase
        .from('relatos')
        .update(relatoData)
        .eq('id', relatoId);

      if (updateError) {
        console.error('handleUpdateRelato: Erro ao atualizar relatos:', updateError);
        throw updateError;
      }
      console.log('handleUpdateRelato: Tabela relatos atualizada com sucesso.');


      // 3. Se o usuário pode gerenciar e a lista de responsáveis existe, chama a função RPC
      if (canManageRelatos && responsaveis) {
        console.log('handleUpdateRelato: Chamando RPC update_relato_responsaveis com:', responsaveis);
        const { error: rpcError } = await supabase.rpc('update_relato_responsaveis', {
          p_relato_id: relatoId,
          p_user_ids: responsaveis
        });

        if (rpcError) {
          console.error('handleUpdateRelato: Erro ao chamar RPC update_relato_responsaveis:', rpcError);
          throw rpcError;
        }
        console.log('handleUpdateRelato: RPC update_relato_responsaveis executado com sucesso.');
      }

      toast({ title: 'Relato atualizado com sucesso!' });
      console.log('handleUpdateRelato: Chamando fetchRelato() para recarregar dados.');
      fetchRelato(); // Recarrega os dados para mostrar o estado atualizado
      console.log('handleUpdateRelato: Atualização do relato concluída com sucesso.');
      return true;
    } catch (err) {
      console.error('handleUpdateRelato: Erro geral na atualização do relato:', err);
      handleServiceError('handleUpdateRelato', err, toast);
      return false;
    } finally {
      setIsSaving(false);
      console.log('handleUpdateRelato: Finalizando processo de atualização.');
    }
  }, [relatoId, toast, fetchRelato]);

  

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

      

      // Finally, delete the relato
      const { error: deleteError } = await supabase
        .from('relatos')
        .delete()
        .eq('id', relatoId);

      if (deleteError) throw deleteError;

      toast({ title: 'Relato excluído com sucesso!' });
      return true;
    } catch (err) {
      handleServiceError('handleDeleteRelato', err, toast);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [relatoId, toast]);

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
    userProfile,
    isLoadingProfile,
    handleUpdateRelato,
    handleDeleteRelato,
    setRelato,
    setCurrentResponsibles,
    fetchRelato // Expose fetchRelato to allow re-fetching from component if needed
  };
};
