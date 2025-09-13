import { supabase } from '@/01-shared/lib/supabase';

const ITEMS_PER_PAGE = 20;

export const fetchAuditLogs = async ({ page = 1, filters = {} }) => {
  let query = supabase
    .from('audit_logs')
    .select(`
      id,
      created_at,
      action,
      table_name,
      record_id,
      old_record,
      new_record,
      author:profiles (
        full_name,
        email
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false });

  // Lógica de paginação
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  query = query.range(from, to);

  // Lógica de filtros (exemplo)
  if (filters.action) {
    query = query.eq('action', filters.action);
  }
  if (filters.authorId) {
    query = query.eq('user_id', filters.authorId);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching audit logs:', error);
    throw new Error(error.message);
  }

  return { data, count };
};
