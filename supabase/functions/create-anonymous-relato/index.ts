import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2'

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { relatoData } = await req.json();

    // The following line is commented out because we are creating a new role
    // and we don't need to set it explicitly. The RLS policy will handle it.
    // await supabaseClient.rpc('set_role', { role: 'anon_relator' });

    const { data: newRelato, error } = await supabaseClient
      .from('relatos')
      .insert([relatoData])
      .select('id')
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ message: 'Relato created successfully', relatoId: newRelato.id }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: `Internal server error: ${error.message}` }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 500,
    });
  }
});
