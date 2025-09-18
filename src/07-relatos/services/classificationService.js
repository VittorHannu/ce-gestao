import { supabase } from '@/01-shared/lib/supabase';

/**
 * Updates the classifications for a specific category of a relato.
 * This is done by deleting all existing classifications for that category and relato,
 * and then inserting the new ones.
 * 
 * @param {string} relatoId - The ID of the relato.
 * @param {number} categoryId - The ID of the classification category.
 * @param {string[]} classificationIds - An array of the new classification IDs.
 * @returns {Promise<null>} A promise that resolves when the operation is complete.
 */
export const updateCategoryClassifications = async (relatoId, categoryId, classificationIds) => {
  // First, find the table name for the given categoryId
  const { data: category, error: categoryError } = await supabase
    .from('classification_categories')
    .select('table_name')
    .eq('id', categoryId)
    .single();

  if (categoryError) {
    console.error('Error fetching category table name:', categoryError);
    throw new Error('Não foi possível encontrar a categoria de classificação.');
  }

  const tableName = category.table_name;

  // Now, perform the delete and insert in a transaction
  const { error: deleteError } = await supabase
    .from('relato_classificacoes')
    .delete()
    .eq('relato_id', relatoId)
    .eq('classification_table', tableName);

  if (deleteError) {
    console.error('Error deleting old classifications:', deleteError);
    throw new Error('Erro ao remover classificações antigas.');
  }

  if (classificationIds && classificationIds.length > 0) {
    const newEntries = classificationIds.map(classificationId => ({
      relato_id: relatoId,
      classification_id: classificationId,
      classification_table: tableName
    }));

    const { error: insertError } = await supabase
      .from('relato_classificacoes')
      .insert(newEntries);

    if (insertError) {
      console.error('Error inserting new classifications:', insertError);
      throw new Error('Erro ao adicionar novas classificações.');
    }
  }

  return null;
};
