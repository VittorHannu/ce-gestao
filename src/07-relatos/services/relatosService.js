
import { supabase } from '@/01-shared/lib/supabase';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const submitRelato = async ({ relatoData, imageFiles }) => {
  // If there are no images, just submit the data and return.
  if (!imageFiles || imageFiles.length === 0) {
    const { error } = await supabase.functions.invoke('submit-relato', {
      body: { relatoData }
    });
    if (error) throw new Error(error.message);
    return;
  }

  // --- Client-side validation for immediate feedback ---
  if (imageFiles.length > 5) {
    throw new Error('Não é permitido o envio de mais de 5 imagens.');
  }

  // --- Step 1: Get current user and define a unique path for the uploads ---
  const { data: { user } } = await supabase.auth.getUser();
  const pathIdentifier = user ? user.id : `anonymous/${generateUUID()}`;
  // We need a temporary unique ID for the file path before we have the relato_id
  const tempRelatoId = generateUUID(); 

  // --- Step 2: Upload all images to R2 storage ---
  const uploadedImageUrls = [];
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
    uploadedImageUrls.push(imageUrl);
  }

  // --- Step 3: Submit the relato data and the image URLs to the backend function ---
  const { error: submitError } = await supabase.functions.invoke('submit-relato', {
    body: { relatoData, imageUrls: uploadedImageUrls }
  });

  if (submitError) {
    // Note: This leaves orphan images in R2. A cleanup process would be needed for a production system.
    throw new Error(`Failed to submit relato: ${submitError.message}`);
  }

  return;
};
