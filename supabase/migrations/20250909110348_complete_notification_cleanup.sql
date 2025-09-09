-- This migration completely removes all database objects related to the old, custom push notification system.

-- Drop tables
-- These tables stored in-app messages, the queue for sending notifications, and the push subscriptions.
DROP TABLE IF EXISTS public.in_app_notifications CASCADE;
DROP TABLE IF EXISTS public.notification_queue CASCADE;
DROP TABLE IF EXISTS public.push_subscriptions CASCADE;

-- Drop functions
-- These functions were responsible for enqueuing, handling, and sending notifications.
DROP FUNCTION IF EXISTS public.enqueue_in_app_notification(uuid, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.enqueue_notification(uuid, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_relato_notification() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_responsavel_notification() CASCADE;
DROP FUNCTION IF EXISTS public.send_push_notification(jsonb, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_in_app_notification_push() CASCADE; -- From a previous cleanup attempt

-- Drop column from profiles table
-- This column stored user preferences for the old notification system.
ALTER TABLE public.profiles DROP COLUMN IF EXISTS notification_preferences;

