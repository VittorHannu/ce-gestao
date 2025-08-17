-- Por favor, copie TODO o conteúdo deste arquivo, cole no SQL Editor do seu painel Supabase e clique em 'RUN'.
-- Migration: Setup tables for Push Notifications

-- 1. Create the table to store push subscriptions
CREATE TABLE public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_subscription UNIQUE (user_id, subscription_data)
);

COMMENT ON TABLE public.push_subscriptions IS 'Stores push notification subscription data for each user device.';

-- 2. Enable Row Level Security
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Define RLS policies
CREATE POLICY "Allow users to manage their own push subscriptions"
ON public.push_subscriptions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Add notification preferences column to the profiles table
ALTER TABLE public.profiles
ADD COLUMN notification_preferences JSONB 
DEFAULT '{
    "new_report_assigned": true,
    "new_comment_on_report": true,
    "report_status_changed": true,
    "general_updates": true
}'::jsonb;

COMMENT ON COLUMN public.profiles.notification_preferences IS 'User preferences for receiving different types of notifications.';
