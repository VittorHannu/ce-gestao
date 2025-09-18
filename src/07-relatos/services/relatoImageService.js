import { supabase } from '../../01-shared/lib/supabase';

const handleSupabaseError = (error) => {
  if (error) {
    console.error('Error in relato image service:', error.message);
    throw new Error(`Erro no serviço de imagens do relato: ${error.message}`);
  }
};

/**
 * Deletes an image from Cloudflare R2 and its entry from the Supabase database.
 * @param {string} imageUrl - The full URL of the image to delete.
 * @returns {Promise<void>}
 */
export const deleteRelatoImage = async (imageUrl) => {
  if (!imageUrl) {
    throw new Error('Image URL is required to delete an image.');
  }

  // Extract the fileName from the imageUrl
  // Assuming imageUrl format: VITE_R2_PUBLIC_URL/user_id/relato_id/timestamp_index.extension
  const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
  if (!r2PublicUrl || !imageUrl.startsWith(r2PublicUrl)) {
    throw new Error('Invalid image URL or R2 Public URL not configured.');
  }
  const fileName = imageUrl.substring(r2PublicUrl.length + 1); // +1 to remove the trailing slash if any

  // 1. Call the Edge Function to delete the image from Cloudflare R2
  const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke(
    'delete-image',
    { body: { fileName } }
  );

  if (edgeFunctionError) {
    throw new Error(`Erro ao deletar imagem do R2: ${edgeFunctionError.message}`);
  }
  if (edgeFunctionData.error) {
    throw new Error(`Erro da Edge Function: ${edgeFunctionData.error}`);
  }

  // 2. Delete the image entry from the Supabase database
  const { error: dbError } = await supabase
    .from('relato_images')
    .delete()
    .eq('image_url', imageUrl);

  handleSupabaseError(dbError);
};
