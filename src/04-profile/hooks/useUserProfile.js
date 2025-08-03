import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/01-common/lib/supabase';

const fetchUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const useUserProfile = () => {
  return useQuery({ queryKey: ['userProfile'], queryFn: fetchUserProfile });
};