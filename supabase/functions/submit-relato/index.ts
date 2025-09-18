
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(supabaseUrl, serviceRoleKey);
    const { relatoData, imageUrls } = await req.json();

    // --- Backend validation for image limit ---
    if (imageUrls && imageUrls.length > 5) {
      throw new Error('Limite de 5 imagens por relato atingido.');
    }

    let finalRelatoData = { ...relatoData };

    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const jwt = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseClient.auth.getUser(jwt);
      if (user) {
        finalRelatoData.user_id = relatoData.is_anonymous ? null : user.id;
        finalRelatoData.is_anonymous = relatoData.is_anonymous;
      } else {
        finalRelatoData.user_id = null;
        finalRelatoData.is_anonymous = true;
      }
    } else {
      finalRelatoData.user_id = null;
      finalRelatoData.is_anonymous = true;
    }

    // --- Insert relato ---
    const { data: newRelato, error: relatoError } = await supabaseClient
      .from('relatos')
      .insert(finalRelatoData)
      .select('id')
      .single();

    if (relatoError) {
      console.error('Supabase relato insert error:', relatoError);
      throw new Error(`Database error on relato insert: ${relatoError.message}`);
    }

    const relatoId = newRelato.id;

    // --- Insert image URLs if they exist ---
    if (imageUrls && imageUrls.length > 0) {
      const imagesToInsert = imageUrls.map((url, index) => ({
        relato_id: relatoId,
        image_url: url,
        order_index: index,
      }));

      const { error: imageError } = await supabaseClient
        .from('relato_images')
        .insert(imagesToInsert);

      if (imageError) {
        console.error('Supabase image insert error:', imageError);
        // Note: This leaves an orphan relato. A more robust solution could
        // wrap these in a transaction or queue a cleanup.
        throw new Error(`Database error on image insert: ${imageError.message}`);
      }
    }

    return new Response(JSON.stringify({ message: 'Relato created successfully', relatoId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in submit-relato function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
