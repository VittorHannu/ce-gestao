import { useState, useEffect } from 'react';

const NotificationSettings = () => {
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  useEffect(() => {
    const OneSignal = window.OneSignal || [];
    OneSignal.push(function() {
      OneSignal.isPushNotificationsEnabled(function(isEnabled) {
        setIsPushEnabled(isEnabled);
      });
      OneSignal.on('subscriptionChange', function(isSubscribed) {
        setIsPushEnabled(isSubscribed);
      });
    });
  }, []);

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
    </div>
  );
};

export default NotificationSettings;
