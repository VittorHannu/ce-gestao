import { supabase } from '@/01-shared/lib/supabase';

export async function fetchRelatosCountByType(startDate, endDate) {
  let query = supabase
    .from('relatos')
    .select('tipo_relato, data_ocorrencia'); // Select only necessary columns

  if (startDate) {
    query = query.gte('data_ocorrencia', startDate);
  }
  if (endDate) {
    query = query.lte('data_ocorrencia', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching relatos for count by type:', error);
    throw error;
  }

  // Perform client-side grouping and counting
  const counts = data.reduce((acc, item) => {
    const type = item.tipo_relato || 'Não Especificado';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Transform to array format for Recharts
  const transformedData = Object.keys(counts).map(type => ({
    name: type,
    value: counts[type]
  }));

  // Sort by value (count) in descending order
  transformedData.sort((a, b) => b.value - a.value);

  return transformedData;
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