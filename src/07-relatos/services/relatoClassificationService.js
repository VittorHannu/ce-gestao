import { supabase } from '../../01-shared/lib/supabase';
import { getClassificationCategories, getClassifications } from '../../05-adm/services/classificationService';

const handleSupabaseError = (error) => {
  if (error) {
    console.error('Error in relato classification service:', error.message);
    throw new Error(`Erro no serviço de classificação de relatos: ${error.message}`);
  }
};

/**
 * Fetches all classification items from all categories and groups them.
 * This is used to populate the classification selector.
 * @returns {Promise<Array<{name: string, tableName: string, items: Array}>>}
 */
export const getAllClassificationsGrouped = async () => {
  const categories = await getClassificationCategories();
  
  const groupedClassifications = await Promise.all(
    categories.map(async (category) => {
      const items = await getClassifications(category.table_name);
      return {
        ...category,
        items: items || []
      };
    })
  );

  return groupedClassifications;
};

/**
 * Fetches the classifications associated with a specific relato.
 * @param {string} relatoId - The UUID of the relato.
 * @returns {Promise<Array<{classification_table: string, classification_id: number}>>}
 */
export const getRelatoClassifications = async (relatoId) => {
  if (!relatoId) {
    return [];
  }
  const { data, error } = await supabase
    .from('relato_classificacoes')
    .select('classification_table, classification_id')
    .eq('relato_id', relatoId);

  handleSupabaseError(error);
  return data;
};

/**
 * Updates the classifications for a given relato using a delete-then-insert strategy.
 * @param {string} relatoId - The UUID of the relato.
 * @param {Array<{classification_table: string, classification_id: number}>} classifications - The full new list of classifications.
 * @returns {Promise<void>}
 */
export const updateRelatoClassifications = async (relatoId, classifications) => {
  // 1. Delete all existing classifications for this relato
  const { error: deleteError } = await supabase
    .from('relato_classificacoes')
    .delete()
    .eq('relato_id', relatoId);
  handleSupabaseError(deleteError);

  // 2. Insert the new list of classifications, if any
  if (classifications && classifications.length > 0) {
    const newEntries = classifications.map(c => ({
      relato_id: relatoId,
      classification_table: c.classification_table,
      classification_id: c.classification_id
    }));

    const { error: insertError } = await supabase
      .from('relato_classificacoes')
      .insert(newEntries);
    handleSupabaseError(insertError);
  }
};
