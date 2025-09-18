import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  // Consider how to handle this error state.
  // For now, we'll log and the function will fail on client creation.
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(supabaseUrl, serviceRoleKey);
    const { relatoData } = await req.json();

    let finalRelatoData = { ...relatoData };

    // Check for authentication
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const jwt = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseClient.auth.getUser(jwt);

      if (user) {
        // User is authenticated
        if (relatoData.is_anonymous) {
          // Authenticated user submitting anonymously
          finalRelatoData.user_id = null;
          finalRelatoData.is_anonymous = true;
        } else {
          // Authenticated user submitting as themselves
          finalRelatoData.user_id = user.id;
          finalRelatoData.is_anonymous = false;
        }
      } else {
        // Invalid JWT, treat as anonymous
        finalRelatoData.user_id = null;
        finalRelatoData.is_anonymous = true;
      }
    } else {
      // No auth header, definitely anonymous
      finalRelatoData.user_id = null;
      finalRelatoData.is_anonymous = true;
    }

    const { data: newRelato, error } = await supabaseClient
      .from('relatos')
      .insert([finalRelatoData])
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    return new Response(JSON.stringify({ message: 'Relato created successfully', relatoId: newRelato.id }), {
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