/*
 * Este arquivo (`index.ts`) define uma Supabase Edge Function (função de borda)
 * para deletar usuários do sistema. Ele é executado no ambiente de borda do Supabase
 * e utiliza a chave `SERVICE_ROLE_KEY` para ter permissões administrativas.
 * A função recebe o ID do usuário a ser deletado e, crucialmente, verifica
 * se o usuário que invocou a função possui permissões de super administrador
 * antes de prosseguir com a exclusão.
 *
 * Visualmente, esta função não tem impacto direto no frontend. Ela atua como
 * um backend para a funcionalidade de exclusão de usuários, sendo invocada
 * por requisições do frontend (por exemplo, da página de gerenciamento de usuários).
 * Ela garante que a exclusão de usuários seja realizada de forma segura e que
 * apenas usuários autorizados possam executar essa operação crítica.
 *
 *
 *
 *
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Função principal que será executada quando a Edge Function for chamada
serve(async (req) => {
  // Trata a requisição OPTIONS (preflight) para CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    // Cria um cliente Supabase com permissões de administrador (service_role)
    // Isso é seguro porque a chave de serviço nunca é exposta no lado do cliente
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Extrai o token de autorização do cabeçalho da requisição
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('Cabeçalho de autorização ausente.')
    }
    const token = authHeader.split('Bearer ')[1]
    if (!token) {
      throw new Error('Token de autorização inválido.')
    }

    // Verifica se o usuário autenticado é um super admin
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Token de autenticação inválido ou expirado.')
    }

    // Consulta a tabela de perfis para verificar a coluna 'super_admin'
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('super_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !profile.super_admin) {
      throw new Error('Não autorizado: Apenas super administradores podem deletar usuários.')
    }

    // Extrai o ID do usuário do corpo da requisição
    const { userId } = await req.json()
    if (!userId) {
      throw new Error('O ID do usuário é obrigatório.')
    }

    // Chama a API de administração do Supabase para deletar o usuário
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
      // Se houver um erro na API do Supabase, lança o erro
      throw error
    }

    // Retorna uma resposta de sucesso
    return new Response(JSON.stringify({ message: `Usuário ${userId} deletado com sucesso.` }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    })
  } catch (error) {
    // Em caso de qualquer erro, retorna uma resposta de erro
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    })
  }
})
