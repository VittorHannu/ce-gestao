import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/01-shared/lib/supabase';
import { useToast } from '@/01-shared/hooks/useToast';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, is_active, can_manage_relatos, can_view_users, can_create_users, can_delete_users, can_view_feedbacks')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows found

      if (data) {
        setUser(data);
        return data;
      } else {
        // No profile found, create one
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: authUser?.email || '',
            full_name: authUser?.user_metadata?.full_name || authUser?.email || 'Novo Usuário'
          })
          .select()
          .single();

        if (createError) throw createError;
        
        setUser(newProfile);
        toast({ title: 'Perfil criado com sucesso!', type: 'success' });
        return newProfile;
      }
    } catch (err) {
      console.error('Erro ao buscar ou criar perfil:', err);
      toast({ title: 'Erro ao carregar dados do perfil.', type: 'error' });
      setError(err);
      return null;
    }
  }, [toast]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    toast({ title: 'Você foi desconectado.', type: 'info' });
  }, [toast]);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  return { session, user, loading, error, handleLogout, retryFetchProfile: fetchUserProfile };
}
