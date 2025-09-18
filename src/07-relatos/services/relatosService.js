import { supabase } from '@/01-shared/lib/supabase';

export const createRelato = async (relatoData) => {
  const { data, error } = await supabase
    .from('relatos')
    .insert([relatoData])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating relato:', error);
    throw new Error(error.message);
  }

  return data;
};

export const createRelatoWithImages = async ({ relatoData, imageFiles }) => {
  // Step 1: Create the relato entry and get its ID
  const { data: newRelato, error: createRelatoError } = await supabase
    .from('relatos')
    .insert([relatoData])
    .select('id')
    .single();

  if (createRelatoError) {
    console.error('Error creating relato:', createRelatoError);
    throw new Error(createRelatoError.message);
  }

  if (!imageFiles || imageFiles.length === 0) {
    return newRelato;
  }

  // Step 2: If images are present, upload them
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated for image upload.');

  const uploadedImageUrls = [];

  for (const [index, file] of imageFiles.entries()) {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${user.id}/${newRelato.id}/${Date.now()}_${index}.${fileExtension}`;

    const { data: functionData, error: functionError } = await supabase.functions.invoke(
      'get-presigned-image-url',
      { body: { fileName, fileType: file.type } }
    );

    if (functionError) {
      throw new Error(`Error from Edge Function for ${file.name}: ${functionError.message}`);
    }
    
    const { presignedUrl } = functionData;

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

  // Step 3: Associate uploaded images with the relato
  const imagesToInsert = uploadedImageUrls.map((url, index) => ({
    relato_id: newRelato.id,
    image_url: url,
    order_index: index
  }));

  const { error: insertError } = await supabase
    .from('relato_images')
    .insert(imagesToInsert);

  if (insertError) {
    // TODO: Add cleanup logic here? If this fails, the images are in R2 but not in the DB.
    // For now, we'll just throw the error.
    throw new Error('Failed to save image URLs to the database.');
  }

  return newRelato;
};