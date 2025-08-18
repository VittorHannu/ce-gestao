// src/01-shared/lib/pushNotifications.js

import { supabase } from '@/01-shared/lib/supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_APP_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported.');
    return null;
  }
  if (!('PushManager' in window)) {
    console.warn('Push API not supported.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.log('No existing subscription, creating a new one...');
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });
      console.log('New push subscription created:', subscription);

      // Send subscription to your backend (Supabase Edge Function)
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        console.error('User not authenticated. Cannot save push subscription.');
        return null;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.access_token) {
        console.error('No active session or access token found. Cannot save push subscription.');
        return null;
      }
      const response = await fetch(`${import.meta.env.VITE_APP_SUPABASE_EDGE_FUNCTIONS_URL}/subscribe-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          user_id: user.data.user.id,
          subscription_data: subscription.toJSON()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error saving subscription via Edge Function:', errorData);
        return null;
      }
      const responseData = await response.json();
      console.log('Subscription saved via Edge Function:', responseData);

    } else {
      console.log('Existing push subscription:', subscription);
    }
    return subscription;

  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

export async function unsubscribeUserFromPush() {
  if (!('serviceWorker' in navigator && 'PushManager' in window)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('User unsubscribed from push notifications.');

      // Remove subscription from your backend (Supabase Edge Function)
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', (await supabase.auth.getUser()).data.user.id)
        .eq('subscription_data', subscription.toJSON()); // This might need adjustment based on how you store/match subscriptions

      if (error) {
        console.error('Error removing subscription from DB:', error);
      }
    }
  } catch (error) {
    console.error('Error unsubscribing:', error);
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications.');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  console.log('Notification permission:', permission);
  return permission;
}
