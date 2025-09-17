import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/01-shared/hooks/useToast';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import { supabase } from '@/01-shared/lib/supabase';
import { handleServiceError } from '@/01-shared/lib/errorUtils';

export const useRelatoManagement = (relatoId) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();

  const [currentResponsibles, setCurrentResponsibles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetches the consolidated relato details from the new RPC function
  const fetchRelatoDetails = async () => {
    const { data, error } = await supabase
      .rpc('get_relato_details', { p_relato_id: relatoId })
      .single();

    if (error) throw error;
    return data;
  };

  const { data: relato, error, isLoading: loading } = useQuery({
    queryKey: ['relato', relatoId],
    queryFn: fetchRelatoDetails,
    enabled: !!relatoId,
    onSuccess: (data) => {
      // The 'responsaveis' field is now a JSON array from the RPC
      if (data && data.responsaveis) {
        setCurrentResponsibles(data.responsaveis.map(r => r.id));
      } else {
        setCurrentResponsibles([]);
      }
    },
    onError: (err) => {
      handleServiceError('fetchRelatoDetails', err, toast);
    }
  });

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
      // Note: RLS policies should handle cascading deletes for related tables
      // like comments, responsaveis, and images. Explicitly deleting them
      // here might be redundant if policies are set up correctly.
      // For safety, we can keep them, but it's worth reviewing.
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
      
      const { error: imagesError } = await supabase
        .from('relato_images')
        .delete()
        .eq('relato_id', relatoId);
      if (imagesError) throw imagesError;

      const { error: deleteError } = await supabase
        .from('relatos')
        .delete()
        .eq('id', relatoId);

      if (deleteError) throw deleteError;

      toast({ title: 'Relato excluído com sucesso!' });
      queryClient.invalidateQueries(['relatos']); // Invalidate the main list
      return true;
    } catch (err) {
      handleServiceError('handleDeleteRelato', err, toast);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [relatoId, toast, queryClient]);

  return {
    relato,
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