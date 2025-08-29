import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { relatoData } = await req.json();
    console.log('Received relato data:', JSON.stringify(relatoData, null, 2));

    let newRelato;
    try {
      const { data, error } = await supabaseClient
        .from('relatos')
        .insert([relatoData])
        .select('id')
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      newRelato = data;
    } catch (dbError) {
      console.error('Error during database insertion:', dbError);
      return new Response(JSON.stringify({ error: `Failed to insert data: ${dbError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('Successfully inserted relato with ID:', newRelato.id);

    return new Response(JSON.stringify({ message: 'Relato created successfully', relatoId: newRelato.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Outer catch block error:', error);
    return new Response(JSON.stringify({ error: `Internal server error: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
