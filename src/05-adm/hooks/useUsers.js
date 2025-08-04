import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/01-common/lib/supabase';



const fetchUsers = async (searchTerm, filterNeedsPasswordReset) => {
  let query = supabase
    .from('profiles')
    .select('id, email, full_name, is_active, can_manage_relatos, can_view_users, can_create_users, can_delete_users')
    .order('full_name', { ascending: true });

  if (searchTerm) {
    query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
  }

  if (filterNeedsPasswordReset) {
    
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

export const useUsers = (searchTerm) => {
  return useQuery({
    queryKey: ['users', searchTerm, filterNeedsPasswordReset],
    queryFn: () => fetchUsers(searchTerm, filterNeedsPasswordReset),
    staleTime: 1000 * 60 * 5, // Dados considerados "frescos" por 5 minutos
    keepPreviousData: true // Mantém os dados anteriores enquanto busca novos
  });
};
