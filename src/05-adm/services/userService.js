



/*
 * Este arquivo de serviço é responsável por toda a comunicação com o backend (Supabase)
 * relacionada aos usuários. Ele encapsula a lógica para buscar todos os usuários,
 * criar um novo usuário e deletar um usuário existente.
 *
 * Visualmente, este arquivo não tem representação, mas é a ponte que permite que
 * a página de gerenciamento de usuários e o formulário de criação funcionem,
 * buscando e enviando dados para o banco de dados de forma segura e centralizada.
 */



import { supabase } from '@/01-shared/lib/supabase';
import { handleServiceError } from '@/01-shared/lib/errorUtils';

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, is_active, can_manage_relatos, can_view_users, can_create_users, can_delete_users')
    .order('full_name', { ascending: true });

  if (error) throw error;
  return data;
};

export const deleteUser = async (userId) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return handleServiceError('deleteUser', error);
  }
};

export const createUser = async (userData) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('DEBUG: Session before invoking Edge Function:', session);

    if (!session || !session.access_token) {
      throw new Error('Usuário não autenticado. Não é possível criar usuário.');
    }

    const { data: response, error: invokeError } = await supabase.functions.invoke('create-user', {
      body: JSON.stringify(userData),
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });
      

    if (invokeError) {
      throw new Error(`Erro ao invocar função Edge: ${invokeError.message}`);
    }

    // Verifica se a resposta da função Edge é nula ou indefinida
    if (!response) {
      throw new Error('Resposta vazia da função Edge. Verifique se a função foi implantada corretamente e está retornando uma resposta.');
    }

    // A resposta da função Edge já é o objeto parseado
    const result = response;

    if (result.error) {
      throw new Error(result.error);
    }

    return { data: result, error: null };
  } catch (error) {
    return handleServiceError('createUser', error);
  }
};

export const updateUserPlayerId = async (userId, playerId) => {
  if (!userId || !playerId) {
    console.warn('updateUserPlayerId: userId ou playerId não fornecido.');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ onesignal_player_id: playerId })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    console.log(`OneSignal Player ID atualizado para o usuário ${userId}`);
    return { data, error: null };
  } catch (error) {
    return handleServiceError('updateUserPlayerId', error);
  }
};