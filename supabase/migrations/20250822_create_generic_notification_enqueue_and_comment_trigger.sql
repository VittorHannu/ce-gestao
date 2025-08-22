-- supabase/migrations/20250822_create_generic_notification_enqueue_and_comment_trigger.sql

-- 1. Generic function to enqueue a notification
-- This function will be called by specific trigger functions for various events.
CREATE OR REPLACE FUNCTION public.enqueue_notification(
    p_recipient_user_id UUID,
    p_notification_type TEXT,
    p_payload JSONB
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.notification_queue (recipient_user_id, notification_type, payload)
    VALUES (p_recipient_user_id, p_notification_type, p_payload);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Specific trigger function for new comments
-- This function determines who should be notified about a new comment and calls enqueue_notification.
CREATE OR REPLACE FUNCTION public.trg_new_relato_comment_func()
RETURNS TRIGGER AS $$
DECLARE
    relato_owner_id UUID;
    responsible_user_id UUID;
    commenter_id UUID;
BEGIN
    -- Get the ID of the user who made the comment
    commenter_id := NEW.user_id;

    -- Get the owner of the relato
    SELECT user_id INTO relato_owner_id FROM public.relatos WHERE id = NEW.relato_id;

    -- Enqueue notification for the relato owner, if they are not the commenter
    IF relato_owner_id IS NOT NULL AND relato_owner_id != commenter_id THEN
        PERFORM public.enqueue_notification(
            relato_owner_id,
            'NEW_COMMENT',
            jsonb_build_object(
                'relato_id', NEW.relato_id,
                'comment_id', NEW.id,
                'commenter_id', NEW.user_id,
                'comment_text', NEW.comment_text
            )
        );
    END IF;

    -- Enqueue notifications for responsible users, if they are not the commenter or the relato owner
    FOR responsible_user_id IN
        SELECT user_id FROM public.relato_responsaveis WHERE relato_id = NEW.relato_id
    LOOP
        IF responsible_user_id IS NOT NULL AND responsible_user_id != commenter_id AND responsible_user_id != relato_owner_id THEN
            PERFORM public.enqueue_notification(
                responsible_user_id,
                'NEW_COMMENT',
                jsonb_build_object(
                    'relato_id', NEW.relato_id,
                    'comment_id', NEW.id,
                    'commenter_id', NEW.user_id,
                    'comment_text', NEW.comment_text
                )
            );
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger to call the specific trigger function after a new comment is inserted
CREATE TRIGGER trg_new_relato_comment
AFTER INSERT ON public.relato_comentarios
FOR EACH ROW EXECUTE FUNCTION public.trg_new_relato_comment_func();
