
import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePresence as useSupabasePresence } from '@/01-shared/hooks/usePresence';
import { supabase } from '../lib/supabase';

const PresenceContext = createContext();

export function PresenceProvider({ children }) {
  const [session, setSession] = useState(null);

  // Apenas ativa o hook de presença se houver uma sessão
  const hasSession = !!session;
  const { onlineUsers, loading } = useSupabasePresence(hasSession);

  useEffect(() => {
    // Carrega a sessão inicial para evitar piscar a tela
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Ouve as mudanças de autenticação (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <PresenceContext.Provider value={{ onlineUsers, loading }}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  const context = useContext(PresenceContext);
  if (context === undefined) {
    throw new Error('usePresence must be used within a PresenceProvider');
  }
  return context;
}
