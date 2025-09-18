
import { supabase } from '@/01-shared/lib/supabase';

// Function to generate a UUID in environments where crypto.randomUUID is not available.
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const submitRelato = async ({ relatoData, imageFiles }) => {
  // Step 1: Invoke the Edge Function to create the relato entry and get its ID.
  const { data: functionResponse, error: functionError } = await supabase.functions.invoke(
    'submit-relato',
    { body: { relatoData } }
  );

  if (functionError) {
    console.error('Error invoking submit-relato function:', functionError);
    throw new Error(functionError.message);
  }

  const { relatoId } = functionResponse;

  if (!imageFiles || imageFiles.length === 0) {
    return { id: relatoId };
  }

  // Step 2: Enforce image limit (client-side for immediate feedback).
  if (imageFiles.length > 5) {
    throw new Error('Não é permitido o envio de mais de 5 imagens.');
  }

  // Step 3: If images are present, upload them.
  const { data: { user } } = await supabase.auth.getUser();
  
  const uploadedImageUrls = [];
  const pathIdentifier = user ? user.id : `anonymous/${generateUUID()}`;

  for (const [index, file] of imageFiles.entries()) {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${pathIdentifier}/${relatoId}/${Date.now()}_${index}.${fileExtension}`;

    // Pass relatoId to the function for backend validation
    const { data: presignedUrlData, error: presignedUrlError } = await supabase.functions.invoke(
      'get-presigned-image-url',
      { body: { fileName, fileType: file.type, relatoId } }
    );

    if (presignedUrlError) {
      // The backend will throw an error if the limit is exceeded.
      throw new Error(`Error getting presigned URL for ${file.name}: ${presignedUrlError.message}`);
    }

    const { presignedUrl } = presignedUrlData;

    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image ${file.name} to R2.`);
    }

    const imageUrl = `${import.meta.env.VITE_R2_PUBLIC_URL}/${fileName}`;
    uploadedImageUrls.push(imageUrl);
  }

  // Step 4: Associate uploaded images with the relato.
  const imagesToInsert = uploadedImageUrls.map((url, index) => ({
    relato_id: relatoId,
    image_url: url,
    order_index: index
  }));

  const { error: insertError } = await supabase
    .from('relato_images')
    .insert(imagesToInsert);

  if (insertError) {
    // TODO: Add cleanup logic here? If this fails, the images are in R2 but not in the DB.
    throw new Error('Failed to save image URLs to the database.');
  }

  return { id: relatoId };
};
