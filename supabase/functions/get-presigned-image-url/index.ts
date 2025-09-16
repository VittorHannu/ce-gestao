import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { AwsClient } from 'https://esm.sh/aws4fetch@1.0.17'

// Obter credenciais das variáveis de ambiente
const R2_ACCOUNT_ID = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')!
const R2_ACCESS_KEY_ID = Deno.env.get('R2_ACCESS_KEY_ID')!
const R2_SECRET_ACCESS_KEY = Deno.env.get('R2_SECRET_ACCESS_KEY')!
const R2_BUCKET_NAME = Deno.env.get('R2_BUCKET_NAME')!

// Criar um cliente AWS leve
const aws = new AwsClient({
  accessKeyId: R2_ACCESS_KEY_ID,
  secretAccessKey: R2_SECRET_ACCESS_KEY,
  region: 'auto',
})

serve(async (req) => {
  // Lidar com a requisição preflight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, ngrok-skip-browser-warning',
        'Access-Control-Allow-Methods': 'PUT, GET, POST, OPTIONS',
      },
    })
  }

  try {
    const { fileName, fileType } = await req.json()

    if (!fileName || !fileType) {
      throw new Error('fileName e fileType são obrigatórios.')
    }

    // Construir a URL do objeto no bucket R2
    const url = new URL(`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${fileName}`)

    // Definir o tempo de expiração da URL (ex: 5 minutos)
    url.searchParams.set('X-Amz-Expires', '300')

    // Criar um objeto de requisição para ser assinado
    const request = new Request(url, {
      method: 'PUT',
      headers: {
        'Content-Type': fileType,
      },
    })

    // Assinar a requisição para gerar a URL pré-assinada
    const signedRequest = await aws.sign(request, {
      aws: { signQuery: true }, // Importante: Isso cria a URL pré-assinada
    })

    // A URL final está na propriedade .url da requisição assinada
    const presignedUrl = signedRequest.url

    return new Response(JSON.stringify({ presignedUrl }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 400,
    })
  }
})
