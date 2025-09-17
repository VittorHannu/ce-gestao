import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/01-shared/hooks/useToast';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import { supabase } from '@/01-shared/lib/supabase';
import { handleServiceError } from '@/01-shared/lib/errorUtils';
import { getAllUsers } from '@/05-adm/services/userService';

export const useRelatoManagement = (relatoId) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();

  const [allUsers, setAllUsers] = useState([]);
  const [currentResponsibles, setCurrentResponsibles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRelato = async () => {
    const { data, error } = await supabase
      .from('relatos')
      .select(`
        *,
        relato_responsaveis(user_id),
        relato_comentarios(*),
        relato_images(id, image_url, order_index)
      `)
      .eq('id', relatoId)
      .single();

    if (error) throw error;
    return data;
  };

  const { data: relato, error, isLoading: loading } = useQuery({
    queryKey: ['relato', relatoId],
    queryFn: fetchRelato,
    enabled: !!relatoId,
    onSuccess: (data) => {
      setCurrentResponsibles(data.relato_responsaveis.map(r => r.user_id));
    },
    onError: (err) => {
      handleServiceError('fetchRelato', err, toast);
    }
  });

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
    try {
      const { responsaveis, ...relatoData } = formData;

      if (relatoData.hora_aproximada_ocorrencia === '') {
        relatoData.hora_aproximada_ocorrencia = null;
      }

      if (relatoData.status && relatoData.status !== 'REPROVADO') {
        relatoData.reproval_reason = null;
      }

      const { error: updateError } = await supabase
        .from('relatos')
        .update(relatoData)
        .eq('id', relatoId);

      if (updateError) throw updateError;

      if (canManageRelatos && responsaveis) {
        const { error: rpcError } = await supabase.rpc('update_relato_responsaveis', {
          p_relato_id: relatoId,
          p_user_ids: responsaveis
        });

        if (rpcError) throw rpcError;
      }

      toast({ title: 'Relato atualizado com sucesso!' });
      queryClient.invalidateQueries(['relato', relatoId]);
      return true;
    } catch (err) {
      handleServiceError('handleUpdateRelato', err, toast);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [relatoId, toast, queryClient]);

  const handleDeleteRelato = useCallback(async () => {
    setIsDeleting(true);
    try {
      const { error: commentsError } = await supabase
        .from('relato_comentarios')
        .delete()
        .eq('relato_id', relatoId);
      if (commentsError) throw commentsError;

      const { error: responsiblesError } = await supabase
        .from('relato_responsaveis')
        .delete()
        .eq('relato_id', relatoId);
      if (responsiblesError) throw responsiblesError;

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
      fetchAllUsers();
    }
  }, [relatoId, fetchAllUsers]);

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
    setCurrentResponsibles
  };
};