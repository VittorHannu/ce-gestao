import { supabase } from '@/01-shared/lib/supabase';

export async function fetchRelatosCountByType(startDate, endDate) {
  const { data, error } = await supabase.rpc('get_relatos_count_by_type', {
    p_start_date: startDate,
    p_end_date: endDate
  });

  if (error) {
    console.error('Error fetching relatos for count by type:', error);
    throw error;
  }

  // The data will already be in the format: [{ tipo_relato: 'TypeA', count: 10 }, ...]
  // We need to transform it to: [{ name: 'TypeA', value: 10 }, { name: 'TypeB', value: 5 }] for the chart
  const formattedData = data.map(item => ({
    name: item.tipo_relato,
    value: item.total_count, // 'value' for the total count, as used by the existing chart
    concluido: item.concluido_count,
    emAndamento: item.em_andamento_count,
    semTratativa: item.sem_tratativa_count
  }));

  return formattedData;
}

export async function fetchUnclassifiedRelatos() {
  const { data, error } = await supabase
    .from('relatos')
    .select('*') // Select all columns for now
    .is('tipo_relato', null); // Filter where tipo_relato is null

  if (error) {
    console.error('Error fetching unclassified relatos:', error);
    throw error;
  }
  return data;
}

export async function updateRelatoType(relatoId, newType) {
  const { data, error } = await supabase
    .from('relatos')
    .update({ tipo_relato: newType })
    .eq('id', relatoId);

  if (error) {
    console.error('Error updating relato type:', error);
    throw error;
  }
  return data;
}

export async function getLastLostTimeAccidentDate() {
  const { data, error } = await supabase.rpc('get_last_lost_time_accident_date');

  if (error) {
    console.error('Error fetching last lost time accident date:', error);
    throw error;
  }

  return data;
}
