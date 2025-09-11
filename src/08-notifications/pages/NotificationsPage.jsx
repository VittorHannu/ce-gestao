import React, { useState, useEffect } from 'react';
import MainLayout from '@/01-shared/components/MainLayout';
import { supabase } from '@/01-shared/lib/supabase';
import { useToast } from '@/01-shared/hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '@/01-shared/components/ui/card';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom'; // New import
import PageHeader from '@/01-shared/components/PageHeader';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: 'Erro',
          description: 'Usuário não autenticado.',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('in_app_notifications')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: 'Erro',
          description: 'Falha ao carregar notificações.',
          variant: 'destructive'
        });
      } else {
        setNotifications(data);
      }
      setLoading(false);
    };
    fetchNotifications();
  }, [toast]);

  const markAsRead = async (id) => {
    const { error } = await supabase
      .from('in_app_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao marcar notificação como lida.',
        variant: 'destructive'
      });
    } else {
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, is_read: true, read_at: new Date().toISOString() } : notif))
      );
      toast({
        title: 'Sucesso',
        description: 'Notificação marcada como lida.'
      });
    }
  };

  const navigate = useNavigate(); // Initialize useNavigate

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
    case 'NEW_COMMENT':
      if (notification.payload?.relato_id) {
        navigate(`/relatos/detalhes/${notification.payload.relato_id}`);
      } else {
        toast({
          title: 'Erro',
          description: 'ID do relato não encontrado na notificação.',
          variant: 'destructive'
        });
      }
      break;
      // Add cases for other notification types here
    default:
      toast({
        title: 'Info',
        description: 'Tipo de notificação desconhecido ou sem ação de navegação.',
        variant: 'info'
      });
      break;
    }
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
    case 'NEW_COMMENT':
      return `Novo comentário no relato ${notification.payload?.relato_id}: "${notification.payload?.comment_text}"`;
      // Add other notification types here
    default:
      return `Nova notificação: ${notification.payload?.message || 'Sem detalhes.'}`;
    }
  };

  return (
    <MainLayout
      header={<PageHeader title="Minhas Notificações" />}
    >
      <div className="p-4">
        <div className="space-y-4">
          {loading ? (
            <p>Carregando notificações...</p>
          ) : notifications.length === 0 ? (
            <p>Você não tem notificações.</p>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer ${notification.is_read ? 'opacity-70' : 'border-l-4 border-blue-500'}`}
                onClick={() => handleNotificationClick(notification)} // Added onClick
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {notification.is_read ? 'Lida' : 'Não Lida'}
                  </CardTitle>
                  <span className="text-xs text-gray-500">
                    {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold">{getNotificationMessage(notification)}</p>
                  {/* Removed "Marcar como Lida" button as click handles it */}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;
