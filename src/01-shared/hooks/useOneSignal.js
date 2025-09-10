import { useEffect } from 'react';
import { supabase } from '@/01-shared/lib/supabase';
import {
  initOneSignal,
  getOneSignalUserId,
  loginOneSignal,
  logoutOneSignal,
} from '@/01-shared/lib/oneSignal';
import { updateUserPlayerId } from '@/05-adm/services/userService';

export const useOneSignal = () => {
  useEffect(() => {
    const handleUserSession = async (session) => {
      try {
        const oneSignalInitialized = await initOneSignal();
        if (!oneSignalInitialized) {
          console.error('useOneSignal: Falha ao inicializar OneSignal, o fluxo de identificação do usuário será abortado.');
          return;
        }

        if (session) {
          // Usuário logado
          const supabaseUserId = session.user.id;
          await loginOneSignal(supabaseUserId);
          const oneSignalId = await getOneSignalUserId();
          if (oneSignalId) {
            await updateUserPlayerId(supabaseUserId, oneSignalId);
          }
        } else {
          // Usuário deslogado
          await logoutOneSignal();
        }
      } catch (error) {
        console.error("useOneSignal: Erro no fluxo de identificação do OneSignal:", error);
      }
    };

    // Lida com a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserSession(session);
    });

    // Lida com mudanças de estado (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Array de dependências vazio garante que o efeito rode apenas uma vez
};
