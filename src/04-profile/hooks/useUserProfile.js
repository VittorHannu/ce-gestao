import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/01-shared/lib/supabase';

const fetchUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, is_active, can_manage_relatos, can_view_users, can_create_users, can_delete_users, can_view_feedbacks, can_delete_relatos, can_view_audit_logs, can_manage_classifications')
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