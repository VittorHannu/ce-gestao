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
  const { data, error } = await supabase.from(tableName).select('*').order('nome', { ascending: true });
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
  const { data, error } = await supabase.from(tableName).insert(newItem).select().single();
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
