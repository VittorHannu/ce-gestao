set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.enqueue_in_app_notification(p_recipient_user_id uuid, p_notification_type text, p_payload jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO public.in_app_notifications (user_id, type, payload)
    VALUES (p_recipient_user_id, p_notification_type, p_payload);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.enqueue_notification(p_recipient_user_id uuid, p_notification_type text, p_payload jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO public.notification_queue (recipient_user_id, notification_type, payload)
    VALUES (p_recipient_user_id, p_notification_type, p_payload);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_claim(claim text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN nullif(current_setting('request.jwt.claims', true), '')::jsonb->claim;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.has_permission(permission_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  claim_value JSONB;
BEGIN
  claim_value := public.get_my_claim(permission_name);
  IF claim_value IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN claim_value::boolean;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.trg_new_relato_comment_func()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

grant insert on table "public"."relatos" to PUBLIC;


