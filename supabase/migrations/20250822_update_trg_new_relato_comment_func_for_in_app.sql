-- supabase/migrations/20250822_update_trg_new_relato_comment_func_for_in_app.sql

CREATE OR REPLACE FUNCTION public.trg_new_relato_comment_func()
RETURNS TRIGGER AS $$
DECLARE
    relato_owner_id UUID;
    responsible_user_id UUID;
    commenter_id UUID;
    notification_payload JSONB;
BEGIN
    -- Get the ID of the user who made the comment
    commenter_id := NEW.user_id;

    -- Get the owner of the relato
    SELECT user_id INTO relato_owner_id FROM public.relatos WHERE id = NEW.relato_id;

    -- Prepare the common notification payload
    notification_payload := jsonb_build_object(
        'relato_id', NEW.relato_id,
        'comment_id', NEW.id,
        'commenter_id', NEW.user_id,
        'comment_text', NEW.comment_text
    );

    -- Enqueue push notification and in-app notification for the relato owner, if they are not the commenter
    IF relato_owner_id IS NOT NULL AND relato_owner_id != commenter_id THEN
        PERFORM public.enqueue_notification(
            relato_owner_id,
            'NEW_COMMENT',
            notification_payload
        );
        PERFORM public.enqueue_in_app_notification(
            relato_owner_id,
            'NEW_COMMENT',
            notification_payload
        );
    END IF;

    -- Enqueue push notification and in-app notification for responsible users, if they are not the commenter or the relato owner
    FOR responsible_user_id IN
        SELECT user_id FROM public.relato_responsaveis WHERE relato_id = NEW.relato_id
    LOOP
        IF responsible_user_id IS NOT NULL AND responsible_user_id != commenter_id AND responsible_user_id != relato_owner_id THEN
            PERFORM public.enqueue_notification(
                responsible_user_id,
                'NEW_COMMENT',
                notification_payload
            );
            PERFORM public.enqueue_in_app_notification(
                responsible_user_id,
                'NEW_COMMENT',
                notification_payload
            );
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
