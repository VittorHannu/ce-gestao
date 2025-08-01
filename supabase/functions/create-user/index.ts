/*
 * Este arquivo (`index.ts`) define uma Supabase Edge Function (função de borda)
 * para criar novos usuários no sistema. Ele é executado no ambiente de borda do Supabase
 * e utiliza a chave `SERVICE_ROLE_KEY` para ter permissões administrativas.
 * A função recebe dados do usuário (email, senha, nome completo e permissões)
 * e os utiliza para criar o usuário no sistema de autenticação do Supabase
 * e atualizar seu perfil na tabela `profiles`.
 *
 * Visualmente, esta função não tem impacto direto no frontend. Ela atua como
 * um backend para a funcionalidade de criação de usuários, sendo invocada
 * por requisições do frontend (por exemplo, da página de gerenciamento de usuários).
 * Ela garante que a criação de usuários e a atribuição de permissões sejam
 * realizadas de forma segura e eficiente no lado do servidor.
 *
 *
 *
 *
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 405,
    });
  }

  let requestBody;
  try {
    requestBody = await req.text(); // Read as text first
    if (!requestBody) {
      throw new Error("Request body is empty.");
    }
    const { email, password, fullName, permissions } = JSON.parse(requestBody); // Then parse

    // Initialize Supabase client with service_role_key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SERVICE_ROLE_KEY"), // Corrected variable name
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create user using admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin created users
    });

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 400,
      });
    }

    // Update profile with full name and new permissions
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: fullName,
        can_view_users: permissions.can_view_users,
        can_create_users: permissions.can_create_users,
        can_update_users: permissions.can_update_users,
        can_delete_users: permissions.can_delete_users,
        can_view_relatos: permissions.can_view_relatos,
        can_create_relatos: permissions.can_create_relatos,
        can_edit_relatos: permissions.can_edit_relatos,
        can_delete_relatos: permissions.can_delete_relatos,
        is_active: permissions.is_active,
        needs_password_reset: true, // Explicitly set needs_password_reset to true
      })
      .eq("id", authData.user.id);

    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 400,
      });
    }

    return new Response(JSON.stringify(profileData), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (e) {
    console.error("Error processing request:", e.message);
    return new Response(JSON.stringify({ error: `Error: ${e.message}` }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 400,
    });
  }
});