import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2'

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  console.log('Edge Function: Request received.');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Edge Function: Handling OPTIONS request.');
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.log(`Edge Function: Method not allowed: ${req.method}`);
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  console.log('Edge Function: Initializing Supabase client.');
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { global: { headers: { 'x-my-custom-header': 'create-user-edge-function' } } }
  );

  console.log('Edge Function: Getting Authorization header.');
  // Get the user's JWT from the Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    console.error('Edge Function: Missing Authorization header.');
    return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header.' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 401,
    });
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    console.error('Edge Function: Invalid Authorization header format.');
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid Authorization header format.' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 401,
    });
  }

  console.log('Edge Function: Verifying user JWT.');
  // Verify the user's JWT
  const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser(token);

  if (authError || !authUser) {
    console.error('Edge Function: Invalid or expired token.', authError);
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or expired token.' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 401,
    });
  }

  console.log('Edge Function: Fetching user profile for permissions check.');
  // Fetch the user's profile to check permissions
  const { data: userProfile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('can_create_users')
    .eq('id', authUser.id)
    .single();

  if (profileError || !userProfile || !userProfile.can_create_users) {
    console.error('Edge Function: Forbidden - User does not have permission to create users.', profileError);
    return new Response(JSON.stringify({ error: 'Forbidden: User does not have permission to create users.' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 403,
    });
  }

  try {
    console.log('Edge Function: Parsing request body.');
    const { email, password, fullName, permissions } = await req.json();

    if (!email || !password || !fullName) {
      console.error('Edge Function: Missing required fields.');
      return new Response(JSON.stringify({ error: 'Missing required fields: email, password, fullName.' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 400,
      });
    }

    console.log('Edge Function: Creating user in Supabase Auth.');
    // Create user in Supabase Auth
    const { data: newUser, error: createUserError } = await supabaseClient.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Automatically confirm email
      user_metadata: { full_name: fullName },
    });

    if (createUserError) {
      console.error('Edge Function: Error creating user in auth:', createUserError);
      return new Response(JSON.stringify({ error: `Failed to create user: ${createUserError.message}` }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500,
      });
    }

    console.log('Edge Function: User created successfully in Auth.', newUser.user.id);

    // Insert profile into public.profiles table
    // This logic is removed as a database trigger is expected to handle profile creation.
    // If no trigger exists, profiles will need to be created manually or via another mechanism.

    console.log('Edge Function: Returning success response.');
    return new Response(JSON.stringify({ message: 'User created successfully', userId: newUser.user.id }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    });

  } catch (error) {
    console.error('Edge Function: Unhandled error in Edge Function:', error);
    return new Response(JSON.stringify({ error: `Internal server error: ${error.message}` }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 500,
    });
  }
});
