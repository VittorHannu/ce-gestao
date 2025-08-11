ALTER TABLE public.profiles
ADD COLUMN can_delete_any_comment BOOLEAN DEFAULT FALSE;
