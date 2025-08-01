/*
 * Este arquivo (`delete-user.js`) define uma função serverless (endpoint de API)
 * responsável por deletar usuários do sistema Supabase. Ele utiliza a chave
 * `service_role` do Supabase para ter permissões administrativas, permitindo
 * remover usuários diretamente do sistema de autenticação.
 *
 * Visualmente, este arquivo não tem impacto direto no frontend. Sua função é de
 * lógica de backend, sendo acionado quando o frontend (por exemplo, a página
 * de gerenciamento de usuários) envia uma requisição para deletar um usuário.
 * Ele garante que o usuário seja removido de forma segura do sistema.
 *
 *
 *
 *
 */

// api/delete-user.js

// Importa a biblioteca do Supabase
import { createClient } from '@supabase/supabase-js';

// Esta função será executada quando seu frontend chamar esta API
export default async function handler(req, res) {
  // A chave service_role NUNCA deve ser exposta no frontend.
  // Ela será lida de uma variável de ambiente segura no Vercel.
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL; // Sua URL do Supabase, lida do .env

  // Verifica se a chave service_role está configurada
  if (!supabaseServiceRoleKey || !supabaseUrl) {
    return res.status(500).json({ error: 'Configuração do Supabase incompleta. Verifique as variáveis de ambiente.' });
  }

  // Cria um cliente Supabase com a chave service_role (chave mestra)
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // A função serverless só aceitará requisições POST
  if (req.method === 'POST') {
    console.log('DEBUG: Requisição recebida. Método:', req.method);
    console.log('DEBUG: Corpo da requisição (req.body):', req.body);

    let parsedBody;
    try {
      // Vercel geralmente faz o parse JSON automaticamente, mas esta linha garante que seja um objeto.
      parsedBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
      console.error('DEBUG: Erro ao parsear corpo da requisição:', e);
      return res.status(400).json({ error: 'Corpo da requisição inválido (não é JSON válido).' });
    }

    const { userId } = parsedBody || {}; // Pega o ID do usuário

    if (!userId) {
      console.error('DEBUG: ID do usuário é nulo, indefinido ou vazio após tratamento.');
      return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
    }

    try {
      // Chama a API de administração do Supabase para deletar o usuário
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (error) {
        // Se houver um erro na API do Supabase, lança o erro
        throw error;
      }

      // Retorna uma resposta de sucesso
      res.status(200).json({ message: `Usuário ${userId} deletado com sucesso.` });
    } catch (error) {
      console.error('DEBUG: Erro geral na função serverless:', error.message);
      res.status(500).json({ error: 'Erro interno do servidor ao deletar usuário.', details: error.message });
    }
  } else {
    // Se a requisição não for POST, retorna erro
    res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }
}
