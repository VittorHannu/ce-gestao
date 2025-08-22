-- supabase/migrations/20250822_create_in_app_notifications_table.sql

CREATE TABLE public.in_app_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  payload jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamp with time zone,
  CONSTRAINT in_app_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT in_app_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Add RLS policies
ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own in-app notifications" ON public.in_app_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own in-app notifications" ON public.in_app_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Optional: Users can delete their own in-app notifications
CREATE POLICY "Users can delete their own in-app notifications" ON public.in_app_notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Optional: Users cannot insert directly, only via functions/triggers
-- CREATE POLICY "Users cannot insert directly into in_app_notifications" ON public.in_app_notifications
--   FOR INSERT WITH CHECK (false);
