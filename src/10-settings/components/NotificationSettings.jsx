import { useState, useEffect } from 'react';
import OneSignal from 'react-onesignal';
import { supabase } from '@/01-shared/lib/supabase';
import { useUserProfile } from '@/04-profile/hooks/useUserProfile';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/01-shared/components/ui/label';
import { useToast } from '@/01-shared/hooks/useToast';

const NotificationSettings = () => {
  const { data: userProfile, refetch: refetchUserProfile } = useUserProfile();
  const [preferences, setPreferences] = useState(null);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const checkPushStatus = async () => {
      const isEnabled = await OneSignal.isPushNotificationsEnabled();
      setIsPushEnabled(isEnabled);
    };

    checkPushStatus();

    OneSignal.on('subscriptionChange', function (isSubscribed) {
      setIsPushEnabled(isSubscribed);
    });
  }, []);

  useEffect(() => {
    if (userProfile?.notification_preferences) {
      setPreferences(userProfile.notification_preferences);
    } else if (userProfile) {
      const defaultPreferences = {
        general_updates: true,
        new_report_assigned: true,
        new_comment_on_report: true,
        report_status_changed: true
      };
      setPreferences(defaultPreferences);
    }
  }, [userProfile]);

  const handlePreferenceChange = async (key, value) => {
    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: updatedPreferences })
        .eq('id', userProfile.id);

      if (error) throw error;
      showToast('Preferência de notificação atualizada!', 'success');
      refetchUserProfile();
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      showToast('Falha ao atualizar preferência.', 'error');
      setPreferences(userProfile.notification_preferences);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">Notificações do Navegador (Push)</h3>
        {isPushEnabled ? (
          <p className="text-sm text-green-600">
            As notificações por push neste navegador estão ativas.
          </p>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Para receber alertas em tempo real, ative as notificações.
            </p>
            <div className="onesignal-customlink-container"></div>
          </div>
        )}
      </div>

      {!preferences ? (
        <div>Carregando configurações de notificação...</div>
      ) : (
        <div className="p-4 border rounded-lg space-y-4">
          <h3 className="font-semibold">Tipos de Alerta</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="general_updates" className="flex-grow">Atualizações Gerais</Label>
            <Switch
              id="general_updates"
              checked={preferences.general_updates}
              onCheckedChange={(value) => handlePreferenceChange('general_updates', value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="new_report_assigned" className="flex-grow">Novo Relato Atribuído</Label>
            <Switch
              id="new_report_assigned"
              checked={preferences.new_report_assigned}
              onCheckedChange={(value) => handlePreferenceChange('new_report_assigned', value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="new_comment_on_report" className="flex-grow">Novo Comentário em Relato</Label>
            <Switch
              id="new_comment_on_report"
              checked={preferences.new_comment_on_report}
              onCheckedChange={(value) => handlePreferenceChange('new_comment_on_report', value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="report_status_changed" className="flex-grow">Status do Relato Alterado</Label>
            <Switch
              id="report_status_changed"
              checked={preferences.report_status_changed}
              onCheckedChange={(value) => handlePreferenceChange('report_status_changed', value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
