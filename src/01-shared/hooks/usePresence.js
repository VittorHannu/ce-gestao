
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CHANNEL_NAME = 'online-users';

export function usePresence() {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const channel = supabase.channel(CHANNEL_NAME, {
      config: {
        presence: {
          key: '', // Let Supabase assign a unique key
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users = Object.keys(presenceState)
          .map((presenceId) => {
            const presences = presenceState[presenceId];
            return presences[0]; // Assuming one presence per user
          })
          .filter(user => user.user_id); // Filter out entries without a user_id
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const user = supabase.auth.getUser();
          if (user) {
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { onlineUsers };
}
