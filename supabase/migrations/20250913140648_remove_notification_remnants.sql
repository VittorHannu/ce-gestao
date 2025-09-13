-- Remove remnants of the old notification system

-- 1. Drop the trigger on the comments table
DROP TRIGGER IF EXISTS trg_new_relato_comment ON public.relato_comentarios;

-- 2. Drop the trigger function
DROP FUNCTION IF EXISTS public.trg_new_relato_comment_func();

-- 3. Drop the unused notification functions
-- The function signatures are based on the previous error and schema analysis.
DROP FUNCTION IF EXISTS public.enqueue_notification(uuid, text, jsonb);
DROP FUNCTION IF EXISTS public.enqueue_in_app_notification(uuid, text, jsonb);
