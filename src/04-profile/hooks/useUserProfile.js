/*
 * Este hook React personalizado (`useUserProfile`) é responsável por buscar
 * e gerenciar os dados do perfil do usuário logado. Ele combina as informações
 * de autenticação do Supabase com os dados adicionais armazenados na tabela 'profiles'.
 *
 * Visualmente no seu site, este hook não é visível diretamente. No entanto, ele é
 * fundamental para qualquer parte do aplicativo que precise exibir ou utilizar
 * informações detalhadas sobre o usuário atual, como o nome completo, permissões
 * ou outros dados de perfil. Ele garante que esses dados estejam disponíveis
 * e sejam mantidos em cache para um desempenho eficiente.
 *
 *
 *
 *
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/01-common/lib/supabase';

/**
 * Hook para buscar o perfil do usuário logado.
 * Combina os dados de autenticação (supabase.auth.user) com os dados da tabela 'profiles'.
 * Utiliza o React Query para cache global.
 */
export const useUserProfile = () => {
  const fetchProfile = async () => {
    // 1. Busca o usuário da sessão de autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(authError.message);
    if (!user) return null;

    // 2. Busca o perfil correspondente na tabela 'profiles'
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Se o perfil não for encontrado (PGRST116), não é um erro,
    // apenas significa que é um novo usuário. Retornamos os dados básicos.
    if (profileError && profileError.code !== 'PGRST116') {
      throw new Error(profileError.message);
    }

    // 3. Combina os dados de autenticação com os do perfil
    // O objeto do perfil (se existir) sobrescreve os dados de autenticação em caso de conflito.
    return { ...user, ...profile };
  };

  return useQuery({
    queryKey: ['userProfile'], // Chave de cache global para o perfil do usuário
    queryFn: fetchProfile,
    staleTime: 1000 * 60 * 5 // Mantém os dados frescos por 5 minutos
  });
};
