import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.17';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2';

// Cloudflare R2 credentials
const R2_ACCOUNT_ID = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')!;
const R2_ACCESS_KEY_ID = Deno.env.get('R2_ACCESS_KEY_ID')!;
const R2_SECRET_ACCESS_KEY = Deno.env.get('R2_SECRET_ACCESS_KEY')!;
const R2_BUCKET_NAME = Deno.env.get('R2_BUCKET_NAME')!;

// Supabase credentials
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const aws = new AwsClient({
  accessKeyId: R2_ACCESS_KEY_ID,
  secretAccessKey: R2_SECRET_ACCESS_KEY,
  region: 'auto',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, ngrok-skip-browser-warning',
  'Access-Control-Allow-Methods': 'PUT, GET, POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { fileName, fileType, relatoId } = await req.json();

    if (!fileName || !fileType || !relatoId) {
      throw new Error('fileName, fileType e relatoId são obrigatórios.');
    }

    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Enforce the 5-image limit on the backend
    const { count, error: countError } = await supabaseAdmin
      .from('relato_images')
      .select('id', { count: 'exact', head: true })
      .eq('relato_id', relatoId);

    if (countError) {
      throw new Error(`Erro ao verificar o número de imagens: ${countError.message}`);
    }

    if (count >= 5) {
      throw new Error('Limite de 5 imagens por relato atingido.');
    }

    // Proceed with generating the presigned URL
    const url = new URL(`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${fileName}`);
    url.searchParams.set('X-Amz-Expires', '300'); // 5 minutes expiration

    const request = new Request(url, {
      method: 'PUT',
      headers: {
        'Content-Type': fileType,
      },
    });

    const signedRequest = await aws.sign(request, {
      aws: { signQuery: true },
    });

    const presignedUrl = signedRequest.url;

    return new Response(JSON.stringify({ presignedUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400, // Bad Request
    });
  }
});
