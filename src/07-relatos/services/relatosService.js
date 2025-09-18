
import { supabase } from '@/01-shared/lib/supabase';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const submitRelato = async ({ relatoData, imageFiles }) => {
  let imageUrls = [];

  // If there are images, upload them first.
  if (imageFiles && imageFiles.length > 0) {
    if (imageFiles.length > 5) {
      throw new Error('Não é permitido o envio de mais de 5 imagens.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    const pathIdentifier = user ? user.id : `anonymous/${generateUUID()}`;
    const tempRelatoId = generateUUID();

    for (const [index, file] of imageFiles.entries()) {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${pathIdentifier}/${tempRelatoId}/${Date.now()}_${index}.${fileExtension}`;

      const { data: presignedUrlData, error: presignedUrlError } = await supabase.functions.invoke(
        'get-presigned-image-url',
        { body: { fileName, fileType: file.type } }
      );

      if (presignedUrlError) {
        throw new Error(`Error getting presigned URL: ${presignedUrlError.message}`);
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
      imageUrls.push(imageUrl);
    }
  }

  // Always submit the relato data and any image URLs to the backend function.
  const { data, error } = await supabase.functions.invoke('submit-relato', {
    body: { relatoData, imageUrls }
  });

  if (error) {
    throw new Error(`Failed to submit relato: ${error.message}`);
  }

  // The Edge Function returns { relatoId: '...' }. We pass this back to the hook.
  return data;
};
