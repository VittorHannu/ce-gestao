import { supabase } from '@/01-common/lib/supabase';
import { handleServiceError } from '@/01-common/lib/errorUtils';

export const getRelatos = async (filters) => {
  try {
    let query = supabase
      .from('relatos_with_creator')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.calculated_status) query = query.eq('calculated_status', filters.calculated_status);
    if (filters.gravidade) query = query.eq('gravidade', filters.gravidade);
    if (filters.tipo_incidente) query = query.eq('tipo_incidente', filters.tipo_incidente);
    if (filters.data_inicial) query = query.gte('data_ocorrencia', filters.data_inicial);
    if (filters.data_final) query = query.lte('data_ocorrencia', filters.data_final); // Use lte for data_final
    if (filters.busca) {
      query = query.or(`descricao.ilike.%${filters.busca}%,local_ocorrencia.ilike.%${filters.busca}%,codigo_relato.ilike.%${filters.busca}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    return handleServiceError('getRelatos', error);
  }
};

export const getRelatoById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('relatos_with_creator')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleServiceError('getRelatoById', error);
  }
};

export const getRelatosStats = async () => {
  try {
    const { data, error } = await supabase
      .from('relatos_stats')
      .select('*')
      .single();

    if (error) throw error;

    // Ensure data is an object with default values if null
    const statsData = data || {
      total_relatos: 0,
      relatos_pendentes: 0,
      relatos_em_andamento: 0,
      relatos_concluidos: 0,
      relatos_sem_tratativa: 0
    };

    return { data: statsData, error: null };
  } catch (error) {
    return handleServiceError('getRelatosStats', error);
  }
};

export const saveRelato = async (relatoData, relatoId, userId, isAdmin) => {
  try {
    const baseDataToSave = {
      ...relatoData,
      data_ocorrencia: relatoData.data_ocorrencia ? new Date(relatoData.data_ocorrencia).toISOString().split('T')[0] : null,
      hora_aproximada_ocorrencia: relatoData.hora_aproximada_ocorrencia || null,
      data_conclusao_solucao: relatoData.data_conclusao_solucao ? new Date(relatoData.data_conclusao_solucao).toISOString().split('T')[0] : null,
      responsaveis: relatoData.responsaveis && relatoData.responsaveis.length > 0 ? relatoData.responsaveis : [],
      atualizado_por: userId,
      nao_informar_data_conclusao: relatoData.nao_informar_data_conclusao,
      nao_informar_hora_aproximada: relatoData.nao_informar_hora_aproximada,
      // Ensure boolean fields are actually booleans
      nao_houve_danos: !!relatoData.nao_houve_danos,
      nao_sabe_causa_dano: !!relatoData.nao_sabe_causa_dano,
      nao_sabe_causa_riscos: !!relatoData.nao_sabe_causa_riscos,
      is_anonymous: !!relatoData.is_anonymous
    };

    // Fields that should only be set by admin or on initial creation
    if (!isAdmin) {
      baseDataToSave.tipo_incidente = null;
      baseDataToSave.gravidade = null;
      baseDataToSave.responsaveis = null; // Admin-only field
      baseDataToSave.planejamento_cronologia_solucao = null;
      baseDataToSave.data_conclusao_solucao = null;
    }

    let result;
    let oldRelatoData = null;

    if (relatoId) {
      // Fetch old data for audit log
      const { data: oldData, error: fetchError } = await supabase
        .from('relatos')
        .select('*')
        .eq('id', relatoId)
        .single();
      if (fetchError) throw fetchError;
      oldRelatoData = oldData;

      // Update existing relato
      const dataToUpdate = { ...baseDataToSave };
      // Remove fields that should not be updated
      delete dataToUpdate.codigo_relato;
      delete dataToUpdate.criado_por;

      result = await supabase
        .from('relatos')
        .update(dataToUpdate)
        .eq('id', relatoId)
        .select(); // Select the updated row
    } else {
      // Insert new relato
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const generatedCodigoRelato = `REL-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;

      const dataToInsert = {
        ...baseDataToSave,
        criado_por: userId,
        codigo_relato: generatedCodigoRelato
      };

      result = await supabase
        .from('relatos')
        .insert([dataToInsert])
        .select(); // Select the inserted row
    }

    if (result.error) throw result.error;

    const newRelatoData = result.data && result.data.length > 0 ? result.data[0] : null;

    // Log to audit table
    if (newRelatoData) {
      await supabase.from('relatos_audit_log').insert({
        relato_id: newRelatoData.id,
        changed_by: userId,
        change_type: relatoId ? 'UPDATE' : 'INSERT',
        old_data: oldRelatoData,
        new_data: newRelatoData
      });
    }

    return { data: newRelatoData, error: null };
  } catch (error) {
    return handleServiceError('saveRelato', error);
  }
};

export const deleteRelato = async (relatoId, userId) => {
  try {
    // Fetch old data for audit log before deleting
    const { data: oldRelatoData, error: fetchError } = await supabase
      .from('relatos')
      .select('*')
      .eq('id', relatoId)
      .single();
    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('relatos')
      .delete()
      .eq('id', relatoId);

    if (error) throw error;

    // Log to audit table
    await supabase.from('relatos_audit_log').insert({
      relato_id: relatoId,
      changed_by: userId,
      change_type: 'DELETE',
      old_data: oldRelatoData,
      new_data: null // No new data on delete
    });

    return { success: true, error: null };
  } catch (error) {
    return handleServiceError('deleteRelato', error);
  }
};
