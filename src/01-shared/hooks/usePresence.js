
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const CHANNEL_NAME = 'online-users';

export function usePresence(enabled = true) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const createAndSubscribe = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      const channel = supabase.channel(CHANNEL_NAME, {
        config: {
          presence: {
            key: user.id
          }
        }
      });

      channelRef.current = channel;

      channel
        .on('presence', { event: 'sync' }, () => {
          if (!isMounted) return;
          const presenceState = channel.presenceState();
          const users = Object.keys(presenceState)
            .map((presenceId) => presenceState[presenceId][0])
            .filter(u => u.user_id);
          setOnlineUsers(users);
          setLoading(false);
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          if (!isMounted) return;
          setOnlineUsers(prevUsers => {
            const newUsers = newPresences.filter(p => !prevUsers.some(u => u.user_id === p.user_id));
            return [...prevUsers, ...newUsers];
          });
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          if (!isMounted) return;
          const leftUserIds = leftPresences.map(p => p.user_id);
          setOnlineUsers(prevUsers => prevUsers.filter(u => !leftUserIds.includes(u.user_id)));
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString()
            });
          }
        });
    };

    createAndSubscribe();

    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled]);

  return { onlineUsers, loading };
}
