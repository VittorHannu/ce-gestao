/*
 * Este arquivo (`create-user.js`) define uma função serverless (endpoint de API)
 * responsável por criar novos usuários no sistema Supabase. Ele utiliza a chave
 * `service_role` do Supabase para ter permissões administrativas, permitindo
 * criar usuários diretamente no sistema de autenticação e atualizar seus perfis.
 *
 * Visualmente, este arquivo não tem impacto direto no frontend. Sua função é de
 * lógica de backend, sendo acionado quando o frontend (por exemplo, o formulário
 * de criação de usuário na página de gerenciamento de usuários) envia uma requisição
 * para criar um novo usuário. Ele gera uma senha temporária e garante que o perfil
 * do usuário seja devidamente registrado.
 *
 *
 *
 *
 */

// api/create-user.js

// Importa a biblioteca do Supabase
import { createClient } from '@supabase/supabase-js';

// Função para gerar uma senha temporária aleatória
function generateTemporaryPassword(length = 12) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

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

    const { email, full_name } = parsedBody || {}; // Pega o e-mail e o nome completo
    const finalEmail = email ? String(email).trim() : ''; // Garante que é string e remove espaços
    const finalFullName = full_name ? String(full_name).trim() : null; // Garante que é string e remove espaços, ou null

    console.log('DEBUG: E-mail extraído e tratado:', finalEmail);
    console.log('DEBUG: Nome Completo extraído e tratado:', finalFullName);

    if (!finalEmail) {
      console.error('DEBUG: E-mail é nulo, indefinido ou vazio após tratamento.');
      return res.status(400).json({ error: 'E-mail é obrigatório.' });
    }

    console.log('DEBUG: E-mail final antes de createUser (valor e tipo):', finalEmail, typeof finalEmail);

    let userAuthData = null; // Dados do usuário da autenticação (auth.users)
    let userAuthError = null; // Erro da autenticação
    let temporaryPassword = generateTemporaryPassword(); // Gera a senha temporária

    try {
      // Tenta criar o usuário no Supabase Auth
      const authResult = await supabaseAdmin.auth.admin.createUser({
        email: finalEmail,
        password: temporaryPassword,
        email_confirm: true // Mantemos para que o usuário não precise confirmar e-mail
      });
      userAuthData = authResult.data;
      userAuthError = authResult.error;

      if (userAuthError) {
        if (userAuthError.message.includes('already been registered')) {
          console.warn(`DEBUG: Usuário ${finalEmail} já existe no Auth. Tentando buscar ID.`);
          // Se o usuário já existe, busca o ID para atualizar o perfil
          const { data: { users: existingUsers }, error: existingUserAuthError } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1,
            search: finalEmail
          });
          if (existingUserAuthError) {
            console.error('DEBUG: Erro ao buscar usuário existente por e-mail no Auth (listUsers):', existingUserAuthError.message);
            throw existingUserAuthError;
          }
          // listUsers retorna um array, esperamos apenas um usuário para um dado e-mail
          userAuthData = existingUsers && existingUsers.length > 0 ? { user: existingUsers[0] } : null;
          if (!userAuthData || !userAuthData.user) {
            console.error('DEBUG: Usuário existente não encontrado após listUsers para e-mail:', finalEmail);
            throw new Error('Usuário existente não encontrado após listUsers.');
          }
        } else {
          console.error('DEBUG: Erro ao criar usuário no Supabase Auth:', userAuthError.message);
          throw userAuthError; // Outro erro, lança para ser pego pelo catch
        }
      } else {
        console.log(`DEBUG: Usuário ${finalEmail} criado com sucesso no Supabase Auth com senha temporária.`);
      }

      // Agora, atualiza a tabela 'profiles' com o full_name
      if (userAuthData?.user?.id) {
        console.log(`DEBUG: Atualizando profile para user ID: ${userAuthData.user.id} com full_name: ${finalFullName}`);
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert({ id: userAuthData.user.id, full_name: finalFullName, email: finalEmail }, { onConflict: 'id' });

        if (profileError) {
          console.error('DEBUG: Erro ao atualizar profile com full_name:', profileError.message);
          throw profileError;
        }
        console.log(`DEBUG: Profile para user ID: ${userAuthData.user.id} atualizado com full_name.`);
      } else {
        console.warn('DEBUG: User ID não encontrado para atualizar o profile com full_name.');
      }

      // Retorna a senha temporária para o frontend
      res.status(200).json({
        message: 'Usuário criado com sucesso.',
        temporaryPassword: temporaryPassword,
        user: userAuthData?.user
      });

    } catch (error) {
      console.error('DEBUG: Erro geral na função serverless:', error.message);
      res.status(500).json({ error: 'Erro interno do servidor ao criar usuário.', details: error.message });
    }
  } else {
    // Se a requisição não for POST, retorna erro
    res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }
}