import { supabase } from '../../01-shared/lib/supabase';

const handleSupabaseError = (error) => {
  if (error) {
    console.error('Error in classification service:', error.message);
    throw new Error(`Erro no serviço de classificação: ${error.message}`);
  }
};

/**
 * Fetches all items from a given classification table.
 * @param {string} tableName - The name of the classification table.
 * @returns {Promise<Array>} - A promise that resolves to an array of items.
 */
export const getClassifications = async (tableName) => {
  const { data, error } = await supabase.from(tableName).select('*').order('ordem', { ascending: true });
  handleSupabaseError(error);
  return data;
};

/**
 * Adds a new item to a classification table.
 * @param {string} tableName - The name of the classification table.
 * @param {object} newItem - The new item to add (should have a 'nome' property).
 * @returns {Promise<object>} - A promise that resolves to the newly created item.
 */
export const addClassification = async (tableName, newItem) => {
  // 1. Get the current maximum order value
  const { data: maxOrderData, error: maxOrderError } = await supabase
    .from(tableName)
    .select('ordem')
    .order('ordem', { ascending: false })
    .limit(1)
    .single();

  if (maxOrderError && maxOrderError.code !== 'PGRST116') { // PGRST116: "exact-cardinality-violation" - no rows found
    handleSupabaseError(maxOrderError);
  }

  const newOrder = maxOrderData ? maxOrderData.ordem + 1 : 1;

  // 2. Add the new item with the calculated order
  const itemToInsert = { ...newItem, ordem: newOrder };

  const { data, error } = await supabase.from(tableName).insert(itemToInsert).select().single();
  handleSupabaseError(error);
  return data;
};

/**
 * Updates an existing item in a classification table.
 * @param {string} tableName - The name of the classification table.
 * @param {number} id - The ID of the item to update.
 * @param {object} updates - An object with the fields to update.
 * @returns {Promise<object>} - A promise that resolves to the updated item.
 */
export const updateClassification = async (tableName, id, updates) => {
  const { data, error } = await supabase.from(tableName).update(updates).eq('id', id).select().single();
  handleSupabaseError(error);
  return data;
};

/**
 * Deletes an item from a classification table.
 * @param {string} tableName - The name of the classification table.
 * @param {number} id - The ID of the item to delete.
 * @returns {Promise<void>}
 */
export const deleteClassification = async (tableName, id) => {
  const { error } = await supabase.from(tableName).delete().eq('id', id);
  handleSupabaseError(error);
};

/**
 * Updates the order of multiple items in a classification table.
 * @param {string} tableName - The name of the classification table.
 * @param {Array<{id: number, ordem: number}>} items - An array of items with their new order.
 * @returns {Promise<void>}
 */
export const updateClassificationOrder = async (tableName, items) => {
  const updates = items.map(item =>
    supabase.from(tableName).update({ ordem: item.ordem }).eq('id', item.id)
  );
  const results = await Promise.all(updates);
  results.forEach(result => handleSupabaseError(result.error));
  return results;
};

export const getAllClassificationCounts = async () => {
  const { data, error } = await supabase.rpc('get_all_classification_counts');
  handleSupabaseError(error);
  return data;
};

export const getClassificationCategories = async () => {
  const { data, error } = await supabase
    .from('classification_categories')
    .select('*')
    .order('ordem', { ascending: true });
  handleSupabaseError(error);
  return data;
};

export const updateClassificationCategoryOrder = async (items) => {
  const updates = items.map(item =>
    supabase.from('classification_categories').update({ ordem: item.ordem }).eq('id', item.id)
  );
  const results = await Promise.all(updates);
  results.forEach(result => handleSupabaseError(result.error));
  return results;
};
