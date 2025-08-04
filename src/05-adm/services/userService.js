



/*
 * Este arquivo de serviço é responsável por toda a comunicação com o backend (Supabase)
 * relacionada aos usuários. Ele encapsula a lógica para buscar todos os usuários,
 * criar um novo usuário e deletar um usuário existente.
 *
 * Visualmente, este arquivo não tem representação, mas é a ponte que permite que
 * a página de gerenciamento de usuários e o formulário de criação funcionem,
 * buscando e enviando dados para o banco de dados de forma segura e centralizada.
 */



import { supabase } from '@/01-common/lib/supabase';
import { handleServiceError } from '@/01-common/lib/errorUtils';

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, is_active, needs_password_reset, can_manage_relatos, can_view_users, can_create_users, can_delete_users')
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
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: JSON.stringify(userData)
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return handleServiceError('createUser', error);
  }
};