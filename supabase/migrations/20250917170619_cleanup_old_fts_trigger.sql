
-- Remove the leftover trigger that was trying to update a non-existent column.
DROP TRIGGER IF EXISTS relatos_fts_update_trigger ON public.relatos;

-- Remove the associated function that the trigger was calling.
DROP FUNCTION IF EXISTS public.update_relatos_fts();
