import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // This is needed for OPTIONS requests to work
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Create a Supabase client with the service role key
    // This allows bypassing RLS and performing admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Delete the user from auth.users
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting user from auth.users:', authError.message)
      return new Response(JSON.stringify({ error: authError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // The foreign key constraint with ON DELETE CASCADE should handle the public.profiles deletion.
    // If not, you would explicitly delete from public.profiles here:
    // const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', userId);
    // if (profileError) { /* handle error */ }

    return new Response(JSON.stringify({ message: 'User deleted successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing request:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})