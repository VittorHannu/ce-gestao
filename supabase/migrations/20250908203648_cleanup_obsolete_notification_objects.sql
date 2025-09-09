-- This migration removes obsolete database objects related to the old push notification system.

-- 1. Drop the old trigger that was replaced by the Edge Function trigger.
DROP TRIGGER IF EXISTS on_new_in_app_notification_send_push ON public.in_app_notifications;

-- 2. Drop the old database function that the trigger used to call.
DROP FUNCTION IF EXISTS public.handle_new_in_app_notification_push();

-- 3. Drop the old table that stored push subscriptions manually.
-- The new system relies on OneSignal to manage subscriptions.
DROP TABLE IF EXISTS public.push_subscriptions;
