// supabase/functions/process-notification-queue/index.ts

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Tratamento de chamada pre-flight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // TEMPORARY TEST: Return success immediately to check if this function is blocking the main transaction.
  console.log('process-notification-queue was called, returning 200 OK for testing purposes.');
  return new Response(JSON.stringify({ message: "Queue processing temporarily disabled for testing." }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
})