import { supabase } from '@/01-shared/lib/supabase';

/**
 * Busca o conteúdo de seções da documentação pelo prefixo da chave.
 * @param {string} prefix - O prefixo para buscar (ex: 'pyramid_level_').
 * @returns {Promise<Array>} - Uma promessa que resolve para um array de seções da documentação.
 */
export async function getDocumentationSectionsByPrefix(prefix) {
  const { data, error } = await supabase
    .from('documentacao')
    .select('*')
    .like('section_key', `${prefix}%`)
    .order('section_key', { ascending: true });

  if (error) {
    console.error('Error fetching documentation sections:', error);
    throw error;
  }

  return data;
}
