// src/07-relatos/hooks/useRelatoManagement.js

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/01-shared/lib/supabase';
import { useOutletContext } from 'react-router-dom';

const useRelatoManagement = (relatoId) => {
  const { showToast } = useOutletContext();
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
    } catch (err) {
      showToast(`Erro ao atualizar relato: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reproving relato
  const handleReproveRelato = async (reason) => {
    setIsReproving(true);
    try {
      const { error } = await supabase
        .from('relatos')
        .update({ status: 'reprovado', reproval_reason: reason })
        .eq('id', relatoId);

      if (error) throw error;
      showToast('Relato reprovado com sucesso!', 'success');
      fetchRelato();
    } catch (err) {
      showToast(`Erro ao reprovar relato: ${err.message}`, 'error');
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
        .update({ status: 'pendente' }) // Removed reproval_reason: null
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
      // Optionally navigate away after deletion
    } catch (err) {
      showToast(`Erro ao deletar relato: ${err.message}`, 'error');
    } finally {
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