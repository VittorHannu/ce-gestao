
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const CHANNEL_NAME = 'online-users';

export function usePresence(enabled = true) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  // Usamos uma ref para evitar recriar o canal em cada renderização
  const channelRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const createAndSubscribe = async () => {
      // Pega o usuário logado de forma assíncrona e segura
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Cria o canal com a chave de presença baseada no ID do usuário para garantir unicidade
      const channel = supabase.channel(CHANNEL_NAME, {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      channelRef.current = channel;

      channel
        .on('presence', { event: 'sync' }, () => {
          const presenceState = channel.presenceState();
          const users = Object.keys(presenceState)
            .map((presenceId) => presenceState[presenceId][0])
            .filter(user => user.user_id);
          setOnlineUsers(users);
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          setOnlineUsers(prevUsers => [...prevUsers, ...newPresences]);
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          const leftUserIds = leftPresences.map(p => p.user_id);
          setOnlineUsers(prevUsers => prevUsers.filter(u => !leftUserIds.includes(u.user_id)));
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Anuncia a presença do usuário no canal
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
          }
        });
    };

    createAndSubscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled]);

  return { onlineUsers };
}
