-- supabase/migrations/20250822_create_enqueue_in_app_notification_function.sql

CREATE OR REPLACE FUNCTION public.enqueue_in_app_notification(
    p_recipient_user_id UUID,
    p_notification_type TEXT,
    p_payload JSONB
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.in_app_notifications (user_id, type, payload)
    VALUES (p_recipient_user_id, p_notification_type, p_payload);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
