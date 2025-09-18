import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.17';

// Headers CORS para todas as respostas
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, ngrok-skip-browser-warning',
};

// Inicializa um cliente AWS leve, ideal para este ambiente
const aws = new AwsClient({
  accessKeyId: Deno.env.get('R2_ACCESS_KEY_ID')!,
  secretAccessKey: Deno.env.get('R2_SECRET_ACCESS_KEY')!,
  region: 'auto',
});

serve(async (req) => {
  // Lida com a requisição preflight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { fileName } = await req.json();

    if (!fileName) {
      throw new Error('fileName é obrigatório.');
    }

    // Constrói a URL do objeto no bucket R2
    const r2AccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')!;
    const r2BucketName = Deno.env.get('R2_BUCKET_NAME')!;
    const url = new URL(`https://${r2AccountId}.r2.cloudflarestorage.com/${r2BucketName}/${fileName}`);

    // Cria a requisição para ser assinada, usando o método DELETE
    const request = new Request(url, {
      method: 'DELETE',
    });

    // Assina a requisição
    const signedRequest = await aws.sign(request);

    // Envia a requisição assinada para o R2
    const response = await fetch(signedRequest);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Falha ao deletar imagem do R2: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    // Retorna sucesso
    return new Response(JSON.stringify({ message: 'Image deleted successfully from R2' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
